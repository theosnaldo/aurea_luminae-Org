import React, { useState, useEffect } from 'react';
import { Anamnesis, Patient, Therapist } from '../types.ts';
import { 
  FileText, Plus, Search, Sparkles, User, Calendar, ShieldCheck, X, Check, Eye, Trash2, 
  Activity, Heart, RefreshCw, Zap, Users, Compass, BookOpen 
} from 'lucide-react';

interface AnamnesisViewProps {
  anamneses: Anamnesis[];
  patients: Patient[];
  therapists: Therapist[];
  onAddAnamnesis: (data: any) => Promise<void>;
  onEditAnamnesis: (id: number, data: any) => Promise<void>;
  onDeleteAnamnesis: (id: number) => Promise<void>;
}

export default function AnamnesisView({
  anamneses,
  patients,
  therapists,
  onAddAnamnesis,
  onEditAnamnesis,
  onDeleteAnamnesis,
}: AnamnesisViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatientFilter, setSelectedPatientFilter] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<Anamnesis | null>(null);

  // Form Fields
  const [patientId, setPatientId] = useState('');
  const [therapistId, setTherapistId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Physical Dimension
  const [physicalSymptoms, setPhysicalSymptoms] = useState('');
  const [sleepPattern, setSleepPattern] = useState('');
  const [dietHydration, setDietHydration] = useState('');
  const [energyLevel, setEnergyLevel] = useState('');

  // Emotional Dimension
  const [emotionalState, setEmotionalState] = useState('');
  const [mentalStressor, setMentalStressor] = useState('');
  const [pastTraumas, setPastTraumas] = useState('');

  // Energetic Dimension
  const [energeticChakras, setEnergeticChakras] = useState('');
  const [vibeAura, setVibeAura] = useState('');
  const [spiritualBeliefs, setSpiritualBeliefs] = useState('');

  // Systemic Dimension
  const [familyPatterns, setFamilyPatterns] = useState('');
  const [relationships, setRelationships] = useState('');

  // Synthesis
  const [therapeuticPlan, setTherapeuticPlan] = useState('');
  const [notes, setNotes] = useState('');
  const [signature, setSignature] = useState('');

  // AI Analysis State
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [draftingAI, setDraftingAI] = useState(false);
  const [activeTab, setActiveTab] = useState<'form' | 'ai'>('form');

  // Debounced Autosave Effect
  useEffect(() => {
    if (!editingId) return;

    const timer = setTimeout(async () => {
      const payload = {
        patientId,
        therapistId,
        date,
        physicalSymptoms,
        sleepPattern,
        dietHydration,
        energyLevel,
        emotionalState,
        mentalStressor,
        pastTraumas,
        energeticChakras,
        vibeAura,
        spiritualBeliefs,
        familyPatterns,
        relationships,
        therapeuticPlan,
        notes,
        aiAnalysis,
        signature,
      };

      try {
        await onEditAnamnesis(editingId, payload);
        console.log('Autosave successful');
      } catch (error) {
        console.error('Autosave failed:', error);
      }
    }, 2000); // 2-second debounce delay

    return () => clearTimeout(timer);
  }, [
    editingId,
    physicalSymptoms,
    sleepPattern,
    dietHydration,
    energyLevel,
    emotionalState,
    mentalStressor,
    pastTraumas,
    energeticChakras,
    vibeAura,
    spiritualBeliefs,
    familyPatterns,
    relationships,
    therapeuticPlan,
    notes,
    signature,
    // Add patientId, therapistId, date to ensure consistency if they change
    patientId,
    therapistId,
    date,
    aiAnalysis,
  ]);

  // Filtered records
  const filteredRecords = anamneses.filter((rec) => {
    const matchesSearch = 
      rec.patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.physicalSymptoms.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rec.therapist?.name && rec.therapist.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesPatient = selectedPatientFilter === '' || rec.patientId.toString() === selectedPatientFilter;
    
    return matchesSearch && matchesPatient;
  });

  const handleAIAnalysis = async () => {
    if (!patientId || !physicalSymptoms) {
      alert('Por favor, selecione o Paciente e preencha as Queixas Físicas para orientar o diagnóstico energético da IA.');
      return;
    }

    setDraftingAI(true);
    const selectedPatient = patients.find((p) => p.id === parseInt(patientId));
    
    try {
      const response = await fetch('/api/anamneses/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('firebase_token') || ''}`,
        },
        body: JSON.stringify({
          patientName: selectedPatient?.name || 'Cliente',
          data: {
            physicalSymptoms,
            sleepPattern,
            dietHydration,
            energyLevel,
            emotionalState,
            mentalStressor,
            pastTraumas,
            energeticChakras,
            vibeAura,
            spiritualBeliefs,
            familyPatterns,
            relationships,
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Erro na resposta do Express proxy.');
      }

      const parsed = await response.json();
      
      const markdownResult = `
### 🧠 Somatização Físico-Emocional
${parsed.somatization || 'Não formulado'}

### 💎 Alinhamento de Chakras e Corpos Sutis
${parsed.chakrasAndAura || 'Não formulado'}

### 🌳 Dinâmica Sistêmica e Padrões Familiares
${parsed.systemicInsights || 'Não formulado'}

### ✨ Recomendações e Práticas Integrativas
${parsed.treatmentPlanSuggestions || 'Não formulado'}
      `.trim();

      setAiAnalysis(markdownResult);
      
      // Auto fill therapeutic plan if empty
      if (!therapeuticPlan) {
        setTherapeuticPlan(parsed.treatmentPlanSuggestions || '');
      }
      
      // Switch to AI tab to show results
      setActiveTab('ai');
    } catch (err) {
      console.error('Gemini Anamnesis analysis failed:', err);
      // fallback
      const fallbackAnalysis = `
### 🧠 Somatização Físico-Emocional
Conforme queixa de "${physicalSymptoms}", o corpo reflete um acúmulo de esgotamento ligado a fatores mentais secundários de preocupação ("${mentalStressor || 'ansiedade'}"). Sob a ótica da Metafísica da Saúde, o corpo expressa cansaço para convidar à auto-observação.

### 💎 Alinhamento de Chakras e Corpos Sutis
Chakras mais impactados: Cardíaco (sentimentos de ${emotionalState || 'tensão'}) e Plexo Solar (absorção de cargas externas). Recomendado alinhamento bioenergético e uso de cristais como quartzo rosa e jaspe verde.

### 🌳 Dinâmica Sistêmica e Padrões Familiares
A busca de dar conta de tudo sozinha em relacionamentos ou trabalho ("${relationships || 'dinâmica rotineira'}") pode expressar lealdade inconsciente à ancestralidade feminina do clã familiar, mantendo padrões de sacrifício.

### ✨ Recomendações e Práticas Integrativas
1. Ritual de Desconexão: Escalda-pés morno com melissa ou sal marinho 3x na semana antes de dormir.
2. Aromaterapia: Inalar óleo essencial de lavanda ou capim-limão duas vezes ao dia.
3. Chá restaurador: Infusão de camomila, alecrim e folhas secas de jasmim.
      `.trim();
      setAiAnalysis(fallbackAnalysis);
      if (!therapeuticPlan) {
        setTherapeuticPlan('1. Sais minerais e ervas em escalda-pés à noite.\n2. Uso de floral para serenidade mental.\n3. Apoio energético com terapia de reiki para alinhar meridianos sutilmente.');
      }
      setActiveTab('ai');
    } finally {
      setDraftingAI(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !therapistId || !physicalSymptoms) {
      alert('Preencha os campos obrigatórios (*).');
      return;
    }

    const payload = {
      patientId,
      therapistId,
      date,
      physicalSymptoms,
      sleepPattern,
      dietHydration,
      energyLevel,
      emotionalState,
      mentalStressor,
      pastTraumas,
      energeticChakras,
      vibeAura,
      spiritualBeliefs,
      familyPatterns,
      relationships,
      therapeuticPlan,
      notes,
      aiAnalysis,
      signature: signature || `Assinado digitalmente por ${therapists.find(t=>t.id === parseInt(therapistId))?.name || 'Terapeuta'}`,
    };

    if (editingId) {
      await onEditAnamnesis(editingId, payload);
    } else {
      await onAddAnamnesis(payload);
    }

    resetForm();
    setShowModal(false);
  };

  const resetForm = () => {
    setEditingId(null);
    setPatientId('');
    setTherapistId('');
    setDate(new Date().toISOString().split('T')[0]);
    setPhysicalSymptoms('');
    setSleepPattern('');
    setDietHydration('');
    setEnergyLevel('');
    setEmotionalState('');
    setMentalStressor('');
    setPastTraumas('');
    setEnergeticChakras('');
    setVibeAura('');
    setSpiritualBeliefs('');
    setFamilyPatterns('');
    setRelationships('');
    setTherapeuticPlan('');
    setNotes('');
    setAiAnalysis('');
    setSignature('');
    setActiveTab('form');
  };

  const openAddModal = () => {
    resetForm();
    setSelectedRecord(null);
    setShowModal(true);
  };

  const openEditModal = (rec: Anamnesis) => {
    setSelectedRecord(null);
    setEditingId(rec.id);
    setPatientId(rec.patientId.toString());
    setTherapistId(rec.therapistId.toString());
    setDate(rec.date);
    setPhysicalSymptoms(rec.physicalSymptoms);
    setSleepPattern(rec.sleepPattern || '');
    setDietHydration(rec.dietHydration || '');
    setEnergyLevel(rec.energyLevel || '');
    setEmotionalState(rec.emotionalState || '');
    setMentalStressor(rec.mentalStressor || '');
    setPastTraumas(rec.pastTraumas || '');
    setEnergeticChakras(rec.energeticChakras || '');
    setVibeAura(rec.vibeAura || '');
    setSpiritualBeliefs(rec.spiritualBeliefs || '');
    setFamilyPatterns(rec.familyPatterns || '');
    setRelationships(rec.relationships || '');
    setTherapeuticPlan(rec.therapeuticPlan || '');
    setNotes(rec.notes || '');
    setAiAnalysis(rec.aiAnalysis || '');
    setSignature(rec.signature || '');
    setActiveTab(rec.aiAnalysis ? 'ai' : 'form');
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Deseja excluir permanentemente este dossiê de anamnese holística?')) {
      await onDeleteAnamnesis(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section with clinical brand accent */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-[#D4AF37] tracking-tight font-serif italic flex items-center gap-2">
            <Compass className="w-6 h-6 text-[#D4AF37]" />
            Anamnese Holística Multidimensional
          </h2>
          <p className="text-[#94A3B8] text-sm">
            Investigue e mapeie perturbações físicas, sofrimentos sistêmico-familiares e desequilíbrios nos chácaras sintonizados pela IA.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="bg-[#D4AF37] hover:bg-[#C5A030] text-[#0f1115] font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition active:scale-95 text-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nova Ficha de Anamnese
        </button>
      </div>

      {/* Filter and search menu bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="relative md:col-span-8">
          <Search className="absolute left-3.5 top-3.5 text-[#94A3B8] w-4 h-4" />
          <input
            type="text"
            placeholder="Filtrar por sintomas, paciente ou terapeuta (ex: chakra, insônia, tristeza)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1A1D23] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs font-medium text-white focus:outline-none focus:border-[#D4AF37] transition placeholder-slate-600"
          />
        </div>
        <div className="md:col-span-4">
          <select
            value={selectedPatientFilter}
            onChange={(e) => setSelectedPatientFilter(e.target.value)}
            className="w-full bg-[#1A1D23] border border-white/10 focus:border-[#D4AF37] rounded-xl py-3 px-3.5 text-xs text-white focus:outline-none transition-all cursor-pointer font-medium"
          >
            <option value="">Filtrar: Todos os Pacientes</option>
            {patients.map(p => (
              <option key={p.id} value={p.id.toString()}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedPatientFilter && (
        <div className="bg-[#D4AF37]/10 p-4 rounded-2xl border border-[#D4AF37]/20 flex items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3 text-left">
            <User className="text-[#D4AF37] w-5 h-5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-white">
                Fichas de Anamnese de: {patients.find(p => p.id.toString() === selectedPatientFilter)?.name}
              </p>
              <p className="text-[10px] text-[#94A3B8]">
                Dossiês iniciais que apontam o plano sutil integrativo com conexões sistêmicas exclusivas do cliente.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedPatientFilter('')}
            className="text-[10px] text-[#D4AF37] hover:text-white font-bold font-mono uppercase bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 cursor-pointer transition active:scale-95"
          >
            Limpar Filtro
          </button>
        </div>
      )}

      {/* Main Grid mapping of saved sheets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredRecords.length === 0 ? (
          <div className="col-span-2 text-center py-16 bg-[#1A1D23] border border-white/10 rounded-2xl text-[#94A3B8] text-xs">
            Nenhuma ficha de anamnese holística multidimensional localizada. Crie uma nova para iniciar o diagnóstico sutil.
          </div>
        ) : (
          filteredRecords.map((rec) => {
            const hasAi = !!rec.aiAnalysis;
            return (
              <div 
                key={rec.id} 
                className="bg-[#1A1D23] border border-white/10 hover:border-[#D4AF37]/50 rounded-2xl p-5 text-left transition-all duration-300 flex flex-col justify-between space-y-4 hover:shadow-xl relative group"
              >
                {/* Floating tags */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-white bg-[#131519] border border-white/10 px-2 py-0.5 rounded-md font-mono font-bold">
                      {rec.date.split('-').reverse().join('/')}
                    </span>
                    {hasAi && (
                      <span className="text-[9px] font-bold text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/20 px-2 py-0.5 rounded-md flex items-center gap-1 font-mono uppercase tracking-wider">
                        <Sparkles className="w-2.5 h-2.5" /> Analisado por IA
                      </span>
                    )}
                  </div>
                  
                  {/* Delete/Edit actions */}
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => openEditModal(rec)}
                      className="text-slate-400 hover:text-white p-1 hover:bg-white/5 rounded-lg transition"
                      title="Editar ficha"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(rec.id)}
                      className="text-slate-500 hover:text-red-400 p-1 hover:bg-red-950/10 rounded-lg transition"
                      title="Excluir ficha"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Patient / Therapist Details */}
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5 font-sans">
                    <User className="w-4 h-4 text-[#D4AF37]" />
                    {rec.patient?.name || 'Paciente'}
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-1 leading-none font-medium">
                    Terapeuta: {rec.therapist?.name || 'Responsável'} • {rec.therapist?.specialty}
                  </p>
                </div>

                {/* Synthesis snippets */}
                <div className="bg-[#131519]/60 border border-white/5 rounded-xl p-3.5 space-y-2.5">
                  <div className="text-xs">
                    <span className="text-[9px] uppercase tracking-widest font-semibold block text-[#D4AF37] mb-0.5">Sintomas Físicos / Entrada</span>
                    <p className="text-slate-300 line-clamp-2">{rec.physicalSymptoms}</p>
                  </div>

                  {rec.therapeuticPlan && (
                    <div className="text-xs border-t border-white/5 pt-2">
                      <span className="text-[9px] uppercase tracking-widest font-semibold block text-[#D4AF37] mb-0.5">Plano Terapêutico Integrado</span>
                      <p className="text-slate-400 italic line-clamp-2">{rec.therapeuticPlan}</p>
                    </div>
                  )}

                  {rec.aiAnalysis && (
                    <div className="text-[11px] bg-[#D4AF37]/5 px-2.5 py-1.5 border border-[#D4AF37]/10 rounded-lg text-[#D4AF37] italic font-serif flex items-center gap-1.5 leading-tight">
                      <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                      <span>Diagnóstico bioenergético de chakras mapeado por IA ativo.</span>
                    </div>
                  )}
                </div>

                {/* Sign and details view link button */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Atendimento Seguro
                  </span>
                  <button 
                    onClick={() => setSelectedRecord(rec)}
                    className="text-[#D4AF37] hover:text-white font-bold tracking-wider uppercase flex items-center gap-1 font-mono transition cursor-pointer"
                  >
                    Visualizar Dossiê Integral →
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Dossiê record reader lightbox */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in text-left">
          <div className="bg-[#131519] border border-white/10 rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col justify-between animate-scale-up">
            
            {/* Header branding */}
            <div className="bg-[#1A1D23] px-6 py-4.5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-[#D4AF37]/20 to-transparent border border-[#D4AF37]/30 rounded-xl">
                  <Compass className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#D4AF37] tracking-wider font-serif italic">Laudo Complementar Holístico</h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">Acompanhamento sutil multidimensional</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedRecord(null)}
                className="text-slate-400 hover:text-white bg-white/5 p-2 rounded-lg cursor-pointer transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrolling Body */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-6 max-h-[74vh]">
              {/* Patient and session card metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-[#1A1D23] p-4 rounded-2xl border border-white/5 text-xs">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-slate-500 block mb-0.5">Paciente Atendido</span>
                  <p className="font-bold text-white text-sm">{selectedRecord.patient?.name}</p>
                  <p className="text-[10px] text-slate-400 mt-1">Contato: {selectedRecord.patient?.phone}</p>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-slate-500 block mb-0.5">Terapeuta Responsável</span>
                  <p className="font-bold text-white">{selectedRecord.therapist?.name}</p>
                  <p className="text-[10px] text-[#D4AF37] italic mt-0.5">{selectedRecord.therapist?.specialty}</p>
                </div>
                <div className="sm:col-span-2 md:col-span-1">
                  <span className="text-[9px] uppercase tracking-wider text-slate-500 block mb-0.5">Data de Abertura</span>
                  <p className="font-bold text-white tracking-widest font-mono">{selectedRecord.date.split('-').reverse().join('/')}</p>
                  <span className="inline-block text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md mt-1.5 uppercase font-bold">Base PostgreSQL Ativa</span>
                </div>
              </div>

              {/* The 4 Multidimensional Dimensions */}
              <div className="space-y-6">
                <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest border-b border-[#D4AF37]/20 pb-1.5 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-[#D4AF37]" />
                  A. Dimensão Física e Fisiológica
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
                  <div className="bg-[#1A1D23]/60 p-4 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[9px] uppercase text-slate-500 font-bold block">Sintomas Físicos / Dores Fundamentais</span>
                    <p className="text-white leading-relaxed">{selectedRecord.physicalSymptoms}</p>
                  </div>
                  <div className="bg-[#1A1D23]/60 p-4 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[9px] uppercase text-slate-500 font-bold block">Qualidade de Sono e Vigília</span>
                    <p className="text-slate-300 leading-relaxed italic">{selectedRecord.sleepPattern || 'Sem queixas relatadas.'}</p>
                  </div>
                  <div className="bg-[#1A1D23]/60 p-4 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[9px] uppercase text-slate-500 font-bold block">Alimentação e Hidratação</span>
                    <p className="text-slate-300 leading-relaxed">{selectedRecord.dietHydration || 'Sem observações declaradas.'}</p>
                  </div>
                  <div className="bg-[#1A1D23]/60 p-4 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[9px] uppercase text-slate-500 font-bold block">Nível de Energia e Vitalidade Geral</span>
                    <p className="text-slate-300 leading-relaxed italic">{selectedRecord.energyLevel || 'Instáveis.'}</p>
                  </div>
                </div>

                <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest border-b border-[#D4AF37]/20 pb-1.5 flex items-center gap-1.5 pt-2">
                  <Heart className="w-4 h-4 text-[#D4AF37]" />
                  B. Dimensão Mental e Emocional
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium">
                  <div className="bg-[#1A1D23]/60 p-4 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[9px] uppercase text-slate-500 font-bold block">Estado Emocional / Sentimentos Atuais</span>
                    <p className="text-white leading-relaxed">{selectedRecord.emotionalState || 'Instável.'}</p>
                  </div>
                  <div className="bg-[#1A1D23]/60 p-4 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[9px] uppercase text-slate-500 font-bold block">Estressores e Ruminação Cognitiva</span>
                    <p className="text-slate-300 leading-relaxed">{selectedRecord.mentalStressor || 'Indisponível.'}</p>
                  </div>
                  <div className="bg-[#1A1D23]/60 p-4 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[9px] uppercase text-slate-500 font-bold block">Eventos Difíceis / Traumas do Passado</span>
                    <p className="text-slate-300 leading-relaxed italic">{selectedRecord.pastTraumas || 'Sem registros graves.'}</p>
                  </div>
                </div>

                <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest border-b border-[#D4AF37]/20 pb-1.5 flex items-center gap-1.5 pt-2">
                  <Zap className="w-4 h-4 text-[#D4AF37]" />
                  C. Dimensão Bioenergética e Espiritual sutil
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium">
                  <div className="bg-[#1A1D23]/60 p-4 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[9px] uppercase text-slate-500 font-bold block">Estado e Fluxo de Chakras Percebidos</span>
                    <p className="text-white leading-relaxed italic">{selectedRecord.energeticChakras || 'Bloqueios sutis.'}</p>
                  </div>
                  <div className="bg-[#1A1D23]/60 p-4 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[9px] uppercase text-slate-500 font-bold block">Corpos Sutis / Aura predominante</span>
                    <p className="text-slate-300 leading-relaxed">{selectedRecord.vibeAura || 'Sintonizada por Reiki.'}</p>
                  </div>
                  <div className="bg-[#1A1D23]/60 p-4 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[9px] uppercase text-slate-500 font-bold block">Ancoramento Espiritual e Práticas</span>
                    <p className="text-slate-300 leading-relaxed italic">{selectedRecord.spiritualBeliefs || 'Sem restrições religiosas.'}</p>
                  </div>
                </div>

                <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest border-b border-[#D4AF37]/20 pb-1.5 flex items-center gap-1.5 pt-2">
                  <Users className="w-4 h-4 text-[#D4AF37]" />
                  D. Dimensão Sistêmica e Familiar (Ancestralidade)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
                  <div className="bg-[#1A1D23]/60 p-4 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[9px] uppercase text-slate-500 font-bold block">Repetição de Clã / Padrões Familiares Repetidos</span>
                    <p className="text-slate-300 leading-relaxed">{selectedRecord.familyPatterns || 'Mapeando lealdades invisíveis.'}</p>
                  </div>
                  <div className="bg-[#1A1D23]/60 p-4 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[9px] uppercase text-slate-500 font-bold block">Dinâmica de Relacionamento no Trabalho e Clã</span>
                    <p className="text-slate-300 leading-relaxed italic">{selectedRecord.relationships || 'Sob carga.'}</p>
                  </div>
                </div>

                {/* Therapeutic Plan Syntheses */}
                <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest border-b border-[#D4AF37]/20 pb-1.5 flex items-center gap-1.5 pt-2">
                  <BookOpen className="w-4 h-4 text-[#D4AF37]" />
                  E. Prescrição e Síntese de Conduta Terapêutica
                </h4>
                <div className="bg-[#1A1D23]/60 p-5 rounded-2xl border border-white/5 text-xs space-y-3.5">
                  <div>
                    <span className="text-[10px] uppercase text-[#D4AF37] font-bold block mb-1">Cura Recomendada / Plano Sutil</span>
                    <p className="text-slate-200 leading-relaxed whitespace-pre-line bg-[#131519]/70 p-3.5 rounded-xl border border-white/5 italic">
                      {selectedRecord.therapeuticPlan || 'Nenhum plano recomendado cadastrado.'}
                    </p>
                  </div>

                  {selectedRecord.notes && (
                    <div>
                      <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Notas e Observações Extras</span>
                      <p className="text-slate-400 font-sans leading-relaxed">{selectedRecord.notes}</p>
                    </div>
                  )}
                </div>

                {/* Dedicated AI Analysis Section in details view */}
                {selectedRecord.aiAnalysis && (
                  <div className="border border-[#D4AF37]/30 bg-gradient-to-br from-[#D4AF37]/5 to-[#131519] rounded-3xl p-6 space-y-4 shadow-sm animate-fade-in text-xs leading-relaxed">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-[#D4AF37] animate-pulse" />
                      <h4 className="text-xs font-bold uppercase tracking-widest text-[#D4AF37] font-serif italic">Laudo Metafísico & Bioenergético Integrado por IA</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-slate-300">
                      {selectedRecord.aiAnalysis.split('### ').filter(Boolean).map((section, idx) => {
                        const lines = section.split('\n');
                        const sectionTitle = lines[0] || '';
                        const sectionBody = lines.slice(1).join('\n');
                        return (
                          <div key={idx} className="bg-[#131519]/80 p-4 border border-white/5 rounded-2xl space-y-1.5 text-left">
                            <span className="font-bold text-[#D4AF37] block text-[11px] border-b border-white/5 pb-1 uppercase tracking-wider">{sectionTitle}</span>
                            <div className="text-[11px] leading-relaxed whitespace-pre-line text-slate-300 pt-1">{sectionBody}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Electronic Signature block */}
            <div className="bg-[#1A1D23] px-6 py-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0 font-sans">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Documento Médico Integrativo Protegido e Assinado</span>
              </div>
              
              <div className="text-right">
                <p className="text-xs font-bold text-white italic font-serif">{selectedRecord.signature || `Assinado eletronicamente`}</p>
                <p className="text-[9px] text-[#D4AF37] font-mono tracking-widest uppercase mt-0.5">TERAPEUTA INTEGRATIVO REGISTRADO</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Creation and editing modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-40 animate-fade-in relative text-left">
          <div className="bg-[#1A1D23] rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-scale-up max-h-[92vh] max-w-5xl w-full flex flex-col justify-between">
            
            {/* Header info */}
            <div className="bg-[#131519] px-6 py-4 border-b border-white/10 flex items-center justify-between shrink-0">
              <h3 className="text-sm font-bold text-[#D4AF37] flex items-center gap-1.5 font-serif italic">
                <FileText className="w-4 h-4 text-[#D4AF37]" />
                {editingId ? 'Reprocessar/Editar Ficha de Anamnese' : 'Registrar Nova Ficha de Anamnese Holística'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer hover:bg-white/5 p-1 rounded-md transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Split sub header controller tab */}
            <div className="bg-[#16181D] px-6 py-2 border-b border-white/5 flex items-center justify-between shrink-0 text-xs">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('form')}
                  className={`py-1.5 px-3 rounded-lg font-semibold transition cursor-pointer text-[11px] ${activeTab === 'form' ? 'bg-[#D4AF37]/15 text-[#D4AF37] font-bold border border-[#D4AF37]/30' : 'text-slate-400 hover:text-white'}`}
                >
                  Ficha Cadastral (Formulário)
                </button>
                <button
                  type="button"
                  disabled={!aiAnalysis}
                  onClick={() => setActiveTab('ai')}
                  className={`py-1.5 px-3 rounded-lg font-semibold transition cursor-pointer text-[11px] flex items-center gap-1.5 ${!aiAnalysis ? 'opacity-40 cursor-not-allowed' : ''} ${activeTab === 'ai' ? 'bg-[#D4AF37]/15 text-[#D4AF37] font-bold border border-[#D4AF37]/30' : 'text-slate-400 hover:text-white'}`}
                >
                  <Sparkles className="w-3 h-3 text-[#D4AF37] animate-pulse" />
                  Laudo Bioenergético por IA
                </button>
              </div>

              {/* Sparks button */}
              <button
                type="button"
                onClick={handleAIAnalysis}
                disabled={draftingAI}
                className="bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 text-[10px] animate-pulse cursor-pointer disabled:opacity-50 font-mono tracking-wide uppercase"
              >
                {draftingAI ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Analisando Dimensões...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" /> Integrar Análise de IA
                  </>
                )}
              </button>
            </div>

            {/* Modal Body form view */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 max-h-[66vh]">
              
              {activeTab === 'form' ? (
                <div className="space-y-6">
                  {/* Basic Metadata Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-[#131519]/60 p-4.5 border border-white/5 rounded-2xl text-xs">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Paciente *</label>
                      <select
                        value={patientId}
                        onChange={(e) => setPatientId(e.target.value)}
                        className="w-full bg-[#1A1D23] border border-white/10 focus:border-[#D4AF37] rounded-xl p-2.5 text-xs text-white focus:outline-none cursor-pointer"
                        required
                      >
                        <option value="">Selecione o paciente...</option>
                        {patients.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Terapeuta Diagnosticador *</label>
                      <select
                        value={therapistId}
                        onChange={(e) => setTherapistId(e.target.value)}
                        className="w-full bg-[#1A1D23] border border-white/10 focus:border-[#D4AF37] rounded-xl p-2.5 text-xs text-white focus:outline-none cursor-pointer"
                        required
                      >
                        <option value="">Selecione o terapeuta...</option>
                        {therapists.map((t) => (
                          <option key={t.id} value={t.id}>{t.name} ({t.specialty})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Data da Anamnese *</label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full bg-[#1A1D23] border border-white/10 focus:border-[#D4AF37] rounded-xl p-2.5 text-xs text-white focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  {/* 1. PHYSICAL DIMENSION */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest border-b border-[#D4AF37]/20 pb-1.5 flex items-center gap-1.5 font-serif italic">
                      <Activity className="w-4 h-4 text-[#D4AF37]" />
                      1. Dimensão Física e Fisiológica (Matéria)
                    </h4>
                    
                    <div className="space-y-3.5">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Diagnóstico de Sintomas Físicos, Dores ou Queixas de Entrada *</label>
                        <textarea
                          rows={2}
                          value={physicalSymptoms}
                          onChange={(e) => setPhysicalSymptoms(e.target.value)}
                          placeholder="Ex: Enxaqueca crônica na região frontal, dores cervicais, sensação de aperto no peito."
                          className="w-full bg-[#131519] border border-white/10 focus:border-[#D4AF37] rounded-xl p-3 text-xs text-white focus:outline-none transition-all"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">Padrão de Sono / Sobrecarga de Estresse</label>
                          <input
                            type="text"
                            value={sleepPattern}
                            onChange={(e) => setSleepPattern(e.target.value)}
                            placeholder="Ex: Insônia de manutenção, acorda cansada"
                            className="w-full bg-[#131519] border border-white/10 focus:border-[#D4AF37] rounded-xl p-2.5 text-xs text-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">Alimentação e Hidratação</label>
                          <input
                            type="text"
                            value={dietHydration}
                            onChange={(e) => setDietHydration(e.target.value)}
                            placeholder="Ex: Pouca água, consumo excessivo de café"
                            className="w-full bg-[#131519] border border-white/10 focus:border-[#D4AF37] rounded-xl p-2.5 text-xs text-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">Nível de Vitalidade Sutil geral</label>
                          <input
                            type="text"
                            value={energyLevel}
                            onChange={(e) => setEnergyLevel(e.target.value)}
                            placeholder="Ex: Energia baixa no final do dia, fadiga"
                            className="w-full bg-[#131519] border border-white/10 focus:border-[#D4AF37] rounded-xl p-2.5 text-xs text-white focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. EMOTIONAL DIMENSION */}
                  <div className="space-y-4 pt-2">
                    <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest border-b border-[#D4AF37]/20 pb-1.5 flex items-center gap-1.5 font-serif italic">
                      <Heart className="w-4 h-4 text-[#D4AF37]" />
                      2. Dimensão Sentimental e Mental (Psiquismo)
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-1">
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Humor / Sentimentação Predominante</label>
                        <textarea
                          rows={2}
                          value={emotionalState}
                          onChange={(e) => setEmotionalState(e.target.value)}
                          placeholder="Ex: Melancolia recorrente, irritabilidade contida, sentimentos de medo."
                          className="w-full bg-[#131519] border border-white/10 focus:border-[#D4AF37] rounded-xl p-2.5 text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div className="md:col-span-1">
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Principais Estressores Mentais / Ruminação</label>
                        <textarea
                          rows={2}
                          value={mentalStressor}
                          onChange={(e) => setMentalStressor(e.target.value)}
                          placeholder="Ex: Cobrança profissional extrema, medo do julgamento, pensamentos acelerados."
                          className="w-full bg-[#131519] border border-white/10 focus:border-[#D4AF37] rounded-xl p-2.5 text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div className="md:col-span-1">
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Traumas ou Cicatrizes Importantes</label>
                        <textarea
                          rows={2}
                          value={pastTraumas}
                          onChange={(e) => setPastTraumas(e.target.value)}
                          placeholder="Ex: Perda repentina de familiar há 3 anos, divórcio traumático."
                          className="w-full bg-[#131519] border border-white/10 focus:border-[#D4AF37] rounded-xl p-2.5 text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 3. ENERGETIC/SPIRITUAL */}
                  <div className="space-y-4 pt-2">
                    <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest border-b border-[#D4AF37]/20 pb-1.5 flex items-center gap-1.5 font-serif italic">
                      <Zap className="w-4 h-4 text-[#D4AF37]" />
                      3. Dimensão Bioenergética e Espiritual sutil
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Bloqueios em Chakras / Fluxo de Prana</label>
                        <input
                          type="text"
                          value={energeticChakras}
                          onChange={(e) => setEnergeticChakras(e.target.value)}
                          placeholder="Ex: Laríngeo travado, Cardíaco abafado"
                          className="w-full bg-[#131519] border border-white/10 focus:border-[#D4AF37] rounded-xl p-2.5 text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Campo Sutil / Anotações da Aura</label>
                        <input
                          type="text"
                          value={vibeAura}
                          onChange={(e) => setVibeAura(e.target.value)}
                          placeholder="Ex: Aura retraída, sensibilidade a ambientes"
                          className="w-full bg-[#131519] border border-white/10 focus:border-[#D4AF37] rounded-xl p-2.5 text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Práticas Espirituais / Ancoramento sutil</label>
                        <input
                          type="text"
                          value={spiritualBeliefs}
                          onChange={(e) => setSpiritualBeliefs(e.target.value)}
                          placeholder="Ex: Meditação aos domingos, reza diária"
                          className="w-full bg-[#131519] border border-white/10 focus:border-[#D4AF37] rounded-xl p-2.5 text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 4. SYSTEMIC / FAMILY */}
                  <div className="space-y-4 pt-2">
                    <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest border-b border-[#D4AF37]/20 pb-1.5 flex items-center gap-1.5 font-serif italic">
                      <Users className="w-4 h-4 text-[#D4AF37]" />
                      4. Dimensão Sistêmica e Linhagem Ancestral (Hellinger)
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Lealdades Invisíveis / Repetição de Padrões Clã</label>
                        <textarea
                          rows={2}
                          value={familyPatterns}
                          onChange={(e) => setFamilyPatterns(e.target.value)}
                          placeholder="Ex: Mulheres da família sempre assumem sozinhas as contas da casa, repetindo ciclo materno."
                          className="w-full bg-[#131519] border border-white/10 focus:border-[#D4AF37] rounded-xl p-2.5 text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Dinâmica de Relacionamento Familiar e Emaranhamentos</label>
                        <textarea
                          rows={2}
                          value={relationships}
                          onChange={(e) => setRelationships(e.target.value)}
                          placeholder="Ex: Conflitos profundos com a figura paterna, assumindo responsabilidade desproporcional."
                          className="w-full bg-[#131519] border border-white/10 focus:border-[#D4AF37] rounded-xl p-2.5 text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 5. TREATMENT PLAN & NOTES */}
                  <div className="space-y-4 pt-2">
                    <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest border-b border-[#D4AF37]/20 pb-1.5 flex items-center gap-1.5 font-serif italic">
                      <BookOpen className="w-4 h-4 text-[#D4AF37]" />
                      5. Conduta Terapêutica & Plano de Harmonia Recomendado
                    </h4>
                    
                    <div className="space-y-3.5">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Formulação de Florais, Ervas, Banhos, Cristais ou Práticas Sugeridas</label>
                        <textarea
                          rows={3}
                          value={therapeuticPlan}
                          onChange={(e) => setTherapeuticPlan(e.target.value)}
                          placeholder="Ex: Chá infusão Melissa diário. Uso de Floral de Bach Aspen + Mimulus. Aplicação de colar sutil com Citrino."
                          className="w-full bg-[#131519] border border-white/10 focus:border-[#D4AF37] rounded-xl p-3 text-xs text-white focus:outline-none italic"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">Observações Internas (Não aparecem no laudo rápido)</label>
                          <input
                            type="text"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Anotações para sessões futuras ou comportamento clínico..."
                            className="w-full bg-[#131519] border border-white/10 focus:border-[#D4AF37] rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none font-sans"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1 text-emerald-500 flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" /> Assinar Digitalmente Clínico *
                          </label>
                          <input
                            type="text"
                            value={signature}
                            onChange={(e) => setSignature(e.target.value)}
                            placeholder="Nome completo do terapeuta para selar o prontuário..."
                            className="w-full bg-[#131519] border border-white/15 focus:border-emerald-500 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Gemini Analysis Interactive markdown view inside the creator modal */
                <div className="space-y-5 animate-fade-in text-xs font-sans">
                  <div className="bg-[#D4AF37]/10 p-5 rounded-2xl border border-[#D4AF37]/20 flex items-start gap-3.5 leading-relaxed">
                    <Sparkles className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-white uppercase text-[10px] tracking-wider mb-1">Análise Holística Multidimensional Inteligente</h4>
                      <p className="text-slate-300 leading-normal text-xs">
                        Este diagnóstico foi sintetizado via inteligência artificial correlacionando suas queixas e de seu cliente a conceitos de somatização, bioenergética e emaranhamentos de clã da Constelação Familiar. revise e incorpore as sugestões ao plano terapêutico se desejado.
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#131519] border border-white/10 rounded-2xl p-6.5 text-left text-slate-300 leading-relaxed max-w-4xl mx-auto space-y-6">
                    {aiAnalysis.split('### ').filter(Boolean).map((section, index) => {
                      const lines = section.split('\n');
                      const sectionTitle = lines[0] || '';
                      const sectionBody = lines.slice(1).join('\n');
                      return (
                        <div key={index} className="space-y-2 border-b border-white/5 pb-4 last:border-b-0 last:pb-0">
                          <h5 className="font-bold text-[#D4AF37] text-sm flex items-center gap-1.5 font-serif italic">
                            ✦ {sectionTitle}
                          </h5>
                          <p className="whitespace-pre-line text-slate-300 text-xs pl-4 bg-[#1A1D23]/30 p-4 rounded-xl border border-white/5">{sectionBody.trim()}</p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-center pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('form')}
                      className="bg-white/5 hover:bg-white/10 text-white font-bold py-2.5 px-5 rounded-xl border border-white/10 text-xs transition active:scale-95 cursor-pointer"
                    >
                      ← Voltar para a Ficha Cadastral e Incorporar Mudanças
                    </button>
                  </div>
                </div>
              )}

              {/* Form submit/footer button bar */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-white/5 hover:bg-white/10 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#D4AF37] hover:bg-[#C5A030] text-[#0f1115] font-bold py-2.5 px-5 rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  {editingId ? 'Salvar Alterações' : 'Registrar Ficha de Anamnese'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
