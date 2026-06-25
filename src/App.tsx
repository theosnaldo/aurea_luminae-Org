import React, { useState, useEffect } from 'react';
import { auth } from './lib/firebase.ts';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import AuthScreen from './components/AuthScreen.tsx';
import DashboardView from './components/DashboardView.tsx';
import AppointmentsView from './components/AppointmentsView.tsx';
import PatientsView from './components/PatientsView.tsx';
import TherapistsView from './components/TherapistsView.tsx';
import HealthRecordsView from './components/HealthRecordsView.tsx';
import CashFlowView from './components/CashFlowView.tsx';
import PrescriptionView from './components/PrescriptionView.tsx';
import AnamnesisView from './components/AnamnesisView.tsx';
import ClinicSetupView from './components/ClinicSetupView.tsx';
import InventoryView from './components/InventoryView.tsx';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Patient, Therapist, Employee, Therapy, Appointment, HealthRecord, CashFlowTransaction, DashboardStats, Anamnesis, ClinicSettings, InventoryItem
} from './types.ts';
import { 
  Compass, Calendar, Users, Sparkles, Wallet, Award, LogOut, Loader2, Menu, X, Heart, FileText, BookOpen, Settings, Info
} from 'lucide-react';

type TabType = 'dashboard' | 'appointments' | 'patients' | 'therapists' | 'health-records' | 'cash-flow' | 'prescription' | 'anamnesis' | 'clinic-settings' | 'inventory';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [userRole, setUserRole] = useState<string>('admin');

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);

  // Entities Data States
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [therapies, setTherapies] = useState<Therapy[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [cashFlow, setCashFlow] = useState<CashFlowTransaction[]>([]);
  const [anamneses, setAnamneses] = useState<Anamnesis[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [notificationsLog, setNotificationsLog] = useState<any[]>([]);

  const [clinicConfig, setClinicConfig] = useState<ClinicSettings | null>(null);
  const [savingClinic, setSavingClinic] = useState(false);

  const [loadingData, setLoadingData] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);

  const fetchClinicConfig = async () => {
    try {
      const res = await fetch('/api/clinic');
      if (res.ok) {
        const data = await res.json();
        setClinicConfig(data);
      }
    } catch (err) {
      console.error('Error fetching clinic settings:', err);
    }
  };

  const handleSaveClinicConfig = async (data: Partial<ClinicSettings>) => {
    if (!authToken) return;
    setSavingClinic(true);
    try {
      const res = await fetch('/api/clinic', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated = await res.json();
        setClinicConfig(updated);
        fetchAllData();
      }
    } catch (err) {
      console.error('Error saving clinic configuration:', err);
    } finally {
      setSavingClinic(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        setActiveTab('appointments');
        setShowNewAppointmentModal(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Track Auth Changes
  useEffect(() => {
    fetchClinicConfig();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const token = await user.getIdToken();
        setAuthToken(token);
        sessionStorage.setItem('firebase_token', token);

        // Fetch custom PostgreSQL DB assigned permission/role
        try {
          const res = await fetch('/api/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setUserRole(data.dbUser?.role || 'admin');
          }
        } catch (err) {
          console.error('Failed loading permission level profile on mount:', err);
        }
      } else {
        setCurrentUser(null);
        setAuthToken(null);
        setUserRole('admin');
        sessionStorage.removeItem('firebase_token');
      }
      setAuthChecking(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch all tables once authenticated
  const fetchAllData = async () => {
    if (!authToken) return;
    
    setLoadingData(true);
    setNetworkError(null);
    const headers = {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    };

    try {
      fetchClinicConfig();
      // 1. Fetch Dashboard metrics
      const statsRes = await fetch('/api/dashboard-stats', { headers });
      if (statsRes.ok) setDashboardStats(await statsRes.json());

      // 2. Fetch Patients
      const patientsRes = await fetch('/api/patients', { headers });
      if (patientsRes.ok) setPatients(await patientsRes.json());

      // 3. Fetch Therapists
      const therapistsRes = await fetch('/api/therapists', { headers });
      if (therapistsRes.ok) setTherapists(await therapistsRes.json());

      // 4. Fetch Employees
      const employeesRes = await fetch('/api/employees', { headers });
      if (employeesRes.ok) setEmployees(await employeesRes.json());

      // 5. Fetch Therapies
      const therapiesRes = await fetch('/api/therapies', { headers });
      if (therapiesRes.ok) setTherapies(await therapiesRes.json());

      // 6. Fetch Appointments
      const apptsRes = await fetch('/api/appointments', { headers });
      if (apptsRes.ok) setAppointments(await apptsRes.json());

      // 7. Fetch Health records
      const recordsRes = await fetch('/api/health-records', { headers });
      if (recordsRes.ok) setHealthRecords(await recordsRes.json());

      // 8. Fetch Cash flow
      const cashRes = await fetch('/api/cash-flow', { headers });
      if (cashRes.ok) setCashFlow(await cashRes.json());

      // 9. Fetch Anamneses
      const anamnesesRes = await fetch('/api/anamneses', { headers });
      if (anamnesesRes.ok) setAnamneses(await anamnesesRes.json());

      // 10. Fetch Inventory
      const inventoryRes = await fetch('/api/inventory', { headers });
      if (inventoryRes.ok) setInventory(await inventoryRes.json());

    } catch (err: any) {
      console.error('Error synchronizing database tables:', err);
      setNetworkError('A conexão com o servidor PostgreSQL falhou. Verifique se o banco se encontra ativo.');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (authToken) {
      fetchAllData();
    }
  }, [authToken]);

  // Auth Handling Success
  const handleLoginSuccess = (userData: any) => {
    setAuthToken(userData.token);
    if (userData.role) {
      setUserRole(userData.role);
    }
    sessionStorage.setItem('firebase_token', userData.token);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setAuthToken(null);
      setCurrentUser(null);
      setActiveTab('dashboard');
    } catch (err) {
      console.error('Signout failed:', err);
    }
  };

  // -------------------------------------------------------------
  // ENTITY OPERATIONS (FORWARDING CALLS WITH AUTH HEADERS)
  // -------------------------------------------------------------
  
  const getHeaders = () => ({
    'Authorization': `Bearer ${authToken || ''}`,
    'Content-Type': 'application/json',
  });

  // Patients
  const handleAddPatient = async (data: any) => {
    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (res.ok) fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditPatient = async (id: number, data: any) => {
    try {
      const res = await fetch(`/api/patients/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (res.ok) fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePatient = async (id: number) => {
    if (!confirm('Deseja realmente remover permanentemente este paciente do prontuário?')) return;
    try {
      const res = await fetch(`/api/patients/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (res.ok) fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Therapists
  const handleAddTherapist = async (data: any) => {
    try {
      const res = await fetch('/api/therapists', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (res.ok) fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditTherapist = async (id: number, data: any) => {
    try {
      const res = await fetch(`/api/therapists/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (res.ok) fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTherapist = async (id: number) => {
    if (!confirm('Remover este terapeuta?')) return;
    try {
      const res = await fetch(`/api/therapists/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (res.ok) fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Therapies
  const handleAddTherapy = async (data: any) => {
    try {
      const res = await fetch('/api/therapies', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (res.ok) fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditTherapy = async (id: number, data: any) => {
    try {
      const res = await fetch(`/api/therapies/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (res.ok) fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTherapy = async (id: number) => {
    if (!confirm('Deseja deletar esta terapia integrativa e remover seu preço do catálogo?')) return;
    try {
      const res = await fetch(`/api/therapies/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (res.ok) fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Employees
  const handleAddEmployee = async (data: any) => {
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (res.ok) fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditEmployee = async (id: number, data: any) => {
    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (res.ok) fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteEmployee = async (id: number) => {
    if (!confirm('Remover funcionário do apoio?')) return;
    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (res.ok) fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Intelligent schedule insert (checks for double bookings)
  const handleAddAppointment = async (data: any): Promise<any> => {
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });

      if (res.status === 409) {
        const errorData = await res.json();
        alert(`AVISO CONFLITO DE AGENDA:\n\n${errorData.message}`);
        return false;
      }

      if (res.ok) {
        const newAppt = await res.json();
        fetchAllData();
        return newAppt;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      });
      if (res.ok) fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Dispatches Simulated WhatsApp notifications
  const handleSendWhatsapp = async (id: number) => {
    try {
      const res = await fetch(`/api/appointments/${id}/notify`, {
        method: 'POST',
        headers: getHeaders(),
      });
      if (res.ok) {
        const result = await res.json();
        
        // Add to local state logger array
        setNotificationsLog((prev) => [result, ...prev]);
        fetchAllData(); // refresh agenda sent state
      }
    } catch (err) {
      console.error('WhatsApp notify error:', err);
    }
  };

  // Electronic Medical Records (Prontuários)
  const handleAddHealthRecord = async (data: any) => {
    try {
      const res = await fetch('/api/health-records', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (res.ok) fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Cash Flow
  const handleAddTransaction = async (data: any) => {
    try {
      const res = await fetch('/api/cash-flow', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (res.ok) fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Anamneses
  const handleAddAnamnesis = async (data: any) => {
    try {
      const res = await fetch('/api/anamneses', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (res.ok) fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditAnamnesis = async (id: number, data: any) => {
    try {
      const res = await fetch(`/api/anamneses/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (res.ok) fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAnamnesis = async (id: number) => {
    try {
      const res = await fetch(`/api/anamneses/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (res.ok) fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Inventory
  const handleAddInventoryItem = async (data: any) => {
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (res.ok) fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateInventoryQuantity = async (id: number, quantity: number) => {
    try {
      const res = await fetch(`/api/inventory/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ quantity }),
      });
      if (res.ok) fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteInventoryItem = async (id: number) => {
    if (!confirm('Remover este item do estoque?')) return;
    try {
      const res = await fetch(`/api/inventory/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (res.ok) fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };


  // Loading overlay spinner
  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <span className="text-xs font-semibold text-slate-500 font-sans">Carregando clínica unificada...</span>
        </div>
      </div>
    );
  }

  // Not signed in
  if (!authToken) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // Clinic is logged in but not yet configured (Setup/Instalação)
  if (clinicConfig && !clinicConfig.isConfigured) {
    return <ClinicSetupView onSave={handleSaveClinicConfig} loading={savingClinic} />;
  }

  return (
    <div className="min-h-screen flex bg-[#0F1115] text-[#E2E8F0] font-sans">
      
      {/* -------------------- SIDEBAR PANEL -------------------- */}
      <aside className={`fixed inset-y-0 left-0 bg-[#0F1115] border-r border-white/10 text-[#E2E8F0] w-64 p-5 z-30 transform transition-transform duration-300 md:translate-x-0 md:relative md:flex md:flex-col ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Header Title */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            {clinicConfig?.logoUrl ? (
              <img 
                src={clinicConfig.logoUrl} 
                alt="Clinic Logo" 
                className="w-9 h-9 object-contain rounded-lg border border-white/5"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="p-2 bg-[#1A1D23] border border-white/5 rounded-xl">
                <Heart className="w-5 h-5 text-[#D4AF37]" style={{ color: clinicConfig?.accentColor }} />
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-sm font-bold tracking-tight font-serif text-[#D4AF37] italic truncate" style={{ color: clinicConfig?.accentColor }}>
                {clinicConfig?.clinicName || 'Terapia Viva'}
              </h1>
              <p className="text-[9px] uppercase tracking-[0.1em] text-[#94A3B8] mt-1 font-sans truncate">
                {clinicConfig?.cnpj ? `CNPJ: ${clinicConfig.cnpj}` : 'Clínica Integrativa'}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info Container */}
        <div className="mb-6 p-3 bg-[#1A1D23] border border-white/5 rounded-xl flex items-center gap-3">
          {currentUser?.photoURL ? (
            <img src={currentUser.photoURL} alt="User Avatar" className="w-9 h-9 rounded-lg border border-[#D4AF37]/30" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-9 h-9 bg-[#131519] text-[#D4AF37] border border-white/10 rounded-lg flex items-center justify-center font-bold">
              {currentUser?.email?.[0].toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold truncate leading-none text-[#F1F5F9]">{currentUser?.displayName || 'Usuário'}</p>
            <span className="text-[10px] text-[#94A3B8] font-mono truncate block mt-1">{currentUser?.email}</span>
            
            {/* Elegant Permission Badge */}
            <span className={`inline-block text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-md mt-2 border ${
              userRole === 'admin' 
                ? 'bg-[#D4AF37]/15 text-[#D4AF37] border-[#D4AF37]/30' 
                : userRole === 'therapist'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                  : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25'
            }`}>
              {userRole === 'admin' ? 'Administrador' : userRole === 'therapist' ? 'Terapeuta' : 'Recepção'}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="space-y-1.5 flex-1 select-none">
          <button
            onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 font-semibold text-xs leading-none py-3 px-3.5 rounded-xl transition cursor-pointer ${
              activeTab === 'dashboard' ? 'bg-[#1A1D23] text-[#D4AF37] border border-white/10 shadow-sm' : 'text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-white/5'
            }`}
          >
            <Compass className="w-4 h-4 shrink-0" />
            Painel Central
          </button>

          <button
            onClick={() => { setActiveTab('appointments'); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 font-semibold text-xs leading-none py-3 px-3.5 rounded-xl transition cursor-pointer ${
              activeTab === 'appointments' ? 'bg-[#1A1D23] text-[#D4AF37] border border-white/10 shadow-sm' : 'text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-white/5'
            }`}
          >
            <Calendar className="w-4 h-4 shrink-0" />
            Agenda Integrada
          </button>

          <button
            onClick={() => { setActiveTab('patients'); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 font-semibold text-xs leading-none py-3 px-3.5 rounded-xl transition cursor-pointer ${
              activeTab === 'patients' ? 'bg-[#1A1D23] text-[#D4AF37] border border-white/10 shadow-sm' : 'text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            Pacientes
          </button>

          {/* Restrict Health Records (Prontuário com IA) to Admin and Therapist */}
          {(userRole === 'admin' || userRole === 'therapist') && (
            <button
              onClick={() => { setActiveTab('health-records'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 font-semibold text-xs leading-none py-3 px-3.5 rounded-xl transition cursor-pointer ${
                activeTab === 'health-records' ? 'bg-[#1A1D23] text-[#D4AF37] border border-white/10 shadow-sm' : 'text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              Prontuário com IA
            </button>
          )}

          {/* Restrict Anamnese to Admin and Therapist */}
          {(userRole === 'admin' || userRole === 'therapist') && (
            <button
              onClick={() => { setActiveTab('anamnesis'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 font-semibold text-xs leading-none py-3 px-3.5 rounded-xl transition cursor-pointer ${
                activeTab === 'anamnesis' ? 'bg-[#1A1D23] text-[#D4AF37] border border-white/10 shadow-sm' : 'text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-white/5'
              }`}
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              Anamnese Holística
            </button>
          )}

          {/* Restrict Prescription to Admin and Therapist */}
          {(userRole === 'admin' || userRole === 'therapist') && (
            <button
              onClick={() => { setActiveTab('prescription'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 font-semibold text-xs leading-none py-3 px-3.5 rounded-xl transition cursor-pointer ${
                activeTab === 'prescription' ? 'bg-[#1A1D23] text-[#D4AF37] border border-white/10 shadow-sm' : 'text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-white/5'
              }`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              Emitir Receituário
            </button>
          )}

          <button
            onClick={() => { setActiveTab('therapists'); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 font-semibold text-xs leading-none py-3 px-3.5 rounded-xl transition cursor-pointer ${
              activeTab === 'therapists' ? 'bg-[#1A1D23] text-[#D4AF37] border border-white/10 shadow-sm' : 'text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-white/5'
            }`}
          >
            <Award className="w-4 h-4 shrink-0" />
            Recursos e Serviços
          </button>

          {/* Restrict Cash Flow (Fluxo de Caixa) to Admin ONLY */}
          {userRole === 'admin' && (
            <button
              onClick={() => { setActiveTab('cash-flow'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 font-semibold text-xs leading-none py-3 px-3.5 rounded-xl transition cursor-pointer ${
                activeTab === 'cash-flow' ? 'bg-[#1A1D23] text-[#D4AF37] border border-white/10 shadow-sm' : 'text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-white/5'
              }`}
            >
              <Wallet className="w-4 h-4 shrink-0" />
              Fluxo de Caixa
            </button>
          )}

          {/* Inventory Management */}
          {(userRole === 'admin' || userRole === 'therapist') && (
            <button
              onClick={() => { setActiveTab('inventory'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 font-semibold text-xs leading-none py-3 px-3.5 rounded-xl transition cursor-pointer ${
                activeTab === 'inventory' ? 'bg-[#1A1D23] text-[#D4AF37] border border-white/10 shadow-sm' : 'text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-white/5'
              }`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              Estoque e Insumos
            </button>
          )}

          {/* Restrict Clinic Settings to Admin ONLY */}
          {userRole === 'admin' && (
            <button
              onClick={() => { setActiveTab('clinic-settings'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 font-semibold text-xs leading-none py-3 px-3.5 rounded-xl transition cursor-pointer ${
                activeTab === 'clinic-settings' ? 'bg-[#1A1D23] text-[#D4AF37] border border-white/10 shadow-sm' : 'text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-white/5'
              }`}
              style={activeTab === 'clinic-settings' ? { color: clinicConfig?.accentColor || '#D4AF37' } : undefined}
            >
              <Settings className="w-4 h-4 shrink-0" />
              Configurar Clínica
            </button>
          )}
        </nav>

        {/* Logout button at footer */}
        <div className="pt-4 border-t border-white/10 shrink-0 select-none">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 text-[#94A3B8] hover:text-red-400 py-2.5 px-3 rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sair do Sistema
          </button>
        </div>
      </aside>

      {/* -------------------- MAIN PAGE CONTAINER ---------------- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        
        {/* Main top bar controller */}
        <header className="bg-[#0F1115] border-b border-white/5 py-3.5 px-6 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-[#94A3B8] p-1 bg-[#1A1D23] rounded-lg cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-xs font-bold text-[#94A3B8] font-mono tracking-widest uppercase hidden md:inline">
              sistema integrativo • local
            </span>
          </div>

          <div className="flex items-center gap-4">
            {loadingData && (
              <span className="flex items-center gap-1.5 text-xs text-[#94A3B8] font-semibold">
                <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                Atualizando...
              </span>
            )}
            
            <button
              onClick={fetchAllData}
              className="px-3 py-1.5 bg-[#1A1D23] hover:bg-[#131519] border border-white/10 rounded-xl text-xs font-semibold text-[#D4AF37] transition truncate cursor-pointer"
              title="Forçar Sincronização PostgreSQL"
            >
              Sincronizar Banco
            </button>
          </div>
        </header>

        {/* Active render view stage */}
        <main className="p-6 md:p-8 flex-1 max-w-7xl w-full mx-auto">
          {networkError && (
            <div className="mb-6 p-4 bg-red-950/20 text-red-300 text-xs rounded-2xl border border-red-900/30 font-sans flex items-center gap-3">
              <span className="p-1 px-2.5 rounded-lg bg-red-900/40 uppercase font-mono font-bold shrink-0 text-red-400">erro</span>
              <div>
                <p className="font-bold text-red-200">Falha na base de dados relacional:</p>
                <p className="mt-0.5 text-red-300 font-medium">{networkError}</p>
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === 'dashboard' && (
                <DashboardView 
                  stats={dashboardStats} 
                  onNavigate={(tab) => setActiveTab(tab as TabType)}
                  onSendWhatsapp={handleSendWhatsapp}
                />
              )}

              {activeTab === 'appointments' && (
                <AppointmentsView
                  appointments={appointments}
                  patients={patients}
                  therapists={therapists}
                  therapies={therapies}
                  onAddAppointment={handleAddAppointment}
                  onUpdateStatus={handleUpdateStatus}
                  onSendWhatsapp={handleSendWhatsapp}
                  notificationsLog={notificationsLog}
                  showModal={showNewAppointmentModal}
                  setShowModal={setShowNewAppointmentModal}
                />
              )}

              {activeTab === 'patients' && (
                <PatientsView
                  patients={patients}
                  appointments={appointments}
                  onAddPatient={handleAddPatient}
                  onEditPatient={handleEditPatient}
                  onDeletePatient={handleDeletePatient}
                />
              )}

              {activeTab === 'health-records' && (
                <HealthRecordsView
                  healthRecords={healthRecords}
                  patients={patients}
                  therapists={therapists}
                  onAddHealthRecord={handleAddHealthRecord}
                />
              )}

              {activeTab === 'anamnesis' && (
                <AnamnesisView
                  anamneses={anamneses}
                  patients={patients}
                  therapists={therapists}
                  onAddAnamnesis={handleAddAnamnesis}
                  onEditAnamnesis={handleEditAnamnesis}
                  onDeleteAnamnesis={handleDeleteAnamnesis}
                />
              )}

              {activeTab === 'prescription' && (
                <PrescriptionView
                  patients={patients}
                  therapists={therapists}
                />
              )}

              {activeTab === 'therapists' && (
                <TherapistsView
                  therapists={therapists}
                  therapies={therapies}
                  employees={employees}
                  onAddTherapist={handleAddTherapist}
                  onEditTherapist={handleEditTherapist}
                  onDeleteTherapist={handleDeleteTherapist}
                  onAddTherapy={handleAddTherapy}
                  onEditTherapy={handleEditTherapy}
                  onDeleteTherapy={handleDeleteTherapy}
                  onAddEmployee={handleAddEmployee}
                  onEditEmployee={handleEditEmployee}
                  onDeleteEmployee={handleDeleteEmployee}
                />
              )}

              {activeTab === 'cash-flow' && (
                <CashFlowView
                  cashFlow={cashFlow}
                  onAddTransaction={handleAddTransaction}
                />
              )}

              {activeTab === 'inventory' && (
                <InventoryView
                  inventory={inventory}
                  onAdd={handleAddInventoryItem}
                  onUpdateQuantity={handleUpdateInventoryQuantity}
                  onDelete={handleDeleteInventoryItem}
                />
              )}

              {activeTab === 'clinic-settings' && (
                <div className="space-y-6">
                  {/* Branding and Title Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="text-left">
                      <span className="text-[10px] tracking-widest font-bold font-mono text-[#D4AF37] uppercase" style={{ color: clinicConfig?.accentColor || '#D4AF37' }}>painel de controle</span>
                      <h2 className="text-xl font-bold text-white tracking-tight mt-0.5 font-sans">
                        Configurações Gerais da Clínica
                      </h2>
                      <p className="text-[#94A3B8] text-xs mt-1">
                        Gerencie a identidade e personalização da instalação física deste servidor local.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Editor Form */}
                    <div className="lg:col-span-2 bg-[#131519] border border-white/10 rounded-2xl p-6 space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-white flex items-center gap-2 text-left">
                          <Settings className="w-4 h-4 text-[#D4AF37]" style={{ color: clinicConfig?.accentColor || '#D4AF37' }} />
                          Dados Básicos da Instalação
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-left">
                          <div className="sm:col-span-2">
                            <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wider text-[10px]">Nome da Clínica / Consultório *</label>
                            <input
                              type="text"
                              className="w-full bg-[#1A1D23] border border-white/5 focus:border-[#D4AF37] rounded-xl p-3 text-white focus:outline-none"
                              value={clinicConfig?.clinicName || ''}
                              onChange={(e) => setClinicConfig(prev => prev ? { ...prev, clinicName: e.target.value } : null)}
                            />
                          </div>

                          <div>
                            <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wider text-[10px]">CNPJ ou CPF Responsável</label>
                            <input
                              type="text"
                              className="w-full bg-[#1A1D23] border border-white/5 focus:border-[#D4AF37] rounded-xl p-3 text-white focus:outline-none"
                              value={clinicConfig?.cnpj || ''}
                              onChange={(e) => setClinicConfig(prev => prev ? { ...prev, cnpj: e.target.value } : null)}
                              placeholder="00.000.000/0001-00"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wider text-[10px]">Telefone Principal / WhatsApp *</label>
                            <input
                              type="text"
                              className="w-full bg-[#1A1D23] border border-white/5 focus:border-[#D4AF37] rounded-xl p-3 text-white focus:outline-none"
                              value={clinicConfig?.phone || ''}
                              onChange={(e) => setClinicConfig(prev => prev ? { ...prev, phone: e.target.value } : null)}
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wider text-[10px]">E-mail de Contato</label>
                            <input
                              type="email"
                              className="w-full bg-[#1A1D23] border border-white/5 focus:border-[#D4AF37] rounded-xl p-3 text-white focus:outline-none"
                              value={clinicConfig?.email || ''}
                              onChange={(e) => setClinicConfig(prev => prev ? { ...prev, email: e.target.value } : null)}
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wider text-[10px]">Endereço Clínico Completo</label>
                            <input
                              type="text"
                              className="w-full bg-[#1A1D23] border border-white/5 focus:border-[#D4AF37] rounded-xl p-3 text-white focus:outline-none"
                              value={clinicConfig?.address || ''}
                              onChange={(e) => setClinicConfig(prev => prev ? { ...prev, address: e.target.value } : null)}
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wider text-[10px]">Slogan / Mensagem Ambiência sutil</label>
                            <input
                              type="text"
                              className="w-full bg-[#1A1D23] border border-white/5 focus:border-[#D4AF37] rounded-xl p-3 text-white focus:outline-none"
                              value={clinicConfig?.welcomeMessage || ''}
                              onChange={(e) => setClinicConfig(prev => prev ? { ...prev, welcomeMessage: e.target.value } : null)}
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wider text-[10px]">URL Logotipo da Clínica</label>
                            <input
                              type="text"
                              className="w-full bg-[#1A1D23] border border-white/5 focus:border-[#D4AF37] rounded-xl p-3 text-white focus:outline-none"
                              value={clinicConfig?.logoUrl || ''}
                              placeholder="URL para link da imagem"
                              onChange={(e) => setClinicConfig(prev => prev ? { ...prev, logoUrl: e.target.value } : null)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-white/5">
                        <h3 className="text-sm font-semibold text-white text-left">Prefixo de Cor e Matiz Energético</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                          {[
                            { name: 'Ouro Alquimia', value: '#D4AF37' },
                            { name: 'Verde Fito', value: '#10B981' },
                            { name: 'Azul Sutil', value: '#3B82F6' },
                            { name: 'Violeta Chakras', value: '#8B5CF6' },
                            { name: 'Laranja Vital', value: '#F59E0B' },
                          ].map((clr) => (
                            <button
                              key={clr.value}
                              type="button"
                              onClick={() => setClinicConfig(prev => prev ? { ...prev, accentColor: clr.value } : null)}
                              className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 text-center cursor-pointer transition ${
                                clinicConfig?.accentColor === clr.value ? 'bg-[#1A1D23] border-white/25 ring-1 ring-white/10' : 'border-white/5 hover:bg-white/5 opacity-70'
                              }`}
                            >
                              <span className="w-5 h-5 rounded-full block border border-white/20" style={{ backgroundColor: clr.value }} />
                              <span className="text-[10px] text-[#E2E8F0] font-medium leading-none">{clr.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end pt-4 border-t border-white/5">
                        <button
                          type="button"
                          disabled={savingClinic}
                          onClick={() => {
                            if (clinicConfig) {
                              handleSaveClinicConfig(clinicConfig);
                            }
                          }}
                          className="bg-[#D4AF37] hover:bg-[#C5A030] text-[#0f1115] font-bold py-3 px-6 rounded-xl flex items-center gap-2 text-xs uppercase tracking-wider transition active:scale-95 cursor-pointer disabled:opacity-50"
                          style={{ backgroundColor: clinicConfig?.accentColor || '#D4AF37' }}
                        >
                          {savingClinic ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" /> Salvando Alterações...
                            </>
                          ) : (
                            'Salvar Configurações'
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Right Column: Dynamic Preview */}
                    <div className="bg-[#131519] border border-white/10 rounded-2xl p-6 space-y-6 select-none text-left">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Visualização de Amostragem</h4>
                      
                      {/* Interactive Header Card Preview */}
                      <div className="p-4 bg-[#1A1D23] border border-white/5 rounded-xl space-y-3">
                        <span className="text-[9px] uppercase tracking-widest text-[#94A3B8] font-mono">Prévia do Receituário</span>
                        
                        <div className="pt-2 border-t border-white/5 flex items-center gap-2.5">
                          {clinicConfig?.logoUrl ? (
                            <img src={clinicConfig.logoUrl} className="w-8 h-8 object-contain rounded-md" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="p-2 bg-[#131519] rounded-lg border border-white/5 text-[#D4AF37]" style={{ color: clinicConfig?.accentColor || '#D4AF37' }}>
                              <Heart className="w-4 h-4" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-white truncate">{clinicConfig?.clinicName || 'Minha Clínica'}</h4>
                            <p className="text-[9px] text-[#94A3B8] truncate leading-tight">{clinicConfig?.address || 'Sem endereço informado'}</p>
                            <p className="text-[9px] text-[#94A3B8] truncate leading-tight">Tel: {clinicConfig?.phone}</p>
                          </div>
                        </div>

                        <div className="p-3 bg-[#131519] rounded-lg mt-2 text-[10px] text-[#94A3B8] italic border-l-2 text-left" style={{ borderLeftColor: clinicConfig?.accentColor || '#D4AF37' }}>
                          "{clinicConfig?.welcomeMessage || 'Slogan ou boavindas sutil'}"
                        </div>
                      </div>

                      <div className="bg-[#1C201C] p-4 rounded-xl border border-emerald-500/10 flex gap-3 text-left">
                        <Info className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[#E2E8F0] font-bold text-[11px]">Personalização Global Ativa</p>
                          <p className="text-[#94A3B8] text-[10px] leading-relaxed mt-0.5">
                            O nome e dados configurados acima serão portados e impressos nos Prontuários Eletrônicos (PDFs), Anamneses e propostas de tratamento.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
