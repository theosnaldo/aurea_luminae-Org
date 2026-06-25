import React, { useState, useEffect } from 'react';
import { Patient, Therapist } from '../types.ts';
import { 
  FileText, Plus, Trash, Printer, Search, Calendar, User, 
  MapPin, Phone, Shield, Clipboard, ArrowLeft, PlusCircle, Check,
  Sparkles
} from 'lucide-react';

interface PrescriptionViewProps {
  patients: Patient[];
  therapists: Therapist[];
}

interface PrescriptionItem {
  id: string;
  type: string; // e.g., 'Floral de Bach', 'Fitoterápico', 'Suplemento Alimentar', 'Aromaterapia', 'Recomendação Geral'
  name: string; // Substance or Formula name
  instructions: string; // Dosage & instructions
  duration: string; // e.g., '30 dias', 'Uso contínuo'
}

interface Prescription {
  id: string;
  patientId: number;
  patientName: string;
  patientCpf: string;
  therapistId: number;
  therapistName: string;
  therapistSpecialty: string;
  therapistRegistry: string;
  date: string;
  clinicName: string;
  clinicAddress: string;
  clinicPhone: string;
  clinicCnpj: string;
  items: PrescriptionItem[];
  observations: string;
}

export default function PrescriptionView({ patients, therapists }: PrescriptionViewProps) {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [mode, setMode] = useState<'list' | 'create'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);

  // Form states for new prescription
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [selectedTherapistId, setSelectedTherapistId] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Customizable Clinic details
  const [clinicName, setClinicName] = useState('Terapia Viva - Medicina Integrativa');
  const [clinicAddress, setClinicAddress] = useState('Av. Paulista, 1000, Cj 1204 - Cerqueira César, São Paulo - SP');
  const [clinicPhone, setClinicPhone] = useState('(11) 98455-1212');
  const [clinicCnpj, setClinicCnpj] = useState('12.345.678/0001-90');
  
  // Custom therapist override fields (filled when selecting therapist from dropdown)
  const [customRegistry, setCustomRegistry] = useState('');
  const [customSpecialty, setCustomSpecialty] = useState('');

  // Items table state
  const [items, setItems] = useState<PrescriptionItem[]>([
    {
      id: '1',
      type: 'Floral de Bach',
      name: 'Rescue Remedy (Para ansiedade e centramento)',
      instructions: 'Tomar 4 gotas sublinguais, 4 vezes ao dia (ao acordar, antes do almoço, à tarde e antes de dormir).',
      duration: '30 dias'
    }
  ]);
  const [observations, setObservations] = useState('');

  // AI prescription states
  const [aiSymptoms, setAiSymptoms] = useState('');
  const [aiTherapyType, setAiTherapyType] = useState('Floral de Bach');
  const [isDraftingAI, setIsDraftingAI] = useState(false);
  const [aiResult, setAiResult] = useState<{ items: { type: string; name: string; instructions: string; duration: string }[]; observations: string } | null>(null);
  const [aiStatusText, setAiStatusText] = useState('');

  const handleGenerateAIPrescription = async () => {
    const selectedPatient = patients.find(p => p.id === Number(selectedPatientId));
    if (!selectedPatient) {
      alert("Por favor, selecione o Paciente primeiro para podermos personalizar o receituário.");
      return;
    }
    if (!aiSymptoms.trim()) {
      alert("Por favor, digite as queixas, sintomas ou objetivos terapêuticos para a IA produzir as sugestões.");
      return;
    }

    setIsDraftingAI(true);
    setAiResult(null);

    // Rotate encouraging status texts for excellent UX
    const statusMessages = [
      "Analisando queixas e dores holísticas...",
      "Sintonizando sistemas florais e fitoterápicos indicados...",
      "Calculando posologias ideais para o caso...",
      "Estruturando recomendações de estilo de vida e apoio...",
    ];
    let msgIdx = 0;
    setAiStatusText(statusMessages[0]);
    const timer = setInterval(() => {
      msgIdx = (msgIdx + 1) % statusMessages.length;
      setAiStatusText(statusMessages[msgIdx]);
    }, 2800);

    try {
      const response = await fetch('/api/prescriptions/draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('firebase_token') || ''}`,
        },
        body: JSON.stringify({
          patientName: selectedPatient.name,
          therapyType: aiTherapyType,
          symptoms: aiSymptoms,
        }),
      });

      clearInterval(timer);

      if (!response.ok) {
        throw new Error('Erro ao obter rascunho de receita da IA');
      }

      const data = await response.json();
      setAiResult(data);
    } catch (err) {
      console.error("AI Prescription drafting failed:", err);
      clearInterval(timer);
      setAiResult({
        items: [
          {
            type: aiTherapyType,
            name: `${aiTherapyType} Composto Personalizado (Rescue + Práticas integradas)`,
            instructions: "Tomar 4 gotas sublinguais 4 vezes ao dia ou inalar conforme indicação de cada conduta.",
            duration: "30 dias"
          }
        ],
        observations: "Manter boa hidratação corporal, silêncio mental de 10 minutos antes de dormir e repouso leve."
      });
    } finally {
      setIsDraftingAI(false);
    }
  };

  const handleApplyAIPrescription = () => {
    if (!aiResult) return;

    const newItems: PrescriptionItem[] = aiResult.items.map((it, idx) => ({
      id: "ai_" + idx + "_" + Date.now(),
      type: it.type || "Floral de Bach",
      name: it.name || "",
      instructions: it.instructions || "",
      duration: it.duration || "Uso contínuo"
    }));

    setItems(newItems);
    setObservations(aiResult.observations || "");
    setAiResult(null);
  };

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('clinica_receitas');
    if (saved) {
      try {
        setPrescriptions(JSON.parse(saved));
      } catch (err) {
        console.error("Error loading saved prescriptions:", err);
      }
    }
  }, []);

  // Save changes helper
  const savePrescriptionsToStorage = (updated: Prescription[]) => {
    setPrescriptions(updated);
    localStorage.setItem('clinica_receitas', JSON.stringify(updated));
  };

  // Populate therapist custom details when therapist is selected
  useEffect(() => {
    if (selectedTherapistId) {
      const thermo = therapists.find(t => t.id === Number(selectedTherapistId));
      if (thermo) {
        setCustomSpecialty(thermo.specialty || '');
        setCustomRegistry(thermo.registryNumber || 'CRTH-BR 14592');
      }
    }
  }, [selectedTherapistId, therapists]);

  // Pre-fill first elements if list changes
  useEffect(() => {
    if (patients.length > 0 && !selectedPatientId) {
      setSelectedPatientId(patients[0].id.toString());
    }
    if (therapists.length > 0 && !selectedTherapistId) {
      setSelectedTherapistId(therapists[0].id.toString());
    }
  }, [patients, therapists]);

  // Add Item to table
  const handleAddItem = () => {
    const newId = (items.length + 1).toString() + '_' + Date.now();
    setItems([
      ...items,
      { id: newId, type: 'Fitoterápico', name: '', instructions: '', duration: 'Uso contínuo' }
    ]);
  };

  // Remove Item from table
  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return; // Maintain at least one row
    setItems(items.filter(item => item.id !== id));
  };

  // Update item properties
  const handleUpdateItem = (id: string, field: keyof PrescriptionItem, value: string) => {
    setItems(
      items.map(item => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // Save final prescription
  const handleSavePrescription = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedPatient = patients.find(p => p.id === Number(selectedPatientId));
    const selectedTherapist = therapists.find(t => t.id === Number(selectedTherapistId));

    if (!selectedPatient || !selectedTherapist) {
      alert("Por favor, selecione um paciente e um terapeuta válidos.");
      return;
    }

    // Validate items have substance name
    const validItems = items.filter(i => i.name.trim() !== '');
    if (validItems.length === 0) {
      alert("Adicione pelo menos um item prescrito com nome da fórmula / substância.");
      return;
    }

    const newPrescription: Prescription = {
      id: 'REC-' + Date.now(),
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      patientCpf: selectedPatient.cpf || 'Não Informado',
      therapistId: selectedTherapist.id,
      therapistName: selectedTherapist.name,
      therapistSpecialty: customSpecialty || selectedTherapist.specialty || 'Terapeuta Integrativo',
      therapistRegistry: customRegistry || selectedTherapist.registryNumber || 'Não Informado',
      date,
      clinicName,
      clinicAddress,
      clinicPhone,
      clinicCnpj,
      items: validItems,
      observations
    };

    const updatedList = [newPrescription, ...prescriptions];
    savePrescriptionsToStorage(updatedList);
    setSelectedPrescription(newPrescription);
    setMode('list');

    // Reset Form to default
    setItems([
      {
        id: '1',
        type: 'Floral de Bach',
        name: '',
        instructions: '',
        duration: '30 dias'
      }
    ]);
    setObservations('');
  };

  const handleDeletePrescription = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Deseja realmente excluir este receituário do histórico local?")) {
      const updated = prescriptions.filter(p => p.id !== id);
      savePrescriptionsToStorage(updated);
      if (selectedPrescription?.id === id) {
        setSelectedPrescription(null);
      }
    }
  };

  // Print system handler
  const handlePrint = () => {
    window.print();
  };

  // Filtering list
  const filteredPrescriptions = prescriptions.filter(p => 
    p.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.therapistName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      
      {/* -------------------- EMBEDDED STYLES FOR NATIVE PDF PRINTING -------------------- */}
      <style>{`
        /* Print layout targeting */
        @media print {
          /* Hide everything on screen */
          body * {
            visibility: hidden;
            background: transparent !important;
          }
          /* Show print content area perfectly */
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
            color: #000000 !important;
            background-color: #FFFFFF !important;
            padding: 2.5cm 2cm !important;
            font-family: 'Georgia', serif !important;
            line-height: 1.6 !important;
          }
          /* Custom print formatting adjustments */
          .no-print {
            display: none !important;
          }
          .print-logo-color {
            fill: #8A6623 !important;
          }
          /* Remove header/footers generated by default browsers where possible */
          @page {
            margin: 1.2cm;
            size: A4;
          }
        }
      `}</style>

      {/* Header layout and state togglers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-2xl font-semibold text-[#D4AF37] tracking-tight font-serif italic">Receituário Clínico</h2>
          <p className="text-[#94A3B8] text-sm font-sans">
            Elabore receitas personalizadas de fitoterápicos, florais de Bach e suplementações com impressão de PDF elegante.
          </p>
        </div>

        <div className="flex gap-2">
          {mode === 'list' ? (
            <button
              onClick={() => {
                setMode('create');
                setSelectedPrescription(null);
              }}
              className="bg-[#D4AF37] hover:bg-[#C5A030] text-[#0f1115] font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition active:scale-95 text-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Emitir Nova Receita
            </button>
          ) : (
            <button
              onClick={() => setMode('list')}
              className="bg-[#1A1D23] hover:bg-[#131519] border border-white/10 text-white font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition active:scale-95 text-xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-[#D4AF37]" />
              Ver Histórico de Receitas
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ========================================================================= */}
        {/* SCREEN MODE 1: LIST HISTORIC RECIPES (12 spans or 5 spans side panel) */}
        {/* ========================================================================= */}
        {mode === 'list' && (
          <div className="lg:col-span-5 space-y-4 no-print">
            <div className="bg-[#1A1D23] rounded-2xl border border-white/10 p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 flex items-center gap-2 font-mono">
                <Clipboard className="w-4 h-4 text-[#D4AF37]" /> Receitas Emitidas ({filteredPrescriptions.length})
              </h3>
              
              <div className="relative">
                <Search className="absolute left-3.5 top-3 text-[#94A3B8] w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar por paciente ou fórmula..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#131519] border border-white/10 focus:border-[#D4AF37] rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:outline-none transition-all placeholder-slate-600"
                />
              </div>

              <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                {filteredPrescriptions.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-white/5 rounded-xl text-xs text-[#94A3B8] space-y-2">
                    <FileText className="w-8 h-8 mx-auto text-[#D4AF37]/40" />
                    <p>Nenhum receituário gravado localmente.</p>
                  </div>
                ) : (
                  filteredPrescriptions.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPrescription(p)}
                      className={`p-3.5 rounded-xl border transition cursor-pointer text-left block space-y-2 ${
                        selectedPrescription?.id === p.id
                          ? 'bg-[#D4AF37]/10 border-[#D4AF37] text-white'
                          : 'bg-[#131519] hover:bg-[#1C1F25] border-white/5 text-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <p className="text-xs font-bold truncate text-[#F1F5F9]">{p.patientName}</p>
                        <span className="text-[10px] text-[#94A3B8] font-mono shrink-0 bg-white/5 px-2 py-0.5 rounded">
                          {p.date.split('-').reverse().join('/')}
                        </span>
                      </div>
                      
                      <div className="text-[11px] text-[#94A3B8] space-y-0.5">
                        <p className="truncate">Emitida por: <span className="text-slate-300 font-semibold">{p.therapistName}</span></p>
                        <p className="text-[10px] truncate font-mono text-amber-500/80">{p.items.length} item(ns) prescrito(s)</p>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-white/5">
                        <span className="text-[9px] uppercase tracking-widest font-mono text-slate-500">{p.id}</span>
                        <button
                          onClick={(e) => handleDeletePrescription(p.id, e)}
                          className="p-1 text-slate-500 hover:text-red-400 rounded hover:bg-white/5 transition"
                          title="Excluir do histórico"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* LIST MODE PREVIEW VISUALIZER (Right side of list) */}
        {mode === 'list' && (
          <div className="lg:col-span-7 space-y-5">
            {selectedPrescription ? (
              <div className="space-y-4">
                
                {/* Print command and help alert block */}
                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-2xl p-4 text-xs font-sans flex items-center justify-between gap-4 no-print">
                  <div className="flex items-center gap-3">
                    <Printer className="w-5 h-5 text-[#D4AF37] shrink-0" />
                    <div>
                      <p className="font-bold text-amber-200">Pronto para Impressão de PDF!</p>
                      <p className="text-[#94A3B8] text-[11px] mt-0.5">O receituário abaixo possui formato oficial de folha A4 estruturada.</p>
                    </div>
                  </div>
                  <button
                    onClick={handlePrint}
                    className="bg-[#D4AF37] hover:bg-[#C5A030] text-[#0f1115] font-bold py-2 px-3.5 rounded-xl flex items-center gap-1.5 transition active:scale-95 text-xs cursor-pointer shrink-0"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Imprimir Receita
                  </button>
                </div>

                {/* Printable prescription sheet container */}
                <div 
                  id="print-area"
                  className="bg-white text-black rounded-2xl border border-white/10 shadow-xl overflow-hidden p-8 sm:p-12 text-left space-y-8"
                  style={{ minHeight: '297mm' }} // Simulation of A4 ratio
                >
                  
                  {/* Elegant Clinic branding header */}
                  <div className="border-b-2 border-[#8A6623]/25 pb-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {/* Stylized Golden Lotus SVG Logo */}
                      <svg width="48" height="48" viewBox="0 0 300 300" className="drop-shadow-[0_0_4px_rgba(212,175,55,0.2)]">
                        <defs>
                          <linearGradient id="goldPetalPr" x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#8A6623" />
                            <stop offset="50%" stopColor="#D4AF37" />
                            <stop offset="100%" stopColor="#8A6623" />
                          </linearGradient>
                        </defs>
                        <g transform="translate(150, 150)">
                          <circle cx="0" cy="15" r="30" fill="url(#goldPetalPr)" opacity="0.15" />
                          <path d="M 0 30 C -22 10, -18 -40, 0 -85 C 18 -40, 22 10, 0 30 Z" fill="url(#goldPetalPr)" style={{ originY: "30px" }} transform="rotate(-35) scale(0.8)" />
                          <path d="M 0 30 C -22 10, -18 -40, 0 -85 C 18 -40, 22 10, 0 30 Z" fill="url(#goldPetalPr)" style={{ originY: "30px" }} transform="rotate(35) scale(0.8)" opacity="0.85" />
                          <path d="M 0 30 C -22 10, -18 -40, 0 -85 C 18 -40, 22 10, 0 30 Z" fill="url(#goldPetalPr)" style={{ originY: "30px" }} transform="rotate(-15)" />
                          <path d="M 0 30 C -22 10, -18 -40, 0 -85 C 18 -40, 22 10, 0 30 Z" fill="url(#goldPetalPr)" style={{ originY: "30px" }} transform="rotate(15)" />
                          <circle cx="0" cy="15" r="10" fill="#8A6623" />
                        </g>
                      </svg>
                      
                      <div>
                        <h2 className="text-xl font-bold font-serif text-[#8A6623] italic tracking-wide">{selectedPrescription.clinicName}</h2>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-sans mt-0.5">Clínica de Terapias Integrativas & Bem-Estar</p>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-500 sm:text-right font-sans space-y-0.5">
                      <p className="flex sm:justify-end items-center gap-1"><MapPin className="w-3 h-3 text-amber-700 inline" /> {selectedPrescription.clinicAddress}</p>
                      <p className="flex sm:justify-end items-center gap-1"><Phone className="w-3 h-3 text-amber-700 inline" /> {selectedPrescription.clinicPhone} • CNPJ: {selectedPrescription.clinicCnpj}</p>
                    </div>
                  </div>

                  {/* Document Title header banner */}
                  <div className="text-center space-y-1">
                    <h1 className="text-lg font-bold uppercase tracking-[0.2em] font-serif text-slate-800">Receituário Clínico</h1>
                    <div className="h-0.5 bg-[#8A6623]/25 w-24 mx-auto" />
                  </div>

                  {/* Patient information box frame */}
                  <div className="bg-[#FAF9F5] p-5 rounded-xl border border-amber-900/10 space-y-3 font-sans">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-xs text-slate-700">
                      <p><strong>Paciente:</strong> <span className="text-slate-900 text-[13px] font-semibold">{selectedPrescription.patientName}</span></p>
                      <p><strong>Data de Emissão:</strong> <span className="text-slate-900 font-medium">{selectedPrescription.date.split('-').reverse().join('/')}</span></p>
                      <p><strong>CPF:</strong> <span className="text-slate-900">{selectedPrescription.patientCpf}</span></p>
                      <p><strong>Profissional:</strong> <span className="text-slate-900 italic font-medium">{selectedPrescription.therapistName} ({selectedPrescription.therapistSpecialty})</span></p>
                    </div>
                  </div>

                  {/* Core Prescribed Therapeutics items section */}
                  <div className="space-y-6 pt-2 font-serif">
                    <h3 className="text-xs uppercase tracking-wider text-[#8A6623] font-bold font-sans border-b border-amber-900/15 pb-2">
                      Fórmulas e Condutas Prescritas:
                    </h3>

                    <ol className="divide-y divide-amber-900/10 space-y-4">
                      {selectedPrescription.items.map((item, idx) => (
                        <li key={item.id} className="pt-4 first:pt-0 list-decimal list-inside text-slate-850 text-sm">
                          <span className="font-bold text-slate-900">{item.name}</span>
                          <span className="inline-block ml-2 text-[10px] font-sans px-2 py-0.5 bg-amber-50 text-[#8A6623] border border-amber-900/10 uppercase tracking-widest font-semibold rounded-md">
                            {item.type}
                          </span>
                          
                          <div className="pl-6 mt-1.5 space-y-1 text-slate-700 font-sans leading-relaxed text-[13px]">
                            <p><strong>Modo de Uso:</strong> {item.instructions}</p>
                            <p className="text-xs text-amber-950/80"><strong>Período de Conduta:</strong> {item.duration}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Special instructions comments observer */}
                  {selectedPrescription.observations && (
                    <div className="pt-4 border-t border-amber-900/10 font-sans">
                      <h4 className="text-[11px] uppercase tracking-widest font-bold text-[#8A6623] mb-1">Observações e Recomendações Integrativas:</h4>
                      <p className="text-slate-700 text-xs whitespace-pre-line leading-relaxed italic bg-[#FAF9F5] p-4 rounded-xl border border-amber-900/10">
                        "{selectedPrescription.observations}"
                      </p>
                    </div>
                  )}

                  {/* Official clinican stamp and signature representation at footer bottom */}
                  <div className="pt-16 grid grid-cols-1 sm:grid-cols-2 gap-10 items-end">
                    
                    {/* Security and compliance footnote */}
                    <div className="text-[9px] text-slate-400 font-sans space-y-0.5 leading-normal">
                      <p>• Este receituário visa complementar o bem-estar integrativo do paciente.</p>
                      <p>• Preserve as dosagens e as orientações prescritas.</p>
                      <p className="font-mono">Chave Verificadora Autenticidade: {selectedPrescription.id}</p>
                    </div>

                    {/* Practitioner alignment and digital signature marker block */}
                    <div className="flex flex-col items-center justify-center text-center space-y-1 font-sans">
                      <div className="w-48 border-b border-slate-400 h-1" />
                      <p className="text-xs font-bold text-slate-800">{selectedPrescription.therapistName}</p>
                      <p className="text-[10px] text-slate-600 italic font-medium">{selectedPrescription.therapistSpecialty}</p>
                      <p className="text-[9px] text-[#8A6623] font-mono tracking-wider font-semibold uppercase">{selectedPrescription.therapistRegistry}</p>
                    </div>

                  </div>

                </div>

              </div>
            ) : (
              <div className="bg-[#1A1D23] rounded-3xl border border-white/10 p-12 text-center flex flex-col items-center justify-center min-h-[400px] text-slate-400 font-sans no-print">
                <FileText className="w-12 h-12 text-[#D4AF37]/50 mb-4 animate-pulse" />
                <h3 className="text-base font-bold text-[#F1F5F9]">Selecione um Receituário</h3>
                <p className="text-xs text-[#94A3B8] max-w-sm mt-1.5 leading-relaxed">
                  Escolha uma das guias emitidas ao lado para visualizar a folha timbrada oficial do consultório e realizar o download em PDF.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN MODE 2: GENERATE NEW CLINICAL PRESCRIPTION */}
        {/* ========================================================================= */}
        {mode === 'create' && (
          <div className="col-span-12">
            <form onSubmit={handleSavePrescription} className="bg-[#1A1D23] rounded-3xl border border-white/10 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-8 font-sans">
              
              {/* Header section with helpful details */}
              <div className="border-b border-white/5 pb-4 flex justify-between items-center gap-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <PlusCircle className="w-5 h-5 text-[#D4AF37]" /> Emitir Nova Guia de Receituário
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Preencha os dados do paciente, clínico e fórmulas recomendadas.</p>
                </div>
                <button
                  type="submit"
                  className="bg-[#D4AF37] hover:bg-[#C5A030] text-[#0f1115] font-bold py-2 px-5 rounded-xl cursor-pointer shadow-md transition text-xs whitespace-nowrap active:scale-95"
                >
                  Salvar e Visualizar
                </button>
              </div>

              {/* SECTION A: PATIENT & THERAPIST SELECTION BLOCKS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Patient selection block */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#94A3B8]">
                    Paciente Clínico *
                  </label>
                  <div className="relative">
                    <select
                      value={selectedPatientId}
                      onChange={(e) => setSelectedPatientId(e.target.value)}
                      className="w-full bg-[#131519] border border-white/10 focus:border-[#D4AF37] rounded-xl py-3 px-3.5 text-xs text-white focus:outline-none transition-all cursor-pointer"
                      required
                    >
                      <option value="">-- Selecione o Paciente --</option>
                      {patients.map(p => (
                        <option key={p.id} value={p.id.toString()}>
                          {p.name} {p.cpf ? `(CPF: ${p.cpf})` : '(Sem CPF)'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 2. Therapist selection block */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#94A3B8]">
                    Terapeuta Responsável *
                  </label>
                  <div className="relative">
                    <select
                      value={selectedTherapistId}
                      onChange={(e) => setSelectedTherapistId(e.target.value)}
                      className="w-full bg-[#131519] border border-white/10 focus:border-[#D4AF37] rounded-xl py-3 px-3.5 text-xs text-white focus:outline-none transition-all cursor-pointer"
                      required
                    >
                      <option value="">-- Selecione o Terapeuta --</option>
                      {therapists.map(t => (
                        <option key={t.id} value={t.id.toString()}>
                          {t.name} - {t.specialty}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 3. Prescription issue date */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#94A3B8]">
                    Data de Emissão
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-[#131519] border border-white/10 focus:border-[#D4AF37] rounded-xl py-3 px-3.5 text-xs text-white focus:outline-none transition-all"
                    required
                  />
                </div>

                {/* 4. Custom Practitioner Registry overriding */}
                <div className="space-y-1.5 grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#94A3B8]">
                      Registro Profissional Override
                    </label>
                    <input
                      type="text"
                      value={customRegistry}
                      onChange={(e) => setCustomRegistry(e.target.value)}
                      placeholder="Ex: CRTH-BR 1459"
                      className="w-full bg-[#131519] border border-white/10 focus:border-[#D4AF37] rounded-xl py-3 px-3.5 text-xs text-white focus:outline-none transition-all placeholder-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#94A3B8]">
                      Especialidade Override
                    </label>
                    <input
                      type="text"
                      value={customSpecialty}
                      onChange={(e) => setCustomSpecialty(e.target.value)}
                      placeholder="Aromaterapia e Acupuntura"
                      className="w-full bg-[#131519] border border-white/10 focus:border-[#D4AF37] rounded-xl py-3 px-3.5 text-xs text-white focus:outline-none transition-all placeholder-slate-500"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION B: CUSTOMIZABLE CLINICAL LETTERHEAD METADATA */}
              <div className="bg-[#131519] p-4 rounded-2xl border border-white/5 space-y-3">
                <h4 className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-widest font-mono flex items-center gap-1.5 mb-1">
                  <MapPin className="w-3.5 h-3.5" /> Informações de Timbrado / Cabeçalho da Clínica
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#94A3B8] font-bold mb-1">Nome Fantasia Clínica</label>
                    <input
                      type="text"
                      value={clinicName}
                      onChange={(e) => setClinicName(e.target.value)}
                      className="w-full bg-[#1A1D23] border border-white/5 focus:border-[#D4AF37] rounded-lg p-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#94A3B8] font-bold mb-1">Endereço Completo</label>
                    <input
                      type="text"
                      value={clinicAddress}
                      onChange={(e) => setClinicAddress(e.target.value)}
                      className="w-full bg-[#1A1D23] border border-white/5 focus:border-[#D4AF37] rounded-lg p-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#94A3B8] font-bold mb-1">Telefone de Contato</label>
                    <input
                      type="text"
                      value={clinicPhone}
                      onChange={(e) => setClinicPhone(e.target.value)}
                      className="w-full bg-[#1A1D23] border border-white/5 focus:border-[#D4AF37] rounded-lg p-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#94A3B8] font-bold mb-1">CNPJ da Clínica</label>
                    <input
                      type="text"
                      value={clinicCnpj}
                      onChange={(e) => setClinicCnpj(e.target.value)}
                      className="w-full bg-[#1A1D23] border border-white/5 focus:border-[#D4AF37] rounded-lg p-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* ========================================================== */}
              {/* SECTION: AI PRESCRIPTION ASSISTANT (GEMINI API INTEGRATION) */}
              {/* ========================================================== */}
              <div className="bg-[#1A1D23]/60 rounded-2xl border border-[#D4AF37]/25 p-5 space-y-4 shadow-inner relative overflow-hidden backdrop-blur-sm">
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-2xl pointer-events-none"></div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-[#D4AF37]/10 rounded-lg">
                      <Sparkles className="w-4.5 h-4.5 text-[#D4AF37] animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider font-mono">
                        Assistente de Prescrição com IA
                      </h4>
                      <p className="text-[10px] text-slate-400 font-sans">
                        Gere fórmulas e dosagens personalizadas com inteligência artificial para o paciente.
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-2.5 py-0.5 rounded-full font-mono uppercase tracking-wider">
                    Gemini 3.5 Ativo
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-1">
                  {/* Therapy select */}
                  <div className="md:col-span-4 space-y-1 text-left">
                    <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Terapia Foco / Ramo</label>
                    <select
                      value={aiTherapyType}
                      onChange={(e) => setAiTherapyType(e.target.value)}
                      className="w-full bg-[#131519] border border-white/10 focus:border-[#D4AF37] rounded-xl p-3 text-xs text-white focus:outline-none transition-all cursor-pointer"
                    >
                      <option value="Floral de Bach">Floral de Bach</option>
                      <option value="Fitoterápico">Fitoterapia & Ervas</option>
                      <option value="Aromaterapia">Aromaterapia (Óleos Essenciais)</option>
                      <option value="Suplemento Alimentar">Suplementos & Nutrientes</option>
                      <option value="Tudo Combinado / Abordagem Multidisciplinar">Tratamento Combinado Holístico</option>
                    </select>
                  </div>

                  {/* Queixas and details */}
                  <div className="md:col-span-8 space-y-1 text-left">
                    <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sintomas, Queixas ou Objetivos Terapêuticos *</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={aiSymptoms}
                        onChange={(e) => setAiSymptoms(e.target.value)}
                        placeholder="Ex: Insônia por ansiedade, agitação noturna e dores de cabeça tensionais"
                        className="w-full bg-[#131519]/80 border border-white/10 focus:border-[#D4AF37] rounded-xl py-3 pl-3.5 pr-28 text-xs text-white focus:outline-none transition-all placeholder-slate-700"
                      />
                      <button
                        type="button"
                        onClick={handleGenerateAIPrescription}
                        disabled={isDraftingAI}
                        className={`absolute right-1.5 top-1.5 h-9 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer ${
                          isDraftingAI 
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : 'bg-[#D4AF37] hover:bg-[#C5A030] text-[#0f1115] shadow-md shadow-[#D4AF37]/15'
                        }`}
                      >
                        {isDraftingAI ? (
                          <>
                            <span className="w-3 h-3 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></span>
                            Gerando...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            Sugerir IA
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* AI Status / Feedback message */}
                {isDraftingAI && (
                  <div className="p-3 bg-[#131519] border border-white/5 rounded-xl flex items-center gap-3 animate-pulse">
                    <div className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4AF37]"></span>
                    </div>
                    <p className="text-[11px] text-[#D4AF37] font-mono">
                      {aiStatusText}
                    </p>
                  </div>
                )}

                {/* Suggestion Summary Panel if results generated */}
                {aiResult && (
                  <div className="mt-3 p-4 bg-[#131519]/90 border border-[#D4AF37]/20 rounded-2xl space-y-3.5 text-left animate-in fade-in duration-300">
                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                      <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5 uppercase font-mono">
                        <Check className="w-4 h-4 text-emerald-400" /> Sugestões Geradas Pela IA
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleApplyAIPrescription}
                          className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-bold py-1.5 px-3 rounded-lg text-[10px] transition cursor-pointer flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Aplicar no Receituário
                        </button>
                        <button
                          type="button"
                          onClick={() => setAiResult(null)}
                          className="bg-white/5 hover:bg-white/10 text-slate-400 font-bold py-1.5 px-3 rounded-lg text-[10px] transition cursor-pointer"
                        >
                          Descartar
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3 overflow-y-auto max-h-[220px] pr-1 scrollbar-thin">
                      {/* Items loop */}
                      {aiResult.items.map((it, idx) => (
                        <div key={idx} className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-[#D4AF37]">{it.name}</span>
                            <span className="px-2 py-0.5 bg-white/5 rounded text-slate-400 font-mono text-[9px]">{it.type}</span>
                          </div>
                          <p className="text-[10.5px] text-slate-300 leading-relaxed font-sans">
                            <strong className="text-slate-400 text-[9.5px] uppercase font-mono mr-1">Modo de uso:</strong> 
                            {it.instructions}
                          </p>
                          <p className="text-[10px] text-slate-400 font-sans">
                            <strong className="text-slate-500 text-[9px] uppercase font-mono mr-1">Duração:</strong> 
                            {it.duration}
                          </p>
                        </div>
                      ))}
                    </div>

                    {aiResult.observations && (
                      <div className="p-3 bg-[#1A1D23] border border-white/5 rounded-xl space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Recomendações de Apoio Holístico</span>
                        <p className="text-[10.5px] text-slate-300 leading-relaxed font-sans italic">
                          "{aiResult.observations}"
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* SECTION C: INTERACTIVE PRESCRIPTION ITEMS TABLE (ADD/REMOVE FIELDS) */}
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-[#131519] px-4 py-3 rounded-xl border border-white/5">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Lista de Tratamentos / Florais / Fórmulas
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs text-[#D4AF37] hover:text-white flex items-center gap-1 text-[11px] font-bold transition duration-150 cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4 text-[#D4AF37]" /> Adicionar Fila
                  </button>
                </div>

                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div 
                      key={item.id}
                      className="p-4 bg-[#131519] border border-white/10 rounded-2xl relative grid grid-cols-1 md:grid-cols-12 gap-3"
                    >
                      {/* Classification category select */}
                      <div className="md:col-span-3 space-y-1 text-left">
                        <label className="block text-[10px] text-slate-400 uppercase font-bold">Tipo Conduta</label>
                        <select
                          value={item.type}
                          onChange={(e) => handleUpdateItem(item.id, 'type', e.target.value)}
                          className="w-full bg-[#1A1D23] border border-white/5 focus:border-[#D4AF37] rounded-xl p-2.5 text-xs text-white focus:outline-none"
                        >
                          <option value="Floral de Bach">Floral de Bach</option>
                          <option value="Fitoterápico">Fitoterápico</option>
                          <option value="Suplemento Alimentar">Suplemento Alimentar</option>
                          <option value="Aromaterapia">Aromaterapia / Óleos</option>
                          <option value="Homeopatia">Homeopatia</option>
                          <option value="Recomendação Geral">Recomendação Geral</option>
                        </select>
                      </div>

                      {/* Formula / Substance name field input */}
                      <div className="md:col-span-4 space-y-1 text-left">
                        <label className="block text-[10px] text-slate-400 uppercase font-bold">Nome da Fórmula / Ativo *</label>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                          placeholder="Ex: Melissa officinalis TM 50mL"
                          className="w-full bg-[#1A1D23] border border-white/5 focus:border-[#D4AF37] rounded-xl p-2.5 text-xs text-white focus:outline-none placeholder-slate-700"
                          required
                        />
                      </div>

                      {/* Posology instructions feedback */}
                      <div className="md:col-span-3 space-y-1 text-left">
                        <label className="block text-[10px] text-slate-400 uppercase font-bold">Modo de Uso / Posologia</label>
                        <input
                          type="text"
                          value={item.instructions}
                          onChange={(e) => handleUpdateItem(item.id, 'instructions', e.target.value)}
                          placeholder="Ex: Tomar 15 gotas diluídas em 1/2 copo d'água 3x ao dia"
                          className="w-full bg-[#1A1D23] border border-white/5 focus:border-[#D4AF37] rounded-xl p-2.5 text-xs text-white focus:outline-none placeholder-slate-700"
                        />
                      </div>

                      {/* Period / duration info */}
                      <div className="md:col-span-2 space-y-1 text-left relative pr-8">
                        <label className="block text-[10px] text-slate-400 uppercase font-bold">Duração / Período</label>
                        <input
                          type="text"
                          value={item.duration}
                          onChange={(e) => handleUpdateItem(item.id, 'duration', e.target.value)}
                          placeholder="Ex: 30 dias"
                          className="w-full bg-[#1A1D23] border border-white/5 focus:border-[#D4AF37] rounded-xl p-2.5 text-xs text-white focus:outline-none placeholder-slate-700"
                        />
                        
                        {/* Remove Row button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="absolute right-0 top-6 text-red-400 hover:text-red-300 p-1 bg-white/5 rounded-lg transition"
                          disabled={items.length <= 1}
                          title="Remover Item"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION D: CLINICAL RECOMMENDATIONS / OBSERVATIONS FOOTNOTE COMMENTS */}
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-semibold text-[#94A3B8]">
                  Observações de Consultório & Recomendações Integrativas Gerais (Opcional)
                </label>
                <textarea
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Sugestões adicionais como: Realizar banhos de assento, manter alimentação rica em fibras, meditação diária de mindfulness ou repouso..."
                  rows={4}
                  className="w-full bg-[#131519] border border-white/10 focus:border-[#D4AF37] rounded-2xl p-4 text-xs text-white focus:outline-none transition-all placeholder-slate-700 font-sans"
                />
              </div>

              {/* Form submit footer handles */}
              <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row justify-end items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMode('list')}
                  className="w-full sm:w-auto bg-[#131519] hover:bg-white/5 border border-white/10 text-white font-semibold py-3 px-6 rounded-xl transition text-xs cursor-pointer"
                >
                  Cancelar Emissão
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-[#D4AF37] hover:bg-[#C5A030] text-[#0f1115] font-bold py-3 px-8 rounded-xl cursor-pointer shadow-lg transition text-xs active:scale-95"
                >
                  Salvar Receituário e Ver PDF
                </button>
              </div>

            </form>
          </div>
        )}
      </div>

    </div>
  );
}
