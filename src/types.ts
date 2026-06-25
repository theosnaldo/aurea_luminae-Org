export interface Patient {
  id: number;
  name: string;
  email: string | null;
  phone: string;
  birthDate: string | null;
  cpf: string | null;
  address: string | null;
  notes: string | null;
  createdAt: string;
}

export interface Therapist {
  id: number;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  registryNumber: string | null;
  active: boolean;
  createdAt: string;
}

export interface Employee {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
}

export interface Therapy {
  id: number;
  name: string;
  description: string | null;
  durationMinutes: number;
  price: number; // in cents
  active: boolean;
  createdAt: string;
}

export interface Appointment {
  id: number;
  patientId: number;
  therapistId: number;
  therapyId: number;
  appointmentDate: string;
  appointmentTime: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  whatsappSentAt: string | null;
  notes: string | null;
  createdAt: string;
  patient?: Patient;
  therapist?: Therapist;
  therapy?: Therapy;
}

export interface HealthRecord {
  id: number;
  patientId: number;
  therapistId: number;
  appointmentId: number | null;
  date: string;
  symptoms: string;
  evolution: string;
  recommendations: string | null;
  signature: string | null;
  photos: string[] | null;
  createdAt: string;
  patient?: Patient;
  therapist?: Therapist;
}

export interface CashFlowTransaction {
  id: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number; // in cents
  date: string;
  paymentMethod: string | null;
  appointmentId: number | null;
  createdAt: string;
}

export interface DashboardStats {
  patientsCount: number;
  therapistsCount: number;
  appointmentsCount: number;
  totalInflow: number;
  totalOutflow: number;
  netBalance: number;
  latestAppointments: Appointment[];
  transactionsCount: number;
}

export interface Anamnesis {
  id: number;
  patientId: number;
  therapistId: number;
  date: string;
  physicalSymptoms: string;
  sleepPattern: string | null;
  dietHydration: string | null;
  energyLevel: string | null;
  emotionalState: string | null;
  mentalStressor: string | null;
  pastTraumas: string | null;
  energeticChakras: string | null;
  vibeAura: string | null;
  spiritualBeliefs: string | null;
  familyPatterns: string | null;
  relationships: string | null;
  therapeuticPlan: string | null;
  notes: string | null;
  aiAnalysis: string | null;
  signature: string | null;
  createdAt: string;
  patient?: Patient;
  therapist?: Therapist;
}

export interface ClinicSettings {
  id: number;
  clinicName: string;
  cnpj: string | null;
  phone: string;
  email: string | null;
  address: string | null;
  accentColor: string;
  welcomeMessage: string | null;
  logoUrl: string | null;
  isConfigured: boolean;
  createdAt: string;
}

export interface InventoryItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  unit: string;
  createdAt: string;
}

export interface QuickNote {
  id: number;
  patientId: number;
  content: string;
  createdAt: string;
}
