import React, { useState } from 'react';
import { ClinicSettings } from '../types.ts';
import { 
  Compass, ShieldCheck, Sparkles, Phone, Mail, MapPin, 
  ArrowRight, ArrowLeft, Check, RefreshCw, FileText, Palette, Info 
} from 'lucide-react';
import { maskPhone, maskCNPJ } from '../lib/masking';

interface ClinicSetupViewProps {
  onSave: (settings: Partial<ClinicSettings>) => Promise<void>;
  loading: boolean;
}

export default function ClinicSetupView({ onSave, loading }: ClinicSetupViewProps) {
  const [step, setStep] = useState(1);
  const [clinicName, setClinicName] = useState('Espaço Harmonia & Terapias');
  const [cnpj, setCnpj] = useState('');
  const [phone, setPhone] = useState('(11) 99999-9999');
  const [email, setEmail] = useState('contato@espacoharmonia.com.br');
  const [address, setAddress] = useState('Av. Paulista, 1000 - Bela Vista, São Paulo - SP');
  const [accentColor, setAccentColor] = useState('#D4AF37'); // Default gold
  const [welcomeMessage, setWelcomeMessage] = useState('Seu refúgio sutil para equilíbrio físico, energético e sistêmico.');
  const [logoUrl, setLogoUrl] = useState('');
  const [error, setError] = useState('');

  // Built-in accent colors
  const colorPresets = [
    { name: 'Dourado Alquimia', value: '#D4AF37', border: 'border-[#D4AF37]', text: 'text-[#D4AF37]' },
    { name: 'Verde Cura (Fito)', value: '#10B981', border: 'border-[#10B981]', text: 'text-[#10B981]' },
    { name: 'Azul Transcendental', value: '#3B82F6', border: 'border-[#3B82F6]', text: 'text-[#3B82F6]' },
    { name: 'Violeta Conexão', value: '#8B5CF6', border: 'border-[#8B5CF6]', text: 'text-[#8B5CF6]' },
    { name: 'Laranja Vital', value: '#F59E0B', border: 'border-[#F59E0B]', text: 'text-[#F59E0B]' },
  ];

  const handleSubmit = async () => {
    if (!clinicName.trim()) {
      setError('Por favor, informe o nome da sua clínica.');
      return;
    }
    if (!phone.trim()) {
      setError('Por favor, informe o telefone de contato.');
      return;
    }

    setError('');
    await onSave({
      clinicName,
      cnpj: cnpj || null,
      phone,
      email: email || null,
      address: address || null,
      accentColor,
      welcomeMessage: welcomeMessage || null,
      logoUrl: logoUrl || null
    });
  };

  return (
    <div className="fixed inset-0 bg-[#0A0C10] z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-2xl w-full bg-[#131519] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between my-auto text-left">
        
        {/* Progress header bar */}
        <div className="bg-[#1A1D23] px-8 py-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-[#D4AF37]/20 to-transparent border border-[#D4AF37]/35 rounded-xl">
              <Compass className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-widest text-[#D4AF37] font-mono leading-none">Configuração Primária</span>
              <h2 className="text-sm font-bold text-white tracking-tight mt-0.5 font-sans">
                Assistente de Instalação da Clínica
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {[1, 2, 3].map((s) => (
              <div 
                key={s} 
                className={`w-5 h-1.5 rounded-full transition-all duration-300 ${
                  s === step ? 'w-8 bg-[#D4AF37]' : s < step ? 'bg-emerald-500' : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Form Body block */}
        <div className="p-8 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-3.5 rounded-xl text-red-400 text-xs font-semibold">
              ⛔ {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" /> Informações Clínicas Basais
                </h3>
                <p className="text-[#94A3B8] text-xs mt-1 leading-relaxed">
                  Defina o nome essencial do seu espaço terapêutico e uma mensagem sutil para os clientes. Essas informações serão inseridas em relatórios e cabeçalhos de prontuários.
                </p>
              </div>

              <div className="space-y-4 pt-2 text-xs">
                <div>
                  <label className="block font-bold text-slate-300 mb-1.5 uppercase tracking-wider text-[10px]">Nome Fantasia da Clínica *</label>
                  <input
                    type="text"
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    placeholder="Ex: Espaço Terapêutico Harmonia Sutil"
                    className="w-full bg-[#1A1D23] border border-white/10 focus:border-[#D4AF37] rounded-xl p-3 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1.5 uppercase tracking-wider text-[10px]">Slogan / Boas-Vindas Principal</label>
                  <input
                    type="text"
                    value={welcomeMessage}
                    onChange={(e) => setWelcomeMessage(e.target.value)}
                    placeholder="Ex: Alinhamento bioenergético e acolhimento clínico multidimensional"
                    className="w-full bg-[#1A1D23] border border-white/10 focus:border-[#D4AF37] rounded-xl p-3 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1.5 uppercase tracking-wider text-[10px]">Link da Imagem do Logotipo (Opcional)</label>
                  <input
                    type="text"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="Ex: https://minhaclinica.com/logo.png (Ou deixe em branco para logomarca padrão)"
                    className="w-full bg-[#1A1D23] border border-white/10 focus:border-[#D4AF37] rounded-xl p-3 text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#D4AF37]" /> Dados Administrativos e Contato
                </h3>
                <p className="text-[#94A3B8] text-xs mt-1 leading-relaxed">
                  Insira as vias de contato para faturamento, links de confirmação de agendamentos no WhatsApp e registros impressos nas receitas integrais.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-300 mb-1.5 uppercase tracking-wider text-[10px]">CNPJ ou CPF Responsável</label>
                  <input
                    type="text"
                    value={cnpj}
                    onChange={(e) => setCnpj(maskCNPJ(e.target.value))}
                    placeholder="Ex: 00.000.000/0001-00"
                    className="w-full bg-[#1A1D23] border border-white/10 focus:border-[#D4AF37] rounded-xl p-3 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1.5 uppercase tracking-wider text-[10px]">Telefone Principal / WhatsApp *</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(maskPhone(e.target.value))}
                    placeholder="Ex: (11) 99999-9999"
                    className="w-full bg-[#1A1D23] border border-white/10 focus:border-[#D4AF37] rounded-xl p-3 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1.5 uppercase tracking-wider text-[10px]">E-mail para Atendimento</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contato@espacoharmonia.com.br"
                    className="w-full bg-[#1A1D23] border border-white/10 focus:border-[#D4AF37] rounded-xl p-3 text-white focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-300 mb-1.5 uppercase tracking-wider text-[10px]">Endereço Físico Clínico</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Rua das Acácias, 120, Cj 402 - São Paulo/SP"
                    className="w-full bg-[#1A1D23] border border-white/10 focus:border-[#D4AF37] rounded-xl p-3 text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Palette className="w-4 h-4 text-[#D4AF37]" /> Customização Visual & Identidade Sutil
                </h3>
                <p className="text-[#94A3B8] text-xs mt-1 leading-relaxed">
                  Selecione o matiz energético primordial que irá conduzir a interface do sistema, botões, bordas e realces sutis de navegação de acordo com a sua área principal.
                </p>
              </div>

              <div className="space-y-4 pt-2 text-xs">
                <div>
                  <label className="block font-bold text-slate-300 mb-2 uppercase tracking-wider text-[10px]">Doutrina de Cores (Matiz de Atuação)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {colorPresets.map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => setAccentColor(preset.value)}
                        className={`p-3.5 bg-[#1A1D23] border rounded-2xl flex items-center gap-3 hover:bg-[#22262E] transition-all text-left cursor-pointer ${
                          accentColor === preset.value ? `${preset.border} ring-1 ring-white/5 bg-[#1B221B]/40` : 'border-white/5 opacity-70'
                        }`}
                      >
                        <span 
                          className="w-4 h-4 rounded-full block border border-white/20 shrink-0" 
                          style={{ backgroundColor: preset.value }} 
                        />
                        <span className="font-semibold text-white">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Final step confirmation notice */}
                <div className="bg-[#1C201C] p-4.5 rounded-2xl border border-emerald-500/20 flex gap-3 text-left">
                  <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white">Banco PostgreSQL Conectado e Ativo</h4>
                    <p className="text-[#94A3B8] text-[11px] leading-relaxed mt-1">
                      As tabelas estão prontas. Desse ponto em diante, o sistema passará a herdar e portar o nome de <strong>{clinicName || 'sua clínica'}</strong> em todas as instâncias de diagnóstico holístico, formulários de receitas e orçamentos.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="bg-[#1A1D23] px-8 py-5 border-t border-white/5 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            disabled={step === 1 || loading}
            className="text-slate-400 hover:text-white flex items-center gap-2 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition text-xs font-bold uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="bg-white/10 hover:bg-white/15 text-white border border-white/10 py-2.5 px-5 rounded-xl flex items-center gap-2 text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Continuar <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="bg-[#D4AF37] hover:bg-[#C5A030] text-[#0f1115] font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 text-xs uppercase tracking-wider transition active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Finalizando Instalação...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" /> Concluir e Iniciar
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
