import React, { useState } from 'react';
import { Patient, Appointment } from '../types.ts';
import { Users, Search, Plus, Trash, Edit, Phone, Mail, FileText, Calendar, X, Check, Award } from 'lucide-react';
import { maskCPF, maskPhone } from '../lib/masking';

interface PatientsViewProps {
  patients: Patient[];
  appointments: Appointment[];
  onAddPatient: (data: any) => void;
  onEditPatient: (id: number, data: any) => void;
  onDeletePatient: (id: number) => void;
}

export default function PatientsView({
  patients,
  appointments = [],
  onAddPatient,
  onEditPatient,
  onDeletePatient,
}: PatientsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [cpf, setCpf] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const filteredPatients = patients.filter((p) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;

    // Remove non-numeric characters for phone and CPF matches
    const cleanTerm = term.replace(/[^\d]/g, '');
    const cleanCpf = p.cpf ? p.cpf.replace(/[^\d]/g, '') : '';
    const cleanPhone = p.phone ? p.phone.replace(/[^\d]/g, '') : '';

    const matchesName = p.name.toLowerCase().includes(term);
    const matchesCpf = p.cpf && p.cpf.toLowerCase().includes(term);
    const matchesPhone = p.phone && p.phone.toLowerCase().includes(term);

    const matchesCleanCpf = cleanTerm && cleanCpf.includes(cleanTerm);
    const matchesCleanPhone = cleanTerm && cleanPhone.includes(cleanTerm);

    const patientAppointments = appointments.filter((a) => a.patientId === p.id);
    const matchesTherapy = patientAppointments.some((a) =>
      a.therapy?.name.toLowerCase().includes(term)
    );

    return (
      matchesName ||
      matchesCpf ||
      matchesPhone ||
      matchesCleanCpf ||
      matchesCleanPhone ||
      matchesTherapy
    );
  });

  const openAddModal = () => {
    setEditingPatient(null);
    setName('');
    setEmail('');
    setPhone('');
    setBirthDate('');
    setCpf('');
    setAddress('');
    setNotes('');
    setShowModal(true);
  };

  const openEditModal = (p: Patient) => {
    setEditingPatient(p);
    setName(p.name);
    setEmail(p.email || '');
    setPhone(p.phone);
    setBirthDate(p.birthDate || '');
    setCpf(p.cpf || '');
    setAddress(p.address || '');
    setNotes(p.notes || '');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    const payload = { name, email, phone, birthDate, cpf, address, notes };

    if (editingPatient) {
      onEditPatient(editingPatient.id, payload);
    } else {
      onAddPatient(payload);
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-[#D4AF37] tracking-tight font-serif italic">Cadastro de Pacientes</h2>
          <p className="text-[#94A3B8] text-sm font-sans">Cadastre, localize e acesse os históricos e fichas cadastrais dos clientes.</p>
        </div>
        
        <button
          onClick={openAddModal}
          className="bg-[#D4AF37] hover:bg-[#C5A030] text-[#0f1115] font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition active:scale-95 text-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Cadastrar Paciente
        </button>
      </div>

      {/* Search and stats bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 text-[#94A3B8] w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar por nome, CPF, telefone ou histórico de terapias (ex: Reiki, Massoterapia)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1A1D23] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs font-medium text-white focus:outline-none focus:border-[#D4AF37] transition placeholder-slate-600"
          />
        </div>
        <div className="bg-[#1A1D23] px-5 py-3 rounded-xl border border-white/10 flex items-center gap-3 text-xs font-semibold text-[#94A3B8]">
          <span>Total Filtrado:</span>
          <span className="bg-emerald-950/45 text-emerald-400 border border-emerald-900/30 px-2.5 py-1 rounded-md font-mono">{filteredPatients.length}</span>
        </div>
      </div>

      {/* Grid of Patient Cards */}
      {filteredPatients.length === 0 ? (
        <div className="bg-[#1A1D23] rounded-2xl border border-white/10 p-12 text-center text-[#94A3B8] text-xs">
          Nenhum paciente localizado. Redefina sua pesquisa ou registre um novo paciente.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredPatients.map((p) => (
            <div key={p.id} className="bg-[#1A1D23] rounded-2xl border border-white/10 p-5 shadow-sm space-y-4 hover:border-[#D4AF37]/35 transition">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-[#F1F5F9] text-base font-serif italic">{p.name}</h3>
                  {p.cpf && <p className="text-[10px] text-[#94A3B8] font-mono">CPF: {p.cpf}</p>}
                </div>
                
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => openEditModal(p)}
                    className="p-1.5 bg-white/5 hover:bg-white/10 text-[#E2E8F0] rounded-lg border border-white/5 transition cursor-pointer"
                    title="Editar informações"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeletePatient(p.id)}
                    className="p-1.5 bg-rose-950/40 hover:bg-rose-900/50 text-rose-450 rounded-lg border border-rose-900/20 transition cursor-pointer"
                    title="Remover cadastro"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#94A3B8] pt-2 border-t border-white/5">
                <div className="space-y-2">
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#D4AF37] shrink-0" />
                    <span>{p.phone}</span>
                  </p>
                  <p className="flex items-center gap-2 truncate">
                    <Mail className="w-4 h-4 text-[#D4AF37] shrink-0" />
                    <span className="truncate">{p.email || 'Não informado'}</span>
                  </p>
                </div>

                <div className="space-y-2">
                  {p.birthDate && (
                    <p className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#D4AF37] shrink-0" />
                      <span>{p.birthDate.split('-').reverse().join('/')}</span>
                    </p>
                  )}
                  {p.address && (
                    <p className="flex items-center gap-2 truncate" title={p.address}>
                      <FileText className="w-4 h-4 text-[#D4AF37] shrink-0" />
                      <span className="truncate">{p.address}</span>
                    </p>
                  )}
                </div>
              </div>

              {p.notes && (
                <div className="bg-[#131519]/80 p-3 rounded-xl text-xs text-[#94A3B8] border border-white/5 mt-2">
                  <span className="font-semibold block mb-1 text-[#D4AF37]">Histórico de Queixas / Alergias:</span>
                  {p.notes}
                </div>
              )}

              {/* Therapy Records History */}
              {(() => {
                const patientAppointments = appointments.filter(a => a.patientId === p.id);
                const uniqueTherapies = Array.from(new Set(
                  patientAppointments
                    .map(a => a.therapy?.name)
                    .filter((name): name is string => !!name)
                ));

                if (uniqueTherapies.length === 0) return null;

                return (
                  <div className="bg-[#1D170E]/40 p-3 rounded-xl text-xs text-[#94A3B8] border border-[#D4AF37]/10 mt-2 space-y-1.5 text-left">
                    <span className="font-semibold flex items-center gap-1.5 text-[#D4AF37] uppercase tracking-wider text-[9.5px]">
                      <Award className="w-3.5 h-3.5" /> Terapias Realizadas:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {uniqueTherapies.map((name, idx) => (
                        <span key={idx} className="bg-[#D4AF37]/10 text-[#D4AF37] text-[10px] font-medium px-2 py-0.5 rounded-md border border-[#D4AF37]/15">
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Patient Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-45 animate-fade-in">
          <div className="bg-[#1A1D23] rounded-2xl max-w-lg w-full border border-white/10 shadow-2xl overflow-hidden animate-scale-up">
            <div className="bg-[#131519] px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#D4AF37] flex items-center gap-1.5 font-serif italic">
                <Users className="w-4 h-4 text-[#D4AF37]" />
                {editingPatient ? 'Editar Cadastro do Paciente' : 'Cadastrar Novo Paciente'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-[#94A3B8] hover:text-[#E2E8F0] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#131519] border border-white/10 focus:border-[#D4AF37] rounded-xl p-2.5 text-xs text-white focus:outline-none transition-all placeholder-slate-600"
                    placeholder="Ex: Maria Oliveira Silva"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Telefone WhatsApp *</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(maskPhone(e.target.value))}
                    className="w-full bg-[#131519] border border-white/10 focus:border-[#D4AF37] rounded-xl p-2.5 text-xs text-white focus:outline-none transition-all placeholder-slate-600"
                    placeholder="Ex: (11) 98888-7777"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1">E-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#131519] border border-white/10 focus:border-[#D4AF37] rounded-xl p-2.5 text-xs text-white focus:outline-none transition-all placeholder-slate-600"
                    placeholder="Ex: maria.oliveira@teste.com"
                  />
                </div>

                {/* Birthdate */}
                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Data de Nascimento</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full bg-[#131519] border border-white/10 focus:border-[#D4AF37] rounded-xl p-2.5 text-xs text-white focus:outline-none transition-all"
                  />
                </div>

                {/* CPF */}
                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1">C.P.F</label>
                  <input
                    type="text"
                    value={cpf}
                    onChange={(e) => setCpf(maskCPF(e.target.value))}
                    className="w-full bg-[#131519] border border-white/10 focus:border-[#D4AF37] rounded-xl p-2.5 text-xs text-white focus:outline-none transition-all placeholder-slate-600"
                    placeholder="Ex: 333.444.555-66"
                  />
                </div>

                {/* Address */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Endereço Residencial</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-[#131519] border border-white/10 focus:border-[#D4AF37] rounded-xl p-2.5 text-xs text-white focus:outline-none transition-all placeholder-slate-600"
                    placeholder="Ex: Av. das Cerejeiras, 45 - Bloco B"
                  />
                </div>

                {/* Medical History / Notes */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Antecedentes Clínicos / Notas Importantes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full bg-[#131519] border border-white/10 focus:border-[#D4AF37] rounded-xl p-2.5 text-xs text-white focus:outline-none transition-all placeholder-slate-600"
                    placeholder="Sintomas reincidentes, recomendações, restrições ou alergias relatadas pelo paciente..."
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#94A3B8] hover:text-[#E2E8F0] bg-[#131519] rounded-xl border border-white/5 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-[#0f1115] bg-[#D4AF37] hover:bg-[#C5A030] rounded-xl transition shadow-sm cursor-pointer flex items-center justify-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  {editingPatient ? 'Salvar Edição' : 'Cadastrar Paciente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
