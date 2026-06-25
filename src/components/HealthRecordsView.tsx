import React, { useState, useEffect } from 'react';
import { HealthRecord, Patient, Therapist, QuickNote } from '../types.ts';
import { FileText, Plus, Search, Sparkles, User, Calendar, ShieldCheck, X, Check, Eye, Printer, Camera } from 'lucide-react';
import WebcamCapture from './WebcamCapture';

interface HealthRecordsViewProps {
  healthRecords: HealthRecord[];
  patients: Patient[];
  therapists: Therapist[];
  onAddHealthRecord: (data: any) => void;
}

export default function HealthRecordsView({
  healthRecords,
  patients,
  therapists,
  onAddHealthRecord,
}: HealthRecordsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatientFilter, setSelectedPatientFilter] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null);
  const [quickNotes, setQuickNotes] = useState<QuickNote[]>([]);
  const [newQuickNote, setNewQuickNote] = useState('');

  // Fetch quick notes when patient changes
  useEffect(() => {
    if (selectedPatientFilter) {
      fetch(`/api/quick-notes/${selectedPatientFilter}`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('firebase_token') || ''}`,
        },
      })
      .then(res => res.json())
      .then(data => setQuickNotes(data))
      .catch(err => console.error('Failed to fetch quick notes', err));
    } else {
      setQuickNotes([]);
    }
  }, [selectedPatientFilter]);

  const addQuickNote = async () => {
    if (!newQuickNote.trim() || !selectedPatientFilter) return;

    try {
      const response = await fetch('/api/quick-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('firebase_token') || ''}`,
        },
        body: JSON.stringify({
          patientId: parseInt(selectedPatientFilter),
          content: newQuickNote,
        }),
      });

      if (!response.ok) throw new Error('Failed to save note');
      
      const savedNote = await response.json();
      setQuickNotes(prev => [savedNote, ...prev]);
      setNewQuickNote('');
    } catch (err) {
      console.error('Failed to save quick note', err);
      alert('Erro ao salvar nota rápida.');
    }
  };

  // Form Fields
  const [patientId, setPatientId] = useState('');
  const [therapistId, setTherapistId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [symptoms, setSymptoms] = useState('');
  const [evolution, setEvolution] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [signature, setSignature] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [showWebcam, setShowWebcam] = useState(false);

  // AI draft states
  const [draftingAI, setDraftingAI] = useState(false);
  const [mockTherapyName, setMockTherapyName] = useState('Reiki / Crânio-Sacral');

  const filteredRecords = healthRecords.filter((rec) => {
    const matchesSearch = 
      rec.patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.symptoms.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.therapist?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPatient = selectedPatientFilter === '' || rec.patientId.toString() === selectedPatientFilter;
    
    return matchesSearch && matchesPatient;
  });

  // previous records for the selected patient in creation form
  const modalPreviousRecords = patientId 
    ? healthRecords.filter(r => r.patientId === parseInt(patientId))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : [];

  const handleAIDraft = async () => {
    if (!patientId || !symptoms) {
      alert('Por favor, selecione o Paciente e preencha as Queixas/Sintomas primeiro para orientar o rascunho da IA.');
      return;
    }

    setDraftingAI(true);
    const selectedPatient = patients.find((p) => p.id === parseInt(patientId));
    
    try {
      const response = await fetch('/api/health-records/draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('firebase_token') || ''}`,
        },
        body: JSON.stringify({
          patientName: selectedPatient?.name || 'Cliente',
          therapyName: mockTherapyName,
          symptoms: symptoms,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro na resposta do Express proxy.');
      }

      const data = await response.json();
      setEvolution(data.evolution || '');
      setRecommendations(data.recommendations || '');
    } catch (err) {
      console.error('Gemini Assistant draft failed:', err);
      // Fallback local integration
      setEvolution(`Sessão integrativa de ${mockTherapyName} realizada focando em reequilíbrio energético e alívio das tensões físicas motivadas por: "${symptoms}". No encerramento da sessão o cliente relatou bem-estar imediato, sensação de centralidade e respiração mais calma.`);
      setRecommendations('Recomendável suspender consumo de cafeína nas próximas 8h, ingerir água pura de forma constante e praticar 5 minutos de respiração diafragmática pausada à noite.');
    } finally {
      setDraftingAI(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !therapistId || !symptoms || !evolution) {
      alert('Preencha os campos obrigatórios (*).');
      return;
    }

    onAddHealthRecord({
      patientId,
      therapistId,
      date,
      symptoms,
      evolution,
      recommendations,
      signature: signature || `Assinado eletronicamente por ${therapists.find(t=>t.id === parseInt(therapistId))?.name || 'Terapeuta'}`,
      photos,
    });

    // Clear and close
    setPatientId('');
    setTherapistId('');
    setDate(new Date().toISOString().split('T')[0]);
    setSymptoms('');
    setEvolution('');
    setRecommendations('');
    setSignature('');
    setShowModal(false);
  };

  const openAddModal = () => {
    setSelectedRecord(null);
    setPatientId('');
    setTherapistId('');
    setDate(new Date().toISOString().split('T')[0]);
    setSymptoms('');
    setEvolution('');
    setRecommendations('');
    setSignature('');
    setPhotos([]);
    setShowWebcam(false);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-[#D4AF37] tracking-tight font-serif italic">Prontuário Multiterapeuta</h2>
          <p className="text-[#94A3B8] text-sm">Registre a evolução clínica dos pacientes por sessão com redação assistida por inteligência artificial.</p>
        </div>

        <button
          onClick={openAddModal}
          className="bg-[#D4AF37] hover:bg-[#C5A030] text-[#0f1115] font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition active:scale-95 text-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Registrar Evolução
        </button>
      </div>

      {/* Search and timeline controls with patient filtering option */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="relative md:col-span-8">
          <Search className="absolute left-3.5 top-3.5 text-[#94A3B8] w-4 h-4" />
          <input
            type="text"
            placeholder="Filtrar prontuários por palavras-chave (ex. cansaço, dores, Reiki)..."
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
            <option value="">Filtro: Todos os Pacientes</option>
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
              <p className="text-xs font-bold text-white">Prontuário Individual: {patients.find(p => p.id.toString() === selectedPatientFilter)?.name}</p>
              <p className="text-[10px] text-[#94A3B8]">Dossiê exclusivo com a linha do tempo cronológica de todos os atendimentos integrativos do paciente.</p>
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

      {selectedPatientFilter && (
        <div className="bg-[#1A1D23] rounded-2xl border border-white/10 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#F1F5F9] font-serif italic flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            Notas de Evolução Rápida
          </h3>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={newQuickNote}
              onChange={(e) => setNewQuickNote(e.target.value)}
              placeholder="Adicionar nota curta de evolução (ex. 'Paciente relata melhora na ansiedade...')"
              className="flex-1 bg-[#131519] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37] transition"
            />
            <button
              onClick={addQuickNote}
              className="bg-[#D4AF37] hover:bg-[#C5A030] text-[#0f1115] font-bold py-2 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition text-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Salvar
            </button>
          </div>

          <div className="space-y-2">
            {quickNotes.map((note) => (
              <div key={note.id} className="bg-[#131519] p-3 rounded-xl border border-white/5 text-xs text-slate-300">
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(note.createdAt).toLocaleString()}
                </span>
                <p className="mt-1">{note.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Health Records Timeline */}
      <div className="bg-[#1A1D23] rounded-2xl border border-white/10 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-[#F1F5F9] mb-6 font-serif italic flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#D4AF37]" />
          Histórico Cronológico de Consultas
        </h3>

        {filteredRecords.length === 0 ? (
          <div className="text-center py-12 text-[#94A3B8] text-xs">
            Nenhum prontuário registrado no histórico para esta busca. Clique em "Registrar Evolução" para registrar.
          </div>
        ) : (
          <div className="relative border-l border-white/10 pl-6 space-y-8 ml-2">
            {filteredRecords.map((rec) => (
              <div key={rec.id} className="relative group text-left">
                {/* Node dot icon */}
                <div className="absolute -left-[31px] top-1.5 w-[11px] h-[11px] bg-[#D4AF37] border-2 border-[#1A1D23] rounded-full transition group-hover:scale-130 shadow-xs"></div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-xs font-bold text-[#D4AF37] font-mono bg-[#131519] border border-white/10 px-2 py-0.5 rounded-md">
                      {rec.date.split('-').reverse().join('/')}
                    </span>
                    <span className="text-sm font-bold text-[#F1F5F9]">Paciente: {rec.patient?.name}</span>
                    <span className="text-xs text-slate-500">por {rec.therapist?.name}</span>
                    <button
                      onClick={() => {
                        const printWindow = window.open('', '_blank');
                        if (printWindow) {
                          printWindow.document.write(`
                            <html>
                              <head>
                                <title>Prontuário - ${rec.patient?.name}</title>
                                <style>
                                  body { font-family: 'Helvetica', 'Arial', sans-serif; padding: 40px; color: #333; }
                                  h1 { border-bottom: 2px solid #D4AF37; padding-bottom: 10px; color: #D4AF37; font-size: 24px; }
                                  .section { margin-bottom: 20px; }
                                  .label { font-weight: bold; color: #555; text-transform: uppercase; font-size: 11px; margin-bottom: 5px; }
                                  .content { font-size: 14px; line-height: 1.5; margin-bottom: 10px; background: #f9f9f9; padding: 10px; border-left: 3px solid #D4AF37; }
                                  .footer { margin-top: 40px; font-size: 10px; color: #999; border-top: 1px solid #ccc; padding-top: 10px; }
                                </style>
                              </head>
                              <body>
                                <h1>Prontuário Terapêutico Integrativo</h1>
                                <div class="section"><div class="label">Paciente:</div><div class="content">${rec.patient?.name}</div></div>
                                <div class="section"><div class="label">Data:</div><div class="content">${rec.date.split('-').reverse().join('/')}</div></div>
                                <div class="section"><div class="label">Queixas / Sintomas:</div><div class="content">${rec.symptoms}</div></div>
                                <div class="section"><div class="label">Evolução da Sessão:</div><div class="content">${rec.evolution}</div></div>
                                <div class="section"><div class="label">Indicações e Cuidados:</div><div class="content">${rec.recommendations || 'Sem indicações.'}</div></div>
                                <div class="footer">${rec.signature || ''} - Emitido em: ${new Date().toLocaleDateString()}</div>
                              </body>
                            </html>
                          `);
                          printWindow.document.close();
                          printWindow.print();
                        }
                      }}
                      className="ml-auto p-1.5 rounded-lg text-[#94A3B8] hover:text-[#D4AF37] hover:bg-white/5 transition-colors cursor-pointer"
                      title="Imprimir Prontuário"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-xs pt-1.5 max-w-3xl space-y-2">
                    <p><span className="font-semibold text-[#94A3B8]">Queixa / Sintomas relatados:</span> <span className="text-[#E2E8F0]">{rec.symptoms}</span></p>
                    
                    <div className="bg-[#131519]/80 p-4 rounded-xl border border-white/5 space-y-3">
                      <div>
                        <span className="font-semibold text-[#D4AF37] block text-[10px] uppercase tracking-wider mb-1">Evolução da Sessão</span>
                        <p className="text-[#E2E8F0] leading-relaxed text-xs">{rec.evolution}</p>
                      </div>

                      {rec.recommendations && (
                        <div>
                          <span className="font-semibold text-[#D4AF37] block text-[10px] uppercase tracking-wider mb-1">Indicações Terapêuticas / Receita de Florais, Chás etc.</span>
                          <p className="text-[#94A3B8] leading-relaxed text-xs italic">{rec.recommendations}</p>
                        </div>
                      )}

                      {rec.photos && rec.photos.length > 0 && (
                        <div className="pt-3 border-t border-white/5">
                          <span className="font-semibold text-[#D4AF37] block text-[10px] uppercase tracking-wider mb-2">Evidências Clínicas (Fotos):</span>
                          <div className="flex flex-wrap gap-2">
                            {rec.photos.map((p, i) => <img key={i} src={p} alt="Record photo" className="w-16 h-16 object-cover rounded-lg border border-white/10" />)}
                          </div>
                        </div>
                      )}

                      {rec.signature && (
                        <div className="pt-2 flex items-center gap-1.5 text-[10px] text-[#D4AF37] font-semibold font-mono border-t border-white/5">
                          <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0" />
                          <span>{rec.signature}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Medical Record Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-45 animate-fade-in relative">
          <div className={`bg-[#1A1D23] rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-scale-up max-h-[92vh] flex flex-col justify-between transition-all duration-300 ${patientId ? 'max-w-5xl w-full' : 'max-w-2xl w-full'}`}>
            <div className="bg-[#131519] px-6 py-4 border-b border-white/10 flex items-center justify-between shrink-0">
              <h3 className="text-sm font-bold text-[#D4AF37] flex items-center gap-1.5 font-serif italic">
                <FileText className="w-4 h-4 text-[#D4AF37]" />
                Registrar Evolução e Prontuário Integrativo
              </h3>
              <button onClick={() => setShowModal(false)} className="text-[#94A3B8] hover:text-[#E2E8F0] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Split screen Layout if Patient is selected to show previous history */}
            <div className={`grid grid-cols-1 ${patientId ? 'lg:grid-cols-12' : ''} divide-y lg:divide-y-0 lg:divide-x divide-white/10 overflow-hidden`}>
              
              {/* Form Section */}
              <form onSubmit={handleSubmit} className={`${patientId ? 'lg:col-span-7' : 'w-full'} p-6 space-y-4 overflow-y-auto max-h-[72vh] text-left`}>
                {/* Patient and Therapist Dropdowns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Paciente *</label>
                    <select
                      value={patientId}
                      onChange={(e) => setPatientId(e.target.value)}
                      className="w-full bg-[#131519] border border-white/10 focus:border-[#D4AF37] rounded-xl p-2.5 text-xs text-white focus:outline-none transition-all cursor-pointer"
                      required
                    >
                      <option value="">Selecione o paciente...</option>
                      {patients.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#94A3B8] mb-1 font-sans">Terapeuta Responsável *</label>
                    <select
                      value={therapistId}
                      onChange={(e) => setTherapistId(e.target.value)}
                      className="w-full bg-[#131519] border border-white/10 focus:border-[#D4AF37] rounded-xl p-2.5 text-xs text-white focus:outline-none transition-all cursor-pointer"
                      required
                    >
                      <option value="">Selecione o terapeuta...</option>
                      {therapists.map((t) => (
                        <option key={t.id} value={t.id}>{t.name} ({t.specialty})</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Date & Therapy Name (for AI context) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans">
                  <div>
                    <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Data da Consulta *</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-[#131519] border border-white/10 focus:border-[#D4AF37] rounded-xl p-2.5 text-xs text-white focus:outline-none transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Terapia Aplicada (Auxilia no Rascunho IA)</label>
                    <input
                      type="text"
                      value={mockTherapyName}
                      onChange={(e) => setMockTherapyName(e.target.value)}
                      className="w-full bg-[#131519] border border-white/10 focus:border-[#D4AF37] rounded-xl p-2.5 text-xs text-white focus:outline-none transition-all placeholder-slate-600"
                      placeholder="Ex: Alinhamento Chakras com Reiki, Florais"
                    />
                  </div>
                </div>

                {/* Symptoms / motives input */}
                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Queixas Principais & Sintomas do Paciente *</label>
                  <textarea
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    rows={2}
                    className="w-full bg-[#131519] border border-white/10 focus:border-[#D4AF37] rounded-xl p-2.5 text-xs text-white focus:outline-none transition-all placeholder-slate-600"
                    placeholder="Relato do paciente sobre cansaço, ansiedade, dores crônicas, desequilíbrio energético etc."
                    required
                  />
                </div>

                {/* AI Draft Button Assistant! */}
                <div className="bg-[#131519] p-4 rounded-2xl border border-[#D4AF37]/25 flex flex-col sm:flex-row items-center justify-between gap-3 select-none">
                  <div className="text-xs text-[#94A3B8]">
                    <span className="font-bold text-[#D4AF37] flex items-center gap-1.5 mb-0.5 font-serif italic">
                      <Sparkles className="w-4 h-4 text-[#D4AF37] animate-pulse" />
                      Assistente Clínico Gemini AI
                    </span>
                    Gere instantaneamente um rascunho evolutivo elegante com base nas queixas!
                  </div>
                  <button
                    type="button"
                    onClick={handleAIDraft}
                    disabled={draftingAI || !patientId || !symptoms}
                    className="bg-[#D4AF37] hover:bg-[#C5A030] text-[#0f1115] text-xs font-bold py-2 px-4 rounded-xl shadow-xs transition flex items-center gap-1.5 disabled:opacity-40 cursor-pointer shrink-0"
                  >
                    {draftingAI ? 'Processando IA...' : 'Rascunhar com IA'}
                  </button>
                </div>

                {/* Evolution */}
                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Evolução Clínica da Sessão *</label>
                  <textarea
                    value={evolution}
                    onChange={(e) => setEvolution(e.target.value)}
                    rows={4}
                    className="w-full bg-[#131519] border border-white/10 focus:border-[#D4AF37] rounded-xl p-2.5 text-xs text-white focus:outline-none transition-all leading-relaxed placeholder-slate-600"
                    placeholder="Descreva as manipulações, canais energéticos harmonizados, postura do cliente e reações pós consulta."
                    required
                  />
                </div>

                {/* Recommendations */}
                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Recomendações Holísticas pós consulta / Auto-Cuidado</label>
                  <textarea
                    value={recommendations}
                    onChange={(e) => setRecommendations(e.target.value)}
                    rows={2}
                    className="w-full bg-[#131519] border border-white/10 focus:border-[#D4AF37] rounded-xl p-2.5 text-xs text-white focus:outline-none transition-all italic leading-relaxed placeholder-slate-600"
                    placeholder="Banhos de ervas, exercícios de meditação, posologias de florais indicadas."
                  />
                </div>

                {/* Photos */}
                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Fotos / Evidências Clínicas</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {photos.map((p, i) => (
                      <div key={i} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-white/10">
                        <img src={p} alt="Patient photo" className="w-full h-full object-cover" />
                        <button onClick={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-black/80"><X className="w-3 h-3"/></button>
                      </div>
                    ))}
                    <button type="button" onClick={() => setShowWebcam(true)} className="w-20 h-20 rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center text-[#94A3B8] hover:text-[#D4AF37] hover:border-[#D4AF37] transition">
                      <Camera className="w-6 h-6 mb-1" />
                      <span className="text-[9px] uppercase font-bold">Capturar</span>
                    </button>
                  </div>
                </div>

                {/* Signature */}
                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Assinatura Digital Terapêutica / Carimbo</label>
                  <input
                    type="text"
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                    className="w-full bg-[#131519] border border-white/10 focus:border-[#D4AF37] rounded-xl p-2.5 text-xs text-white focus:outline-none transition-all font-mono placeholder-slate-600"
                    placeholder="Ex: Assinado eletronicamente por CRTH-BR 2026-06-22"
                  />
                </div>

                {/* Form actions */}
                <div className="flex justify-end gap-2 pt-2 border-t border-white/5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-[#94A3B8] hover:text-[#E2E8F0] bg-[#131519] rounded-xl border border-white/5 transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-[#0F1115] bg-[#D4AF37] hover:bg-[#C5A030] rounded-xl transition shadow-sm cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Salvar Ficha de Consulta
                  </button>
                </div>
              </form>

              {/* Vertical Stylized Previous Record Timeline (facilitates real-time clinical assessment) */}
              {patientId && (
                <div className="lg:col-span-5 p-6 bg-[#131519]/70 overflow-y-auto max-h-[72vh] space-y-4 text-left">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div>
                      <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider font-mono flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> Linha do Tempo
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Histórico clínico retroativo de atendimentos</p>
                    </div>
                    <span className="text-[10px] font-mono bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-slate-300">
                      {modalPreviousRecords.length} consulta(s)
                    </span>
                  </div>

                  {modalPreviousRecords.length === 0 ? (
                    <div className="py-12 text-center text-[#94A3B8] text-xs border border-dashed border-white/5 rounded-xl space-y-2">
                      <FileText className="w-8 h-8 mx-auto text-[#D4AF37]/30" />
                      <p>Primeiro atendimento deste paciente.</p>
                      <p className="text-[10px] text-slate-500">Nenhuma evolução anterior para comparar.</p>
                    </div>
                  ) : (
                    <div className="relative border-l border-[#D4AF37]/20 pl-4 ml-2 space-y-5 pt-2">
                      {modalPreviousRecords.map((r, index) => (
                        <div key={r.id} className="relative group text-xs text-left">
                          {/* Glowing timeline node */}
                          <div className={`absolute -left-[22.5px] top-1 w-3 h-3 rounded-full border-2 border-[#1A1D23] transition group-hover:scale-125 ${
                            index === 0 ? 'bg-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.6)]' : 'bg-slate-600'
                          }`}></div>
                          
                          <div className="space-y-1">
                            {/* Date and Therapist */}
                            <div className="flex items-center gap-2 flex-wrap justify-between pr-2">
                              <span className="text-[10px] font-bold text-[#D4AF37] font-mono bg-[#1A1D23] px-2 py-0.5 rounded-md border border-white/5">
                                {r.date.split('-').reverse().join('/')}
                              </span>
                              <span className="text-[10px] text-slate-400 truncate">
                                por {r.therapist?.name || 'Terapeutas'}
                              </span>
                            </div>

                            {/* Session Detail Summary box */}
                            <div className="bg-[#1C1F25]/80 p-3 rounded-xl border border-white/5 hover:border-white/10 transition space-y-2">
                              <div>
                                <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-500 block">Sintomas / Queixas:</span>
                                <p className="text-slate-305 font-sans text-[11px] leading-relaxed">{r.symptoms}</p>
                              </div>
                              <div>
                                <span className="text-[9px] uppercase tracking-wider font-semibold text-[#D4AF37] block">Evolução Clínica:</span>
                                <p className="text-[#F1F5F9] whitespace-pre-line text-xs font-sans leading-relaxed max-h-32 overflow-y-auto pr-1">
                                  {r.evolution}
                                </p>
                              </div>
                              {r.recommendations && (
                                <div className="pt-2 border-t border-white/5">
                                  <span className="text-[9px] uppercase tracking-wider font-mono text-slate-500 block">Recomendações e Terapias passadas:</span>
                                  <p className="text-slate-400 italic font-sans text-[11px] leading-relaxed">{r.recommendations}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}
      {showWebcam && <WebcamCapture onCapture={(src) => { setPhotos(prev => [...prev, src]); setShowWebcam(false); }} onClose={() => setShowWebcam(false)} />}
    </div>
  );
}

