import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, boolean } from 'drizzle-orm/pg-core';

// 1. Users table (linked to Firebase Auth UID)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  name: text('name').notNull(),
  role: text('role').default('receptionist').notNull(), // 'admin', 'therapist', 'receptionist'
  therapistId: integer('therapist_id'), // optional relationship if role is 'therapist'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 2. Patients table (Pacientes)
export const patients = pgTable('patients', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone').notNull(),
  birthDate: text('birth_date'), // format: YYYY-MM-DD
  cpf: text('cpf'),
  address: text('address'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 3. Therapists table (Terapeutas)
export const therapists = pgTable('therapists', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  specialty: text('specialty').notNull(), // Reiki, Acupuncture, Floral, etc.
  registryNumber: text('registry_number'), // Professional council registry
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 4. Employees table (Funcionários - general staff like receptionists)
export const employees = pgTable('employees', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  role: text('role').notNull(), // Assistant, Manager, cleaning, etc.
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 5. Therapies table (Terapias)
export const therapies = pgTable('therapies', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  durationMinutes: integer('duration_minutes').notNull(), // default e.g. 60
  price: integer('price').notNull(), // Price in cents (R$)
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 6. Appointments table (Agendamentos)
export const appointments = pgTable('appointments', {
  id: serial('id').primaryKey(),
  patientId: integer('patient_id')
    .references(() => patients.id, { onDelete: 'cascade' })
    .notNull(),
  therapistId: integer('therapist_id')
    .references(() => therapists.id, { onDelete: 'cascade' })
    .notNull(),
  therapyId: integer('therapy_id')
    .references(() => therapies.id, { onDelete: 'cascade' })
    .notNull(),
  appointmentDate: text('appointment_date').notNull(), // YYYY-MM-DD
  appointmentTime: text('appointment_time').notNull(), // HH:MM
  status: text('status').default('scheduled').notNull(), // 'scheduled', 'completed', 'cancelled'
  whatsappSentAt: timestamp('whatsapp_sent_at'), // timestamp when message was sent
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 7. Electronic Health Records table (Prontuários Eletrônicos)
export const healthRecords = pgTable('health_records', {
  id: serial('id').primaryKey(),
  patientId: integer('patient_id')
    .references(() => patients.id, { onDelete: 'cascade' })
    .notNull(),
  therapistId: integer('therapist_id')
    .references(() => therapists.id, { onDelete: 'cascade' })
    .notNull(),
  appointmentId: integer('appointment_id')
    .references(() => appointments.id, { onDelete: 'set null' }),
  date: text('date').notNull(), // YYYY-MM-DD
  symptoms: text('symptoms').notNull(),
  evolution: text('evolution').notNull(), // treatment/session progress summary
  recommendations: text('recommendations'),
  signature: text('signature'), // Practitioner digital signature
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 9. Holistic Anamnesis table (Anamnese Holística Multidimensional)
export const anamneses = pgTable('anamneses', {
  id: serial('id').primaryKey(),
  patientId: integer('patient_id')
    .references(() => patients.id, { onDelete: 'cascade' })
    .notNull(),
  therapistId: integer('therapist_id')
    .references(() => therapists.id, { onDelete: 'cascade' })
    .notNull(),
  date: text('date').notNull(), // YYYY-MM-DD
  
  // Physical / Physiological Dimension
  physicalSymptoms: text('physical_symptoms').notNull(),
  sleepPattern: text('sleep_pattern'),
  dietHydration: text('diet_hydration'),
  energyLevel: text('energy_level'),
  
  // Emotional / Mental Dimension
  emotionalState: text('emotional_state'),
  mentalStressor: text('mental_stressor'),
  pastTraumas: text('past_traumas'),
  
  // Energetic / Spiritual Dimension
  energeticChakras: text('energetic_chakras'),
  vibeAura: text('vibe_aura'),
  spiritualBeliefs: text('spiritual_beliefs'),
  
  // Systemic / Family Dimension
  familyPatterns: text('family_patterns'),
  relationships: text('relationships'),
  
  // Synthesis & Plan
  therapeuticPlan: text('therapeutic_plan'),
  notes: text('notes'),
  
  // AI Multidimensional Analysis (Somatization, Chakras, Systemic, Guidance)
  aiAnalysis: text('ai_analysis'),
  
  signature: text('signature'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 8. Cash Flow / Transactions table (Fluxo de Caixa)
export const cashFlow = pgTable('cash_flow', {
  id: serial('id').primaryKey(),
  type: text('type').notNull(), // 'income' or 'expense'
  category: text('category').notNull(), // e.g. 'Therapy Session', 'Salary', 'Rent', 'Supplies', 'Other'
  description: text('description').notNull(),
  amount: integer('amount').notNull(), // in cents (R$)
  date: text('date').notNull(), // YYYY-MM-DD
  paymentMethod: text('payment_method'), // 'Pix', 'Credit Card', 'Debit Card', 'Cash'
  appointmentId: integer('appointment_id')
    .references(() => appointments.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 10. Clinic Settings table (Ajustes de Customização de Instalação)
export const clinicSettings = pgTable('clinic_settings', {
  id: serial('id').primaryKey(),
  clinicName: text('clinic_name').notNull(),
  cnpj: text('cnpj'),
  phone: text('phone').notNull(),
  email: text('email'),
  address: text('address'),
  accentColor: text('accent_color').default('#D4AF37').notNull(),
  welcomeMessage: text('welcome_message'),
  logoUrl: text('logo_url'),
  isConfigured: boolean('is_configured').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 11. Inventory table (Estoque e Insumos)
export const inventory = pgTable('inventory', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  quantity: integer('quantity').notNull(),
  minQuantity: integer('min_quantity').notNull(),
  unit: text('unit').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 12. Quick Notes table
export const quickNotes = pgTable('quick_notes', {
  id: serial('id').primaryKey(),
  patientId: integer('patient_id')
    .references(() => patients.id, { onDelete: 'cascade' })
    .notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ---------------------------------------------------------
// RELATIONS DEFINITIONS
// ---------------------------------------------------------

export const usersRelations = relations(users, ({ one }) => ({
  therapist: one(therapists, {
    fields: [users.therapistId],
    references: [therapists.id],
  }),
}));

export const patientsRelations = relations(patients, ({ many }) => ({
  appointments: many(appointments),
  healthRecords: many(healthRecords),
  anamneses: many(anamneses),
  quickNotes: many(quickNotes),
}));

export const therapistsRelations = relations(therapists, ({ many, one }) => ({
  appointments: many(appointments),
  healthRecords: many(healthRecords),
  anamneses: many(anamneses),
  user: one(users),
}));

export const therapiesRelations = relations(therapies, ({ many }) => ({
  appointments: many(appointments),
}));

export const appointmentsRelations = relations(appointments, ({ one, many }) => ({
  patient: one(patients, {
    fields: [appointments.patientId],
    references: [patients.id],
  }),
  therapist: one(therapists, {
    fields: [appointments.therapistId],
    references: [therapists.id],
  }),
  therapy: one(therapies, {
    fields: [appointments.therapyId],
    references: [therapies.id],
  }),
  healthRecords: many(healthRecords),
  transactions: many(cashFlow),
}));

export const healthRecordsRelations = relations(healthRecords, ({ one }) => ({
  patient: one(patients, {
    fields: [healthRecords.patientId],
    references: [patients.id],
  }),
  therapist: one(therapists, {
    fields: [healthRecords.therapistId],
    references: [therapists.id],
  }),
  appointment: one(appointments, {
    fields: [healthRecords.appointmentId],
    references: [appointments.id],
  }),
}));

export const cashFlowRelations = relations(cashFlow, ({ one }) => ({
  appointment: one(appointments, {
    fields: [cashFlow.appointmentId],
    references: [appointments.id],
  }),
}));

export const anamnesesRelations = relations(anamneses, ({ one }) => ({
  patient: one(patients, {
    fields: [anamneses.patientId],
    references: [patients.id],
  }),
  therapist: one(therapists, {
    fields: [anamneses.therapistId],
    references: [therapists.id],
  }),
}));

export const quickNotesRelations = relations(quickNotes, ({ one }) => ({
  patient: one(patients, {
    fields: [quickNotes.patientId],
    references: [patients.id],
  }),
}));
