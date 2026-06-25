import React from 'react';
import { DashboardStats, Appointment } from '../types.ts';
import { Users, UserCheck, Calendar, ArrowUpRight, ArrowDownRight, Wallet, CheckCircle, Clock, Sparkles } from 'lucide-react';

interface DashboardViewProps {
  stats: DashboardStats | null;
  onNavigate: (tab: string) => void;
  onSendWhatsapp: (id: number) => void;
}

export default function DashboardView({ stats, onNavigate, onSendWhatsapp }: DashboardViewProps) {
  if (!stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-[#D4AF37] font-serif italic">Olá, bem-vindo(a) ao painel de controle!</h2>
        <p className="text-[#94A3B8] text-sm">Resumo da operação, agendamentos recentes e fluxo financeiro consolidado.</p>
      </div>

      {/* Numerical Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-[#1A1D23] p-5 rounded-2xl border border-white/10 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs text-[#94A3B8] font-medium">Pacientes Cadastrados</span>
            <p className="text-2xl font-bold text-[#F1F5F9] mt-1 font-mono">{stats.patientsCount}</p>
          </div>
          <div className="p-3 bg-[#131519] text-[#D4AF37] border border-white/10 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#1A1D23] p-5 rounded-2xl border border-white/10 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs text-[#94A3B8] font-medium">Terapeutas Integrativos</span>
            <p className="text-2xl font-bold text-[#F1F5F9] mt-1 font-mono">{stats.therapistsCount}</p>
          </div>
          <div className="p-3 bg-[#131519] text-[#D4AF37] border border-white/10 rounded-xl">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#1A1D23] p-5 rounded-2xl border border-white/10 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs text-[#94A3B8] font-medium">Total de Agendamentos</span>
            <p className="text-2xl font-bold text-[#F1F5F9] mt-1 font-mono">{stats.appointmentsCount}</p>
          </div>
          <div className="p-3 bg-[#131519] text-[#D4AF37] border border-white/10 rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="bg-[#1A1D23] rounded-2xl border border-white/10 shadow-sm p-6">
        <h3 className="text-base font-semibold text-[#F1F5F9] flex items-center gap-2 mb-4">
          <Wallet className="w-5 h-5 text-[#D4AF37]" />
          Fluxo de Caixa Consolidado (Este Mês)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-emerald-950/20 p-5 rounded-xl border border-emerald-900/30">
            <div className="flex items-center justify-between">
              <span className="text-xs text-emerald-300 font-medium font-sans">Entradas (Faturamento)</span>
              <div className="bg-emerald-900/50 text-emerald-400 p-1 rounded-md border border-emerald-800/20">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl font-bold text-emerald-400 mt-2 font-mono">{formatCurrency(stats.totalInflow)}</p>
          </div>

          <div className="bg-rose-950/20 p-5 rounded-xl border border-rose-900/30">
            <div className="flex items-center justify-between">
              <span className="text-xs text-rose-300 font-medium font-sans">Saídas (Despesas)</span>
              <div className="bg-rose-900/50 text-rose-400 p-1 rounded-md border border-rose-800/20">
                <ArrowDownRight className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl font-bold text-rose-400 mt-2 font-mono">{formatCurrency(stats.totalOutflow)}</p>
          </div>

          <div className={`p-5 rounded-xl border bg-slate-900/30 border-white/10`}>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#94A3B8] font-medium font-sans">Saldo Líquido</span>
              <div className={`p-1 rounded-md ${stats.netBalance >= 0 ? 'bg-emerald-950/40 text-emerald-400' : 'bg-rose-950/40 text-rose-400'}`}>
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>
            <p className={`text-xl font-bold mt-2 font-mono ${stats.netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatCurrency(stats.netBalance)}
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Recent Agendamentos & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent appointments */}
        <div className="lg:col-span-2 bg-[#1A1D23] rounded-2xl border border-white/10 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-[#F1F5F9]">Próximos Agendamentos</h3>
            <button 
              onClick={() => onNavigate('appointments')}
              className="text-xs font-semibold text-[#D4AF37] hover:text-[#C5A030] transition cursor-pointer"
            >
              Ver agenda completa →
            </button>
          </div>

          {stats.latestAppointments.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#94A3B8]">
              Nenhum agendamento encontrado no sistema. Vá em "Agenda" para cadastrar o primeiro.
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {stats.latestAppointments.map((appt) => (
                <div key={appt.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`p-2.5 rounded-xl mt-0.5 shrink-0 bg-[#131519] border border-white/5 text-[#D4AF37]`}>
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#F1F5F9] truncate">
                        {appt.patient?.name}
                      </p>
                      <p className="text-xs text-[#94A3B8] font-medium truncate">
                        {appt.therapy?.name} • com {appt.therapist?.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-semibold text-[#94A3B8]">
                          {appt.appointmentDate.split('-').reverse().join('/')} às {appt.appointmentTime}
                        </span>
                        {appt.whatsappSentAt ? (
                          <span className="text-[9px] bg-green-950/30 text-green-400 border border-green-900/20 px-1.5 py-0.5 rounded font-medium">
                            Notificação WhatsApp enviada
                          </span>
                        ) : (
                          <span className="text-[9px] bg-white/5 text-slate-400 px-1.5 py-0.5 rounded font-medium">
                            Não notificado
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${
                      appt.status === 'completed' ? 'bg-green-900/30 text-green-400 border border-green-900/20' :
                      appt.status === 'cancelled' ? 'bg-rose-900/30 text-rose-400 border border-rose-900/20' : 
                      appt.status === 'confirmed' ? 'bg-indigo-900/40 text-indigo-300 border border-indigo-900/20' :
                      'bg-amber-900/30 text-[#D4AF37] border border-amber-800/20'
                    }`}>
                      {appt.status === 'completed' ? 'Realizado' : appt.status === 'cancelled' ? 'Cancelado' : appt.status === 'confirmed' ? 'Confirmado' : 'Agendado'}
                    </span>
                    {!appt.whatsappSentAt && appt.status === 'scheduled' && (
                      <button
                        onClick={() => onSendWhatsapp(appt.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded-lg text-xs font-semibold shrink-0 transition cursor-pointer shadow-sm border border-emerald-500/20"
                        title="Enviar Notificação"
                      >
                        Zap
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Menu / Informações */}
        <div className="bg-[#1A1D23] rounded-2xl border border-white/10 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-[#F1F5F9] mb-4">Ações Rápidas</h3>
            <div className="space-y-2.5">
              <button 
                onClick={() => onNavigate('appointments')}
                className="w-full text-left p-3 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-semibold text-[#E2E8F0] flex items-center justify-between transition cursor-pointer"
              >
                <span>Agendar Consulta</span>
                <Clock className="w-4 h-4 text-[#D4AF37]" />
              </button>
              <button 
                onClick={() => onNavigate('patients')}
                className="w-full text-left p-3 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-semibold text-[#E2E8F0] flex items-center justify-between transition cursor-pointer"
              >
                <span>Cadastrar Novo Paciente</span>
                <Users className="w-4 h-4 text-[#D4AF37]" />
              </button>
              <button 
                onClick={() => onNavigate('health-records')}
                className="w-full text-left p-3 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-semibold text-[#E2E8F0] flex items-center justify-between transition cursor-pointer"
              >
                <span>Evolução / Prontuário com IA</span>
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              </button>
            </div>
          </div>

          <div className="mt-6 p-4 bg-[#131519] rounded-xl border border-[#D4AF37]/25">
            <h4 className="text-xs font-bold text-[#D4AF37] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Recurso Inteligente Ativo
            </h4>
            <p className="text-[11px] text-[#94A3B8] mt-1.5 leading-relaxed">
              Utilize nossa IA integrada para redigir prontuários terapêuticos e propor caminhos evolutivos para os sintomas dos clientes num clique!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
