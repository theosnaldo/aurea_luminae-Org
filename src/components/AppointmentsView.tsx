import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Appointment, Patient, Therapist, Therapy } from '../types.ts';
import { Calendar, Clock, User, Plus, Check, X, AlertTriangle, MessageSquare, ExternalLink, Send, Smartphone, Sparkles, Settings, Bot, Bell, CheckCheck } from 'lucide-react';

interface AppointmentsViewProps {
  appointments: Appointment[];
  patients: Patient[];
  therapists: Therapist[];
  therapies: Therapy[];
  onAddAppointment: (data: any) => Promise<any>;
  onUpdateStatus: (id: number, status: string) => void;
  onSendWhatsapp: (id: number) => void;
  notificationsLog: any[];
  showModal: boolean;
  setShowModal: (show: boolean) => void;
}

export default function AppointmentsView({
  appointments,
  patients,
  therapists,
  therapies,
  onAddAppointment,
  onUpdateStatus,
  onSendWhatsapp,
  notificationsLog,
  showModal,
  setShowModal,
}: AppointmentsViewProps) {
  const [patientId, setPatientId] = useState('');
  const [therapistId, setTherapistId] = useState('');
  const [therapyId, setTherapyId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [collisionModal, setCollisionModal] = useState<{show: boolean, suggestions: string[]}>({show: false, suggestions: []});

  // Automatic Notification & WhatsApp Simulator States
  const [autoDispatch, setAutoDispatch] = useState<boolean>(() => {
    return localStorage.getItem('auto_dispatch_whatsapp') !== 'false'; // default true
  });
  const [autoConfirmPatient, setAutoConfirmPatient] = useState<boolean>(() => {
    return localStorage.getItem('auto_confirm_patient') !== 'false'; // default true
  });
  const [selectedApptId, setSelectedApptId] = useState<number | null>(() => {
    const saved = localStorage.getItem('selected_simulated_appt_id');
    return saved ? parseInt(saved) : null;
  });
  const [patientReplyText, setPatientReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  
  // Custom template state
  const [messageTemplate, setMessageTemplate] = useState<string>(() => {
    return localStorage.getItem('whatsapp_msg_template') || 
      "Olá, [Paciente]! Lembramos seu agendamento de [Terapia] com [Terapeuta] no dia [Data] às [Hora]. Confirme respondendo 'SIM' ou solicite alteração respondendo 'NÃO'. ✨";
  });
  
  // Save toggles to localStorage
  const handleToggleAutoDispatch = (val: boolean) => {
    setAutoDispatch(val);
    localStorage.setItem('auto_dispatch_whatsapp', val ? 'true' : 'false');
  };

  const handleToggleAutoConfirm = (val: boolean) => {
    setAutoConfirmPatient(val);
    localStorage.setItem('auto_confirm_patient', val ? 'true' : 'false');
  };

  const handleSaveTemplate = (val: string) => {
    setMessageTemplate(val);
    localStorage.setItem('whatsapp_msg_template', val);
  };

  const selectAppointmentForSimulation = (id: number) => {
    setSelectedApptId(id);
    localStorage.setItem('selected_simulated_appt_id', id.toString());
  };

  // Filters state
  const [filterTherapist, setFilterTherapist] = useState<string>('');
  const [filterTherapyType, setFilterTherapyType] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Filter out inactive therapists or therapies
  const activeTherapists = therapists.filter((t) => t.active);
  const activeTherapies = therapies.filter((t) => t.active);

  // Filter appointments dynamically
  const filteredAppointments = appointments.filter((appt) => {
    const matchesTherapist = filterTherapist === '' || appt.therapistId.toString() === filterTherapist;
    const matchesTherapyType = filterTherapyType === '' || appt.therapyId.toString() === filterTherapyType;
    const matchesStatus = filterStatus === '' || appt.status === filterStatus;
    
    // Check Date Range
    // Appointment date is stored as 'YYYY-MM-DD'
    const apptDate = new Date(appt.appointmentDate);
    // Adjust for timezone issues if necessary, but appt.appointmentDate is YYYY-MM-DD
    // Assuming simple string comparison or Date parsing is sufficient
    const start = startDate ? new Date(startDate + 'T00:00:00') : null;
    const end = endDate ? new Date(endDate + 'T23:59:59') : null;
    
    const matchesDate = (!start || apptDate >= start) && (!end || apptDate <= end);
    
    return matchesTherapist && matchesTherapyType && matchesStatus && matchesDate;
  });

  const checkCollision = (tId: string, d: string, t: string) => {
    return appointments.some(appt =>
      appt.therapistId.toString() === tId &&
      appt.appointmentDate === d &&
      appt.appointmentTime === t &&
      appt.status !== 'cancelled'
    );
  };

  const findSuggestions = (tId: string, d: string, t: string) => {
    const suggestions = [];
    const [hours, minutes] = t.split(':').map(Number);
    // Suggest nearby times: +/- 2 hours in 30 min intervals
    for (let i = -4; i <= 4; i++) {
      let totalMins = hours * 60 + minutes + i * 30;
      if (totalMins < 0 || totalMins >= 24 * 60) continue;
      let h = Math.floor(totalMins / 60);
      let m = totalMins % 60;
      let timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      if (!checkCollision(tId, d, timeStr)) {
        suggestions.push(timeStr);
      }
      if (suggestions.length >= 3) break;
    }
    return suggestions;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !therapistId || !therapyId || !date || !time) {
      setErrorMsg('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (checkCollision(therapistId, date, time)) {
      const suggestions = findSuggestions(therapistId, date, time);
      setCollisionModal({ show: true, suggestions });
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    setSubmitting(true);

    const success = await onAddAppointment({
      patientId,
      therapistId,
      therapyId,
      appointmentDate: date,
      appointmentTime: time,
      notes,
    });

    setSubmitting(false);

    if (success && typeof success === 'object' && success.id) {
      // Clear form
      setPatientId('');
      setTherapistId('');
      setTherapyId('');
      setDate('');
      setTime('');
      setNotes('');
      setSuccessMsg('Agendamento realizado com sucesso!');
      
      // Auto-focus simulator on this appointment
      selectAppointmentForSimulation(success.id);

      // Auto-dispatch notification if enabled
      if (autoDispatch) {
        setTimeout(async () => {
          onSendWhatsapp(success.id);

          // If autoConfirm is also active, trigger auto-reply simulation in 4 seconds
          if (autoConfirmPatient) {
            setTimeout(async () => {
              try {
                await fetch(`/api/appointments/${success.id}/reply`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('firebase_token') || ''}`,
                  },
                  body: JSON.stringify({ text: 'SIM' }),
                });
                
                // Add simulated reply to logs array locally or force reload by updating state
                onUpdateStatus(success.id, 'confirmed');
              } catch (e) {
                console.error("Auto confirm response failed:", e);
              }
            }, 4000);
          }
        }, 1200);
      }

      setTimeout(() => {
        setShowModal(false);
        setSuccessMsg(null);
      }, 1500);
    } else if (success) {
      // compatibility fallback index
      setPatientId('');
      setTherapistId('');
      setTherapyId('');
      setDate('');
      setTime('');
      setNotes('');
      setSuccessMsg('Agendamento realizado!');
      setTimeout(() => {
        setShowModal(false);
        setSuccessMsg(null);
      }, 1500);
    } else {
      setErrorMsg('Não foi possível agendar. Verifique possível choque de horário com o terapeuta selecionado.');
    }
  };

  const handleSimulatePatientReply = async (apptId: number, text: string) => {
    if (!text.trim()) return;
    setIsSendingReply(true);
    try {
      const res = await fetch(`/api/appointments/${apptId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('firebase_token') || ''}`,
        },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        const data = await res.json();
        // Force refresh table state using status update hook
        onUpdateStatus(apptId, data.status);
        setPatientReplyText('');
      } else {
        alert("Não foi possível simular a resposta do paciente.");
      }
    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setIsSendingReply(false);
    }
  };

  const getSimulatedMessages = (appt: Appointment) => {
    const list: { sender: 'clinic' | 'patient'; text: string; time?: string }[] = [];
    
    if (appt.whatsappSentAt) {
      const clinicMsg = messageTemplate
        .replace('[Paciente]', appt.patient?.name || '')
        .replace('[Terapia]', appt.therapy?.name || '')
        .replace('[Terapeuta]', appt.therapist?.name || '')
        .replace('[Data]', appt.appointmentDate?.split('-').reverse().join('/') || '')
        .replace('[Hora]', appt.appointmentTime || '');
        
      list.push({
        sender: 'clinic',
        text: clinicMsg,
        time: new Date(appt.whatsappSentAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      });
    }

    if (appt.notes) {
      const systemLines = appt.notes.split('\n');
      systemLines.forEach((line) => {
        if (line.includes('[SISTEMA]: Presença de consulta CONFIRMADA') || line.includes('[SISTEMA]: Presença confirmada') || line.includes('CONFIRMADA via')) {
          list.push({
            sender: 'patient',
            text: 'SIM, confirmo minha presença! Obrigado.',
            time: appt.whatsappSentAt ? new Date(new Date(appt.whatsappSentAt).getTime() + 1500).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'Recebido'
          });
        } else if (line.includes('[SISTEMA]: Consulta CANCELADA') || line.includes('CANCELADA por solicitação') || line.includes('CANCELADA via')) {
          list.push({
            sender: 'patient',
            text: 'NÃO poderei comparecer desta vez, por favor cancelem o agendamento.',
            time: appt.whatsappSentAt ? new Date(new Date(appt.whatsappSentAt).getTime() + 1500).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'Recebido'
          });
        } else if (line.includes('[SISTEMA]: Mensagem recebida via WhatsApp:')) {
          const match = line.match(/via WhatsApp: "([^"]+)"/);
          const val = match ? match[1] : line.replace('[SISTEMA]: Mensagem recebida via WhatsApp:', '').trim();
          list.push({
            sender: 'patient',
            text: val,
            time: 'Agora'
          });
        }
      });
    }

    return list;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-[#D4AF37] tracking-tight font-serif italic">Agenda Integrada</h2>
          <p className="text-[#94A3B8] text-sm">Monitore consultas e realize agendamentos inteligentes sem sobreposição de horários.</p>
        </div>
        
        <button
          onClick={() => {
            setErrorMsg(null);
            setSuccessMsg(null);
            setShowModal(true);
          }}
          className="bg-[#D4AF37] hover:bg-[#C5A030] text-[#0f1115] font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition active:scale-95 text-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Novo Agendamento
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appointments List (left/center) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#1A1D23] rounded-2xl border border-white/10 p-6 shadow-sm">
            
            {/* Filter controls header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/15">
              <h3 className="text-base font-semibold text-[#F1F5F9]">Lista de Consultas</h3>
              
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-[11px] text-[#94A3B8] uppercase tracking-wider font-semibold font-mono">Filtros:</span>
                
                {/* Therapist selector filter */}
                <select
                  value={filterTherapist}
                  onChange={(e) => setFilterTherapist(e.target.value)}
                  className="bg-[#131519] border border-white/10 hover:border-white/20 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#D4AF37] max-w-[170px]"
                >
                  <option value="">Filtrar Terapeuta</option>
                  {therapists.map((t) => (
                    <option key={t.id} value={t.id.toString()}>
                      {t.name}
                    </option>
                  ))}
                </select>

                {/* Therapy type selector filter */}
                <select
                  value={filterTherapyType}
                  onChange={(e) => setFilterTherapyType(e.target.value)}
                  className="bg-[#131519] border border-white/10 hover:border-white/20 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#D4AF37] max-w-[170px]"
                >
                  <option value="">Filtrar Terapia</option>
                  {activeTherapies.map((srv) => (
                    <option key={srv.id} value={srv.id.toString()}>
                      {srv.name}
                    </option>
                  ))}
                </select>

                {/* Status/Payment selector filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-[#131519] border border-white/10 hover:border-white/20 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="">Filtrar Status/Pgto</option>
                  <option value="scheduled">Agendado / Pendente</option>
                  <option value="completed">Realizado / Pago</option>
                  <option value="cancelled">Cancelado</option>
                </select>

                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-[#131519] border border-white/10 hover:border-white/20 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  title="Data Início"
                />
                
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-[#131519] border border-white/10 hover:border-white/20 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  title="Data Fim"
                />

                {/* Clear Active Filters */}
                {(filterTherapist !== '' || filterTherapyType !== '' || filterStatus !== '' || startDate !== '' || endDate !== '') && (
                  <button
                    onClick={() => {
                      setFilterTherapist('');
                      setFilterTherapyType('');
                      setFilterStatus('');
                      setStartDate('');
                      setEndDate('');
                    }}
                    className="text-xs bg-white/5 hover:bg-white/10 text-[#D4AF37] font-semibold px-2.5 py-1.5 rounded-lg transition active:scale-95 cursor-pointer text-[10px] uppercase font-mono tracking-wider"
                  >
                    Limpar
                  </button>
                )}
              </div>
            </div>

            {filteredAppointments.length === 0 ? (
              <div className="text-center py-12 text-[#94A3B8] text-xs">
                {appointments.length === 0 
                  ? 'Nenhum agendamento ativo cadastrado. Insira um novo acima.'
                  : 'Nenhuma consulta encontrada com as condições dos filtros aplicados.'
                }
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                {filteredAppointments.map((appt) => {
                  const isSimSelected = selectedApptId === appt.id;
                  return (
                    <motion.div
                      key={appt.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      layout
                      onClick={() => selectAppointmentForSimulation(appt.id)}
                      className={`p-4 rounded-xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer relative overflow-hidden ${
                        isSimSelected
                          ? 'border-[#D4AF37]/60 bg-white/5 ring-1 ring-[#D4AF37]/30 shadow-md shadow-[#D4AF37]/5'
                          : 'border-white/10 bg-[#131519] hover:bg-white/5'
                      }`}
                    >
                      {isSimSelected && (
                        <div className="absolute top-0 right-0 bg-[#D4AF37]/15 text-[#D4AF37] text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-bl font-mono">
                          📱 Ativo no Simulador
                        </div>
                      )}
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-[#F1F5F9]">{appt.patient?.name}</span>
                          <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded flex items-center gap-1 w-max ${
                            appt.status === 'completed' ? 'bg-green-950/40 text-green-400 border border-green-900/20' :
                            appt.status === 'cancelled' ? 'bg-rose-950/40 text-rose-400 border border-rose-900/20' : 
                            appt.status === 'confirmed' ? 'bg-indigo-950/45 text-indigo-300 border border-indigo-900/30' :
                            'bg-amber-950/40 text-[#D4AF37] border border-amber-800/20'
                          }`}>
                            {appt.status === 'completed' ? <Check className="w-3 h-3" /> : 
                             appt.status === 'cancelled' ? <X className="w-3 h-3" /> : 
                             appt.status === 'confirmed' ? <CheckCheck className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            {appt.status === 'completed' ? 'Realizado' : 
                             appt.status === 'cancelled' ? 'Cancelado' : 
                             appt.status === 'confirmed' ? 'Confirmado' : 'Agendado'}
                          </span>
                          
                          {appt.whatsappSentAt && (
                            <span className="text-[8px] uppercase font-bold px-1.5 py-0.5 rounded bg-green-500/10 text-emerald-400 border border-emerald-500/15 flex items-center gap-0.5">
                              <CheckCheck className="w-2.5 h-2.5" /> Lembrete Enviado
                            </span>
                          )}
                        </div>
                        
                        <div className="text-xs text-[#94A3B8] space-y-0.5">
                          <p className="font-medium">
                            <span className="text-slate-500">Terapia:</span> {appt.therapy?.name} • (R$ {((appt.therapy?.price || 0) / 100).toFixed(2)})
                          </p>
                          <p className="font-medium flex items-center gap-1">
                            <span className="text-slate-500">Terapeuta:</span> {appt.therapist?.name}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-[#94A3B8] font-medium pt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                            {appt.appointmentDate.split('-').reverse().join('/')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                            {appt.appointmentTime}
                          </span>
                        </div>

                        {appt.notes && (
                          <div className="text-[10px] text-[#94A3B8] italic bg-[#0F1115]/80 p-2 rounded border border-white/5 mt-2 max-w-lg overflow-hidden text-ellipsis whitespace-pre-wrap">
                            {appt.notes}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 select-none md:self-center shrink-0" onClick={(e) => e.stopPropagation()}>
                        {(appt.status === 'scheduled' || appt.status === 'confirmed') && (
                          <>
                            <button
                              onClick={() => onUpdateStatus(appt.id, 'completed')}
                              className="bg-green-950/40 hover:bg-green-905 text-green-400 border border-green-900/30 p-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                              title="Confirmar Conclusão"
                            >
                              <Check className="w-3.5 h-3.5" /> Est. Paga
                            </button>
                            <button
                              onClick={() => onUpdateStatus(appt.id, 'cancelled')}
                              className="bg-rose-950/40 hover:bg-[#2c1219] text-rose-450 border border-rose-900/30 p-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                              title="Cancelar Consulta"
                            >
                              <X className="w-3.5 h-3.5" /> Canc.
                            </button>
                          </>
                        )}

                        {(appt.status === 'scheduled' || appt.status === 'confirmed') && (
                          <button
                            onClick={() => {
                              onSendWhatsapp(appt.id);
                              selectAppointmentForSimulation(appt.id);
                              
                              // Auto confirm response trial
                              if (autoConfirmPatient && appt.status === 'scheduled') {
                                setTimeout(async () => {
                                  try {
                                    await fetch(`/api/appointments/${appt.id}/reply`, {
                                      method: 'POST',
                                      headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${sessionStorage.getItem('firebase_token') || ''}`,
                                      },
                                      body: JSON.stringify({ text: 'SIM' }),
                                    });
                                    onUpdateStatus(appt.id, 'confirmed');
                                  } catch (error) {
                                    console.error("Auto confirm response failed:", error);
                                  }
                                }, 3500);
                              }
                            }}
                            className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer border ${
                              appt.whatsappSentAt 
                                ? 'bg-[#0E1B3A] text-blue-400 border-blue-900/40 hover:bg-[#152755]' 
                                : 'bg-[#155E30] hover:bg-[#14532D] text-white border-green-500/20 shadow-xs'
                            }`}
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            {appt.whatsappSentAt ? 'Reenviar Zap' : 'Notificar Zap'}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================== */}
        {/* RIGHT COLUMN: PREFERENCES & INTERACTIVE WHATSAPP SIMULATOR */}
        {/* ========================================================== */}
        <div className="space-y-5">
          {/* Section 1: Preference Configuration Card */}
          <div className="bg-[#1A1D23] rounded-2xl border border-white/10 p-5 space-y-4 shadow-sm text-left">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <div className="p-1 px-1.5 bg-[#D4AF37]/10 rounded border border-[#D4AF37]/20">
                <Settings className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#F1F5F9] uppercase tracking-wider font-mono">
                  Regras de Automação
                </h3>
                <p className="text-[10px] text-slate-400">Configure os parâmetros e mensagens do robô assistente.</p>
              </div>
            </div>

            <div className="space-y-3.5">
              {/* Toggle 1 */}
              <div className="flex items-start justify-between gap-3 bg-[#131519]/50 p-2.5 rounded-xl border border-white/5">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-bold text-slate-200 block">Notificação Automática imediata</span>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Dispara lembrete do WhatsApp imediatamente em segundo plano ao confirmar qualquer novo agendamento.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={autoDispatch}
                  onChange={(e) => handleToggleAutoDispatch(e.target.checked)}
                  className="rounded border-white/10 bg-[#131519] text-[#D4AF37] focus:ring-0 cursor-pointer shrink-0 mt-0.5 scale-105"
                />
              </div>

              {/* Toggle 2 */}
              <div className="flex items-start justify-between gap-3 bg-[#131519]/50 p-2.5 rounded-xl border border-white/5">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-bold text-slate-200 block">Confirmação Automática por Bot</span>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Simula resposta positiva do paciente ("SIM") de forma automática 4 segundos após o envio do lembrete.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={autoConfirmPatient}
                  onChange={(e) => handleToggleAutoConfirm(e.target.checked)}
                  className="rounded border-white/10 bg-[#131519] text-[#D4AF37] focus:ring-0 cursor-pointer shrink-0 mt-0.5 scale-105"
                />
              </div>

              {/* Template Editor */}
              <div className="space-y-1.5 pt-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Modelo de Mensagem de Lembrete:
                </label>
                <textarea
                  value={messageTemplate}
                  onChange={(e) => handleSaveTemplate(e.target.value)}
                  rows={3}
                  className="w-full bg-[#131519] border border-white/10 hover:border-white/15 focus:border-[#D4AF37] rounded-xl p-2.5 text-xs text-[#E2E8F0] focus:outline-none transition-all placeholder-slate-600 font-sans"
                  placeholder="Olá, [Paciente]! Lembramos seu agendamento..."
                />
                <div className="flex flex-wrap gap-1 leading-none text-slate-400 text-[9px]">
                  <span className="px-1 py-0.5 bg-white/5 rounded text-white/60 font-mono">[Paciente]</span>
                  <span className="px-1 py-0.5 bg-white/5 rounded text-white/60 font-mono">[Terapia]</span>
                  <span className="px-1 py-0.5 bg-white/5 rounded text-white/60 font-mono">[Terapeuta]</span>
                  <span className="px-1 py-0.5 bg-white/5 rounded text-white/60 font-mono">[Data]</span>
                  <span className="px-1 py-0.5 bg-white/5 rounded text-white/60 font-mono">[Hora]</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Interactive Smart WhatsApp Simulator */}
          <div className="bg-[#1A1D23] rounded-2xl border border-white/10 p-5 space-y-4 shadow-sm text-left">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1 px-1.5 bg-emerald-500/10 rounded border border-emerald-500/20 animate-pulse">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                    Canal WhatsApp Simulado
                  </h3>
                  <p className="text-[10px] text-slate-450">Interaja com os gatilhos das consultas em tempo real.</p>
                </div>
              </div>
            </div>

            {(() => {
              const activeAppt = appointments.find(a => a.id === selectedApptId);
              if (!activeAppt) {
                // Find first scheduled as default
                const firstSchedObj = appointments.find(a => a.status === 'scheduled' || a.status === 'confirmed');
                return (
                  <div className="py-6 text-center text-xs text-[#94A3B8] border border-dashed border-white/15 rounded-2xl bg-[#0F1115]/50 px-4 space-y-3">
                    <p className="leading-relaxed">
                      Nenhuma consulta selecionada para o simulador. Clique em qualquer consulta à esquerda ou clique abaixo para iniciar.
                    </p>
                    {firstSchedObj ? (
                      <button
                        onClick={() => selectAppointmentForSimulation(firstSchedObj.id)}
                        className="bg-white/5 hover:bg-white/10 text-[#D4AF37] hover:text-[#C5A030] text-[11px] font-bold py-1.5 px-3 rounded-lg border border-white/10 transition cursor-pointer"
                      >
                        Simular com {firstSchedObj.patient?.name}
                      </button>
                    ) : (
                      <p className="text-[10px] text-slate-500 italic">Cadastre e agende um novo paciente para simular.</p>
                    )}
                  </div>
                );
              }

              const msgsStream = getSimulatedMessages(activeAppt);

              return (
                <div className="space-y-4">
                  {/* WhatsApp Telephone Wireframe Container */}
                  <div className="max-w-[340px] mx-auto bg-[#07090C] border-4 border-slate-700/50 rounded-[28px] shadow-xl overflow-hidden flex flex-col">
                    
                    {/* Top status bar frame */}
                    <div className="bg-[#0b141a] px-4 pt-1.5 pb-2 text-[9px] text-slate-450 flex items-center justify-between border-b border-white/5 select-none font-mono">
                      <span>WhatsApp Business</span>
                      <div className="w-12 h-3.5 bg-slate-900 rounded-full mx-1 shrink-0 border border-white/5"></div>
                      <div className="flex items-center gap-1">
                        <span>4G LTE</span>
                        <div className="w-3 h-2 bg-slate-500 rounded-xs"></div>
                      </div>
                    </div>

                    {/* Chat contact head */}
                    <div className="bg-[#121B22] p-2.5 px-3.5 flex items-center gap-2 border-b border-white/5">
                      <div className="w-7 h-7 rounded-full bg-[#1A2329] border border-[#D4AF37]/35 flex items-center justify-center font-bold text-[10.5px] text-[#D4AF37] select-none">
                        {activeAppt.patient?.name?.charAt(0) || 'P'}
                      </div>
                      <div className="leading-none text-left flex-1 min-w-0">
                        <span className="text-[11px] font-bold text-white block truncate">{activeAppt.patient?.name}</span>
                        <span className="text-[9px] text-emerald-400 mt-0.5 inline-block font-medium animate-pulse">● Online</span>
                      </div>
                      <span className="text-[8px] font-bold text-slate-500 bg-[#1A2329] p-1 rounded uppercase font-mono tracking-wider truncate max-w-[80px]">
                        +55 {activeAppt.patient?.phone}
                      </span>
                    </div>

                    {/* Classic Whatsapp bubble screen wallpaper */}
                    <div className="bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat bg-opacity-70 h-48 overflow-y-auto p-2.5 space-y-2.5 flex flex-col scrollbar-thin">
                      
                      {/* Standard notice badge */}
                      <div className="bg-[#182229]/80 border border-white/5 p-1 px-2 rounded-lg text-[8px] text-slate-400 mx-auto text-center font-medium max-w-[210px] select-none leading-normal">
                        🔒 As mensagens são criptografadas. Este canal interage diretamente com o roteador de agendamentos.
                      </div>

                      {msgsStream.length === 0 ? (
                        <div className="bg-[#121B22]/95 border border-white/5 p-3.5 rounded-xl text-[9.5px] text-slate-400 leading-normal text-center my-auto mx-2 italic space-y-2">
                          <p>Nenhuma notificação enviada para este paciente.</p>
                          <button
                            onClick={() => onSendWhatsapp(activeAppt.id)}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded inline-flex items-center gap-1 transition text-[9px] uppercase cursor-pointer"
                          >
                            <MessageSquare className="w-3 h-3" /> Disparar Agora
                          </button>
                        </div>
                      ) : (
                        msgsStream.map((msg, mIdx) => (
                          <div 
                            key={mIdx}
                            className={`max-w-[85%] rounded-lg p-2 text-[10px] leading-relaxed relative ${
                              msg.sender === 'clinic' 
                                ? 'bg-[#005C4B] text-white self-end ml-auto rounded-tr-none' 
                                : 'bg-[#202C33] text-slate-100 self-start mr-auto rounded-tl-none border border-white/5'
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                            <div className="flex items-center justify-end gap-1 text-[8px] text-white/50 mt-1 leading-none font-mono">
                              <span>{msg.time}</span>
                              {msg.sender === 'clinic' && <CheckCheck className="w-3 h-3 text-emerald-450" />}
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Simulated Keyboard / Fast replies bar */}
                    {activeAppt.whatsappSentAt && (activeAppt.status === 'scheduled' || activeAppt.status === 'confirmed') && (
                      <div className="bg-[#121B22] p-2 border-t border-white/5 space-y-2">
                        <div className="flex items-center justify-between text-[8.5px] text-slate-400 font-bold uppercase tracking-wider font-mono">
                          <span>Auto-Confirmação Rápida</span>
                          <span className="text-[7.5px] text-[#D4AF37]">Clique para simular resposta:</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            disabled={isSendingReply}
                            onClick={() => handleSimulatePatientReply(activeAppt.id, 'SIM')}
                            className="bg-[#182F24] hover:bg-[#1E3B2D] text-emerald-300 border border-emerald-800/40 font-bold py-1 px-2 rounded text-[10px] transition cursor-pointer flex items-center justify-center gap-1"
                          >
                            👍 SIM, CONFIRMO
                          </button>
                          <button
                            type="button"
                            disabled={isSendingReply}
                            onClick={() => handleSimulatePatientReply(activeAppt.id, 'NÃO')}
                            className="bg-[#3D1D1D] hover:bg-[#4D2525] text-red-300 border border-red-800/40 font-bold py-1 px-2 rounded text-[10px] transition cursor-pointer flex items-center justify-center gap-1"
                          >
                            👎 NÃO, CANCELAR
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Standard Message Form Input */}
                    {activeAppt.whatsappSentAt && (
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSimulatePatientReply(activeAppt.id, patientReplyText);
                        }}
                        className="bg-[#1F2C34] p-1.5 flex items-center gap-1.5"
                      >
                        <input
                          type="text"
                          value={patientReplyText}
                          onChange={(e) => setPatientReplyText(e.target.value)}
                          disabled={isSendingReply}
                          placeholder={isSendingReply ? 'Simulando resposta...' : 'Digite como paciente..'}
                          className="flex-1 bg-[#2A3942] border-none text-[10.5px] text-white focus:outline-none focus:ring-0 rounded-full px-3.5 py-1.5 placeholder-slate-500"
                        />
                        <button
                          type="submit"
                          disabled={isSendingReply || !patientReplyText.trim()}
                          className="w-7 h-7 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center transition shrink-0 cursor-pointer disabled:opacity-40"
                          title="Simular Clicando"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    )}
                  </div>

                  {/* Actions guide info box */}
                  <div className="p-3 bg-[#131519]/40 border border-dashed border-white/10 rounded-xl space-y-1">
                    <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-widest font-mono block">Instrução ao Operador</span>
                    <p className="text-[10px] text-slate-400 leading-normal font-sans">
                      Aqui você simula o celular do paciente. Ao arrastar respostas rápidas ou digitar mensagens e clicar em Enviar, seu robô de back-end interpretará e alterará o status do agendamento automaticamente, atualizando as salas de atendimento.
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* New Appointment Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-45 animate-fade-in">
          <div className="bg-[#1A1D23] rounded-2xl max-w-md w-full border border-white/10 shadow-2xl overflow-hidden animate-scale-up">
            <div className="bg-[#131519] px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#D4AF37] flex items-center gap-1.5 font-serif italic">
                <Calendar className="w-4 h-4 text-[#D4AF37]" />
                Agendar Nova Consulta inteligente
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-[#94A3B8] hover:text-[#E2E8F0] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-950/40 text-red-300 text-xs rounded-xl flex items-start gap-2 border border-red-900/30 animate-shake">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                  <div>
                    <span className="font-semibold text-red-200">Aviso de Agenda:</span> {errorMsg}
                  </div>
                </div>
              )}

              {successMsg && (
                <div className="p-3 bg-green-950/40 text-green-300 text-xs rounded-xl flex items-center gap-2 border border-green-905/30">
                  <Check className="w-4 h-4 shrink-0 text-green-400" />
                  {successMsg}
                </div>
              )}

              {/* Patient Selection */}
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Paciente *</label>
                <select
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full bg-[#131519] border border-white/10 focus:border-[#D4AF37] rounded-xl p-2.5 text-xs text-[#F1F5F9] focus:outline-none transition-all"
                  required
                >
                  <option value="">Selecione o paciente...</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.phone})</option>
                  ))}
                </select>
              </div>

              {/* Therapist Selection */}
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Terapeuta Integrativo *</label>
                <select
                  value={therapistId}
                  onChange={(e) => setTherapistId(e.target.value)}
                  className="w-full bg-[#131519] border border-white/10 focus:border-[#D4AF37] rounded-xl p-2.5 text-xs text-[#F1F5F9] focus:outline-none transition-all"
                  required
                >
                  <option value="">Selecione o terapeuta...</option>
                  {activeTherapists.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} - {t.specialty}</option>
                  ))}
                </select>
              </div>

              {/* Therapy Selection */}
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Terapia / Serviço *</label>
                <select
                  value={therapyId}
                  onChange={(e) => setTherapyId(e.target.value)}
                  className="w-full bg-[#131519] border border-white/10 focus:border-[#D4AF37] rounded-xl p-2.5 text-xs text-[#F1F5F9] focus:outline-none transition-all"
                  required
                >
                  <option value="">Selecione a terapia...</option>
                  {activeTherapies.map((srv) => (
                    <option key={srv.id} value={srv.id}>{srv.name} ({srv.durationMinutes} min) - R$ {(srv.price / 100).toFixed(2)}</option>
                  ))}
                </select>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Data *</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-[#131519] border border-white/10 focus:border-[#D4AF37] rounded-xl p-2.5 text-xs text-[#F1F5F9] focus:outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Horário *</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-[#131519] border border-white/10 focus:border-[#D4AF37] rounded-xl p-2.5 text-xs text-[#F1F5F9] focus:outline-none transition-all"
                    required
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Observações adicionais</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-[#131519] border border-white/10 focus:border-[#D4AF37] rounded-xl p-2.5 text-xs text-[#F1F5F9] focus:outline-none transition-all placeholder-slate-600"
                  placeholder="Instruções adicionais ou queixas principais..."
                />
              </div>

              {/* Form buttons */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#94A3B8] hover:text-[#E2E8F0] bg-[#131519] rounded-xl border border-white/5 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold text-[#0F1115] bg-[#D4AF37] hover:bg-[#C5A030] rounded-xl transition shadow-sm cursor-pointer flex items-center justify-center gap-1 disabled:opacity-55"
                >
                  {submitting ? 'Verificando Conflitos...' : 'Confirmar Agenda'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Collision Conflict Modal */}
      {collisionModal.show && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#1A1D23] rounded-2xl max-w-sm w-full border border-red-500/30 shadow-2xl overflow-hidden animate-scale-up p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-8 h-8 shrink-0" />
              <h3 className="text-lg font-bold">Conflito de Agenda!</h3>
            </div>
            
            <p className="text-xs text-slate-300">
              O terapeuta selecionado já possui um agendamento neste horário.
            </p>

            <div className="bg-[#131519] rounded-xl p-4 border border-white/5 space-y-2">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Sugestões de horários próximos:</p>
              <div className="flex flex-wrap gap-2 pt-1">
                {collisionModal.suggestions.map(suggestion => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setTime(suggestion);
                      setCollisionModal({ show: false, suggestions: [] });
                    }}
                    className="bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setCollisionModal({ show: false, suggestions: [] })}
              className="w-full bg-white/5 hover:bg-white/10 text-white text-xs font-semibold py-2.5 rounded-xl transition cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
