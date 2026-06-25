import React, { useState } from 'react';
import { Therapist, Therapy, Employee } from '../types.ts';
import { Sparkles, UserCheck, Award, Plus, Trash, Edit, Check, X, ShieldAlert, Coins } from 'lucide-react';
import { maskPhone } from '../lib/masking';

interface TherapistsViewProps {
  therapists: Therapist[];
  therapies: Therapy[];
  employees: Employee[];
  
  onAddTherapist: (data: any) => void;
  onEditTherapist: (id: number, data: any) => void;
  onDeleteTherapist: (id: number) => void;

  onAddTherapy: (data: any) => void;
  onEditTherapy: (id: number, data: any) => void;
  onDeleteTherapy: (id: number) => void;

  onAddEmployee: (data: any) => void;
  onEditEmployee: (id: number, data: any) => void;
  onDeleteEmployee: (id: number) => void;
}

type SubTab = 'therapists' | 'therapies' | 'employees';

export default function TherapistsView({
  therapists,
  therapies,
  employees,
  onAddTherapist,
  onEditTherapist,
  onDeleteTherapist,
  onAddTherapy,
  onEditTherapy,
  onDeleteTherapy,
  onAddEmployee,
  onEditEmployee,
  onDeleteEmployee,
}: TherapistsViewProps) {
  const [activeTab, setActiveTab] = useState<SubTab>('therapists');
  const [showModal, setShowModal] = useState(false);
  
  // States for general editing
  const [editId, setEditId] = useState<number | null>(null);

  // General fields for Therapists/Staff/Therapies
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [registryNumber, setRegistryNumber] = useState('');
  
  // Therapy fields
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('60');
  const [price, setPrice] = useState(''); // in BRL float

  // Staff fields
  const [role, setRole] = useState('');

  const openAddModal = () => {
    setEditId(null);
    setName('');
    setEmail('');
    setPhone('');
    setSpecialty('');
    setRegistryNumber('');
    setDescription('');
    setDuration('60');
    setPrice('');
    setRole('');
    setShowModal(true);
  };

  const openEditModal = (type: SubTab, item: any) => {
    setEditId(item.id);
    setName(item.name || '');
    setEmail(item.email || '');
    setPhone(item.phone || '');
    setSpecialty(item.specialty || '');
    setRegistryNumber(item.registryNumber || '');
    setDescription(item.description || '');
    setDuration(item.durationMinutes?.toString() || '60');
    setPrice(item.price ? (item.price / 100).toString() : '');
    setRole(item.role || '');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === 'therapists') {
      if (!name || !email || !specialty) return;
      const data = { name, email, phone, specialty, registryNumber };
      if (editId !== null) {
        onEditTherapist(editId, data);
      } else {
        onAddTherapist(data);
      }
    } else if (activeTab === 'therapies') {
      if (!name || !duration || !price) return;
      const amountInCents = Math.round(parseFloat(price) * 100);
      const data = { name, description, durationMinutes: parseInt(duration), price: amountInCents };
      if (editId !== null) {
        onEditTherapy(editId, data);
      } else {
        onAddTherapy(data);
      }
    } else if (activeTab === 'employees') {
      if (!name || !role) return;
      const data = { name, email, phone, role };
      if (editId !== null) {
        onEditEmployee(editId, data);
      } else {
        onAddEmployee(data);
      }
    }

    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-[#D4AF37] tracking-tight font-serif italic">Recursos & Serviços</h2>
          <p className="text-[#94A3B8] text-sm">Gerencie o catálogo de terapias integrativas disponíveis, profissionais credenciados e funcionários.</p>
        </div>

        <button
          onClick={openAddModal}
          className="bg-[#D4AF37] hover:bg-[#C5A030] text-[#0f1115] font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition active:scale-95 text-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {activeTab === 'therapists' ? 'Novo Terapeuta' : activeTab === 'therapies' ? 'Nova Terapia' : 'Novo Funcionário'}
        </button>
      </div>

      {/* Sub tabs selectors */}
      <div className="flex border-b border-white/10 gap-1 overflow-x-auto select-none">
        <button
          onClick={() => setActiveTab('therapists')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === 'therapists' ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-transparent text-[#94A3B8] hover:text-white'
          }`}
        >
          Terapeutas ({therapists.length})
        </button>
        <button
          onClick={() => setActiveTab('therapies')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === 'therapies' ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-transparent text-[#94A3B8] hover:text-white'
          }`}
        >
          Catálogo de Terapias ({therapies.length})
        </button>
        <button
          onClick={() => setActiveTab('employees')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === 'employees' ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-transparent text-[#94A3B8] hover:text-white'
          }`}
        >
          Equipe e Funcionários ({employees.length})
        </button>
      </div>

      {/* ----------------- THERAPISTS LIST ----------------- */}
      {activeTab === 'therapists' && (
        <div className="bg-[#1A1D23] rounded-2xl border border-white/10 shadow-sm overflow-hidden p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#F1F5F9] font-serif italic">Terapeutas Integrativos Ativos</h3>
          
          {therapists.length === 0 ? (
            <div className="text-center py-10 text-[#94A3B8] text-xs text-sans">
              Nenhum terapeuta integrativo cadastrado. Adicione o primeiro no botão acima.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {therapists.map((t) => (
                <div key={t.id} className="p-4 rounded-xl border border-white/10 bg-[#131519] flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-[#F1F5F9] text-sm">{t.name}</h4>
                    <p className="text-xs text-[#D4AF37] font-semibold mt-0.5">{t.specialty}</p>
                    <div className="text-[11px] text-[#94A3B8] space-y-0.5 mt-2 font-medium">
                      <p><span className="text-slate-500">Contato:</span> {t.phone}</p>
                      <p><span className="text-slate-500">Email:</span> {t.email}</p>
                      {t.registryNumber && <p><span className="text-slate-500">Conselho / Registro:</span> {t.registryNumber}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => openEditModal('therapists', t)}
                      className="p-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/5 transition cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteTherapist(t.id)}
                      className="p-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-450 rounded-lg border border-rose-900/20 transition cursor-pointer"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ------------------ THERAPIES LIST ------------------ */}
      {activeTab === 'therapies' && (
        <div className="bg-[#1A1D23] rounded-2xl border border-white/10 shadow-sm overflow-hidden p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#F1F5F9] font-serif italic">Listagem de Terapias & Preços</h3>

          {therapies.length === 0 ? (
            <div className="text-center py-10 text-[#94A3B8] text-xs">
              Nenhuma terapia configurada. Cadastre novas terapias, tempos de duração e valores.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {therapies.map((srv) => (
                <div key={srv.id} className="p-4 rounded-xl border border-white/10 bg-[#131519] flex items-start justify-between gap-4 hover:bg-white/5 transition">
                  <div className="space-y-1">
                    <h4 className="font-bold text-[#F1F5F9] text-sm flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                      {srv.name}
                    </h4>
                    {srv.description && <p className="text-xs text-[#94A3B8] mt-1">{srv.description}</p>}
                    
                    <div className="flex items-center gap-4 text-xs font-semibold text-[#94A3B8] mt-3 pt-2.5 border-t border-white/5">
                      <span className="flex items-center gap-1">
                        Duração: {srv.durationMinutes} min
                      </span>
                      <span className="flex items-center gap-1 text-[#D4AF37]">
                        <Coins className="w-4 h-4 text-[#D4AF37]" />
                        R$ {(srv.price / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => openEditModal('therapies', srv)}
                      className="p-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/5 transition cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteTherapy(srv.id)}
                      className="p-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-450 rounded-lg border border-rose-900/20 transition cursor-pointer"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ------------------ EMPLOYEES LIST ------------------ */}
      {activeTab === 'employees' && (
        <div className="bg-[#1A1D23] rounded-2xl border border-white/10 shadow-sm overflow-hidden p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#F1F5F9] font-serif italic">Equipe de Secretariado e Apoio</h3>

          {employees.length === 0 ? (
            <div className="text-center py-10 text-[#94A3B8] text-xs">
              Nenhum funcionário de apoio cadastrado. Cadastre assistentes ou recepcionistas.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {employees.map((emp) => (
                <div key={emp.id} className="p-4 rounded-xl border border-white/10 bg-[#131519] flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-[#F1F5F9] text-sm">{emp.name}</h4>
                    <p className="text-xs text-[#D4AF37] font-semibold mt-0.5">Cargo: {emp.role}</p>
                    <div className="text-[11px] text-[#94A3B8] space-y-0.5 mt-2 font-medium">
                      <p><span className="text-slate-500">Contato:</span> {emp.phone}</p>
                      <p><span className="text-slate-500">Email:</span> {emp.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => openEditModal('employees', emp)}
                      className="p-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/5 transition cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteEmployee(emp.id)}
                      className="p-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-450 rounded-lg border border-rose-900/20 transition cursor-pointer"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ADD / EDIT DYNAMIC MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-45 animate-fade-in font-sans">
          <div className="bg-[#1A1D23] rounded-2xl max-w-md w-full border border-white/10 shadow-2xl overflow-hidden animate-scale-up">
            <div className="bg-[#131519] px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#D4AF37] flex items-center gap-1.5 font-serif italic">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                {editId ? 'Editar Item' : 'Criar Novo Cadastro'} ({
                  activeTab === 'therapists' ? 'Terapeuta' : activeTab === 'therapies' ? 'Terapia' : 'Equipe/Apoio'
                })
              </h3>
              <button onClick={() => setShowModal(false)} className="text-[#94A3B8] hover:text-[#E2E8F0] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Common Name */}
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Nome Completo / Título *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#131519] border border-white/10 focus:border-[#D4AF37] rounded-xl p-2.5 text-xs text-white focus:outline-none transition-all placeholder-slate-600"
                  placeholder={activeTab === 'therapies' ? 'Ex: Equilíbrio dos Chakras com Reiki' : 'Ex: Drª Clara Mendes'}
                  required
                />
              </div>

              {/* Therapist and Employee common phone & email */}
              {activeTab !== 'therapies' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#94A3B8] mb-1">WhatsApp *</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(maskPhone(e.target.value))}
                      className="w-full bg-[#131519] border border-white/10 focus:border-[#D4AF37] rounded-xl p-2.5 text-xs text-white focus:outline-none transition-all placeholder-slate-600"
                      placeholder="Ex: (11) 97777-6666"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#94A3B8] mb-1">E-mail *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#131519] border border-white/10 focus:border-[#D4AF37] rounded-xl p-2.5 text-xs text-white focus:outline-none transition-all placeholder-slate-600"
                      placeholder="Ex: clara.mendes@clinica.com"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Therapist inputs */}
              {activeTab === 'therapists' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#94A3B8] mb-1 font-sans">Especialidade Principal *</label>
                    <input
                      type="text"
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      className="w-full bg-[#131519] border border-white/10 focus:border-[#D4AF37] rounded-xl p-2.5 text-xs text-white focus:outline-none transition-all placeholder-slate-600"
                      placeholder="Ex: Acupuntura & Reiki"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Nº Registro Conselho</label>
                    <input
                      type="text"
                      value={registryNumber}
                      onChange={(e) => setRegistryNumber(e.target.value)}
                      className="w-full bg-[#131519] border border-white/10 focus:border-[#D4AF37] rounded-xl p-2.5 text-xs text-white focus:outline-none transition-all placeholder-slate-600"
                      placeholder="Ex: CRT-BR-12345"
                    />
                  </div>
                </div>
              )}

              {/* Employee role */}
              {activeTab === 'employees' && (
                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Cargo / Função *</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-[#131519] border border-white/10 focus:border-[#D4AF37] rounded-xl p-2.5 text-xs text-white focus:outline-none transition-all placeholder-slate-600"
                    placeholder="Ex: Recepcionista Sênior, Gerente Administrativo"
                    required
                  />
                </div>
              )}

              {/* Therapy specifics */}
              {activeTab === 'therapies' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Descrição do Serviço</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={2}
                      className="w-full bg-[#131519] border border-white/10 focus:border-[#D4AF37] rounded-xl p-2.5 text-xs text-white focus:outline-none transition-all placeholder-slate-600"
                      placeholder="Breve descrição dos benefícios e indicação da terapia..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Duração (Minutos) *</label>
                      <input
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="w-full bg-[#131519]/80 border border-white/10 focus:border-[#D4AF37] rounded-xl p-2.5 text-xs text-white focus:outline-none transition-all"
                        placeholder="Ex: 60"
                        min="1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Preço Cobrado (R$) *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full bg-[#131519]/80 border border-white/10 focus:border-[#D4AF37] rounded-xl p-2.5 text-xs text-white focus:outline-none transition-all"
                        placeholder="Ex: 150.00"
                        min="0"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

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
                  className="px-4 py-2 text-xs font-semibold text-[#0F1115] bg-[#D4AF37] hover:bg-[#C5A030] rounded-xl transition shadow-sm cursor-pointer flex items-center justify-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  Salvar Cadastro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
