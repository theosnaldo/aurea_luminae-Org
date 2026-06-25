import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './src/db/index.ts';
import { eq, and, ne, desc, asc, sql } from 'drizzle-orm';
import {
  users,
  patients,
  therapists,
  employees,
  therapies,
  appointments,
  healthRecords,
  cashFlow,
  anamneses,
  clinicSettings,
  inventory,
  quickNotes,
} from './src/db/schema.ts';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import { draftEvolutionAndRecommendations, draftHolisticPrescription, draftHolisticAnamnesisAnalysis } from './src/lib/gemini.ts';

const app = express();
const PORT = 3000;

// Body parsing
app.use(express.json());

// -------------------------------------------------------------
// PUBLIC & HEALTH API
// -------------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// -------------------------------------------------------------
// CLINIC ENDPOINTS (REQUIRE FIREBASE AUTHENTICATION)
// -------------------------------------------------------------

// Active user info
app.get('/api/me', requireAuth, (req: AuthRequest, res) => {
  res.json({
    firebaseUser: req.user,
    dbUser: req.dbUser,
  });
});

// Update user profile/role
app.post('/api/users/profile', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { role, name } = req.body;
    if (!role) {
      return res.status(400).json({ error: 'Nível de permissão é obrigatório.' });
    }
    const updatedUser = await db.update(users)
      .set({ 
        role, 
        name: name || req.dbUser?.name || 'Membro Clínico'
      })
      .where(eq(users.uid, req.user!.uid))
      .returning();
    res.json(updatedUser[0]);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao atualizar perfil do usuário', details: error.message });
  }
});

// --------------------- PATIENTS (PACIENTES) ------------------
app.get('/api/patients', requireAuth, async (req, res) => {
  try {
    const list = await db.select().from(patients).orderBy(desc(patients.createdAt));
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao listar pacientes', details: error.message });
  }
});

app.post('/api/patients', requireAuth, async (req, res) => {
  try {
    const { name, email, phone, birthDate, cpf, address, notes } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ error: 'Nome e Telefone são campos obrigatórios.' });
    }
    const result = await db.insert(patients).values({
      name,
      email,
      phone,
      birthDate,
      cpf,
      address,
      notes,
    }).returning();
    res.status(210).json(result[0]);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao cadastrar paciente', details: error.message });
  }
});

app.put('/api/patients/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, birthDate, cpf, address, notes } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ error: 'Nome e Telefone são obrigatórios.' });
    }
    const result = await db.update(patients).set({
      name,
      email,
      phone,
      birthDate,
      cpf,
      address,
      notes,
    }).where(eq(patients.id, parseInt(id))).returning();
    res.json(result[0]);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao atualizar paciente', details: error.message });
  }
});

app.delete('/api/patients/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(patients).where(eq(patients.id, parseInt(id)));
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao remover paciente', details: error.message });
  }
});

// -------------------- THERAPISTS (TERAPEUTAS) -----------------
app.get('/api/therapists', requireAuth, async (req, res) => {
  try {
    const list = await db.select().from(therapists).orderBy(asc(therapists.name));
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao listar terapeutas', details: error.message });
  }
});

app.post('/api/therapists', requireAuth, async (req, res) => {
  try {
    const { name, email, phone, specialty, registryNumber, active } = req.body;
    if (!name || !email || !specialty) {
      return res.status(400).json({ error: 'Nome, E-mail e Especialidade são obrigatórios.' });
    }
    const result = await db.insert(therapists).values({
      name,
      email,
      phone,
      specialty,
      registryNumber,
      active: active !== undefined ? active : true,
    }).returning();
    res.status(210).json(result[0]);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao cadastrar terapeuta', details: error.message });
  }
});

app.put('/api/therapists/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, specialty, registryNumber, active } = req.body;
    const result = await db.update(therapists).set({
      name,
      email,
      phone,
      specialty,
      registryNumber,
      active: active !== undefined ? active : true,
    }).where(eq(therapists.id, parseInt(id))).returning();
    res.json(result[0]);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao atualizar terapeuta', details: error.message });
  }
});

app.delete('/api/therapists/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(therapists).where(eq(therapists.id, parseInt(id)));
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao deletar terapeuta', details: error.message });
  }
});


// --------------------- EMPLOYEES (FUNCIONÁRIOS) --------------
app.get('/api/employees', requireAuth, async (req, res) => {
  try {
    const list = await db.select().from(employees).orderBy(asc(employees.name));
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao listar funcionários', details: error.message });
  }
});

app.post('/api/employees', requireAuth, async (req, res) => {
  try {
    const { name, email, phone, role } = req.body;
    if (!name || !role) {
      return res.status(400).json({ error: 'Nome e Cargo são obrigatórios.' });
    }
    const result = await db.insert(employees).values({
      name,
      email,
      phone,
      role,
    }).returning();
    res.status(210).json(result[0]);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao cadastrar funcionário', details: error.message });
  }
});

app.put('/api/employees/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role } = req.body;
    const result = await db.update(employees).set({
      name,
      email,
      phone,
      role,
    }).where(eq(employees.id, parseInt(id))).returning();
    res.json(result[0]);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao atualizar funcionário', details: error.message });
  }
});

app.delete('/api/employees/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(employees).where(eq(employees.id, parseInt(id)));
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao remover funcionário', details: error.message });
  }
});


// -------------------- THERAPIES (TERAPIAS) -------------------
app.get('/api/therapies', requireAuth, async (req, res) => {
  try {
    const list = await db.select().from(therapies).orderBy(asc(therapies.name));
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao listar terapias', details: error.message });
  }
});

app.post('/api/therapies', requireAuth, async (req, res) => {
  try {
    const { name, description, durationMinutes, price, active } = req.body;
    if (!name || !durationMinutes || price === undefined) {
      return res.status(400).json({ error: 'Nome, Duração e Preço são obrigatórios.' });
    }
    const result = await db.insert(therapies).values({
      name,
      description,
      durationMinutes: parseInt(durationMinutes),
      price: parseInt(price),
      active: active !== undefined ? active : true,
    }).returning();
    res.status(210).json(result[0]);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao cadastrar terapia', details: error.message });
  }
});

app.put('/api/therapies/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, durationMinutes, price, active } = req.body;
    const result = await db.update(therapies).set({
      name,
      description,
      durationMinutes: durationMinutes ? parseInt(durationMinutes) : undefined,
      price: price !== undefined ? parseInt(price) : undefined,
      active: active !== undefined ? active : true,
    }).where(eq(therapies.id, parseInt(id))).returning();
    res.json(result[0]);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao editar terapia', details: error.message });
  }
});

app.delete('/api/therapies/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(therapies).where(eq(therapies.id, parseInt(id)));
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao remover terapia', details: error.message });
  }
});


// ---------------- DYNAMIC APPOINTMENTS (AGENDAMENTOS) --------
app.get('/api/appointments', requireAuth, async (req, res) => {
  try {
    const list = await db.query.appointments.findMany({
      with: {
        patient: true,
        therapist: true,
        therapy: true,
      },
      orderBy: [desc(appointments.appointmentDate), desc(appointments.appointmentTime)],
    });
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao consultar agendamentos', details: error.message });
  }
});

app.post('/api/appointments', requireAuth, async (req, res) => {
  try {
    const { patientId, therapistId, therapyId, appointmentDate, appointmentTime, notes } = req.body;
    
    if (!patientId || !therapistId || !therapyId || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ error: 'Paciente, Terapeuta, Terapia, Data e Hora são obrigatórios.' });
    }

    // --- AGENDAMENTO INTELIGENTE (Collision Detection) ---
    // Check if therapist is already booked on this exact date/time
    const existing = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.therapistId, parseInt(therapistId)),
          eq(appointments.appointmentDate, appointmentDate),
          eq(appointments.appointmentTime, appointmentTime),
          ne(appointments.status, 'cancelled')
        )
      );

    if (existing.length > 0) {
      return res.status(409).json({
        error: 'Conflito de Agenda',
        message: 'Este terapeuta já possui um agendamento confirmado neste mesmo dia e horário!',
      });
    }

    // Insert appointment
    const result = await db.insert(appointments).values({
      patientId: parseInt(patientId),
      therapistId: parseInt(therapistId),
      therapyId: parseInt(therapyId),
      appointmentDate,
      appointmentTime,
      notes,
      status: 'scheduled',
    }).returning();

    // Query full details to send back and simulate notification
    const fullAppointment = await db.query.appointments.findFirst({
      where: eq(appointments.id, result[0].id),
      with: {
        patient: true,
        therapist: true,
        therapy: true,
      }
    });

    res.status(210).json(fullAppointment);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao salvar agendamento', details: error.message });
  }
});

// Update appointment state (Completing or Cancelling)
app.put('/api/appointments/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const current = await db.query.appointments.findFirst({
      where: eq(appointments.id, parseInt(id)),
      with: {
        patient: true,
        therapy: true,
      }
    });

    if (!current) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    const updated = await db.update(appointments).set({
      status,
      notes: remarks || current.notes,
    }).where(eq(appointments.id, parseInt(id))).returning();

    // If completed, automatically register in Cash Flow as income if not already created
    if (status === 'completed') {
      const existingTx = await db.select().from(cashFlow).where(eq(cashFlow.appointmentId, parseInt(id)));
      if (existingTx.length === 0) {
        await db.insert(cashFlow).values({
          type: 'income',
          category: 'Sessão de Terapia',
          description: `Sessão de ${current.therapy.name} - Paciente: ${current.patient.name}`,
          amount: current.therapy.price,
          date: current.appointmentDate,
          paymentMethod: 'Pix', // default for quick logs
          appointmentId: current.id,
        });
      }
    }

    res.json(updated[0]);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao atualizar agendamento', details: error.message });
  }
});

// Trigger Simulated WhatsApp Notification
app.post('/api/appointments/:id/notify', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const appt = await db.query.appointments.findFirst({
      where: eq(appointments.id, parseInt(id)),
      with: {
        patient: true,
        therapist: true,
        therapy: true,
      }
    });

    if (!appt) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    // Format WhatsApp confirmation text
    const message = `Olá, *${appt.patient.name}*! Lembramos de seu agendamento de *${appt.therapy.name}* com o terapeuta *${appt.therapist.name}* marcado para dia *${appt.appointmentDate.split('-').reverse().join('/')}* às *${appt.appointmentTime}*. Caso precise desmarcar, avise com antecedência. Nos vemos em breve! ✨`;

    // Mark as notified
    await db.update(appointments).set({
      whatsappSentAt: new Date(),
    }).where(eq(appointments.id, appt.id));

    res.json({
      success: true,
      recipient: appt.patient.phone,
      message,
      sentAt: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao enviar notificação', details: error.message });
  }
});

// Simulate a Patient's reply via WhatsApp text message (updates appointment state dynamically)
app.post('/api/appointments/:id/reply', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body; // e.g. "SIM" or "NÃO"

    if (!text) {
      return res.status(400).json({ error: 'Texto da resposta é obrigatório.' });
    }

    const appt = await db.query.appointments.findFirst({
      where: eq(appointments.id, parseInt(id)),
      with: {
        patient: true,
        therapy: true,
        therapist: true,
      }
    });

    if (!appt) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    let updatedStatus = appt.status;
    let observationAddNote = "";

    const userText = text.toUpperCase().trim();
    if (userText === 'SIM' || userText.includes('CONFIRMAR') || userText.includes('QUERO') || userText.includes('SIM, CONFIRMO') || userText === '1') {
      updatedStatus = 'confirmed';
      observationAddNote = "Presença de consulta CONFIRMADA via resposta do WhatsApp.";
    } else if (userText === 'NÃO' || userText === 'NAO' || userText.includes('CANCEL') || userText.includes('NÃO CONSIGO') || userText === '2') {
      updatedStatus = 'cancelled';
      observationAddNote = "Consulta CANCELADA por solicitação do paciente via WhatsApp.";
    } else {
      observationAddNote = `Mensagem recebida via WhatsApp: "${text}"`;
    }

    const updatedNotes = appt.notes 
      ? `${appt.notes}\n[SISTEMA]: ${observationAddNote}`
      : `[SISTEMA]: ${observationAddNote}`;

    await db.update(appointments).set({
      status: updatedStatus,
      notes: updatedNotes,
    }).where(eq(appointments.id, appt.id));

    res.json({
      success: true,
      recipient: appt.patient.phone,
      replyText: text,
      status: updatedStatus,
      notes: updatedNotes,
      sentAt: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao interpretar resposta do paciente', details: error.message });
  }
});


// ------------------- PRONTUÁRIOS ELETRÔNICOS -----------------
app.get('/api/health-records', requireAuth, async (req, res) => {
  try {
    const list = await db.query.healthRecords.findMany({
      with: {
        patient: true,
        therapist: true,
      },
      orderBy: [desc(healthRecords.createdAt)],
    });
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao consultar prontuários', details: error.message });
  }
});

// Get health records for a specific patient
app.get('/api/patients/:patientId/health-records', requireAuth, async (req, res) => {
  try {
    const { patientId } = req.params;
    const records = await db.query.healthRecords.findMany({
      where: eq(healthRecords.patientId, parseInt(patientId)),
      with: {
        therapist: true,
      },
      orderBy: [desc(healthRecords.createdAt)],
    });
    res.json(records);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao resgatar histórico', details: error.message });
  }
});

// Create draft using Gemini AI integration
app.post('/api/health-records/draft', requireAuth, async (req, res) => {
  try {
    const { patientName, therapyName, symptoms } = req.body;
    if (!patientName || !therapyName || !symptoms) {
      return res.status(400).json({ error: 'Nome do Paciente, Terapia e Sintomas são obrigatórios para a sugestão de IA.' });
    }

    const suggestions = await draftEvolutionAndRecommendations(
      patientName,
      therapyName,
      symptoms
    );

    res.json(suggestions);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao formular rascunho com IA', details: error.message });
  }
});

// Create draft prescription using Gemini AI integration (Holistic Prescription Assistant)
app.post('/api/prescriptions/draft', requireAuth, async (req, res) => {
  try {
    const { patientName, therapyType, symptoms } = req.body;
    if (!patientName || !therapyType || !symptoms) {
      return res.status(400).json({ error: 'Nome do Paciente, Tipo de Terapia/Preferência e Sintomas são obrigatórios.' });
    }

    const suggestions = await draftHolisticPrescription(
      patientName,
      therapyType,
      symptoms
    );

    res.json(suggestions);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao criar prescrição com IA', details: error.message });
  }
});

// Save final health record
app.post('/api/health-records', requireAuth, async (req, res) => {
  try {
    const { patientId, therapistId, appointmentId, date, symptoms, evolution, recommendations, signature } = req.body;
    if (!patientId || !therapistId || !date || !symptoms || !evolution) {
      return res.status(400).json({ error: 'Paciente, Terapeuta, Data, Queixas e Evolução são obrigatórios.' });
    }

    const record = await db.insert(healthRecords).values({
      patientId: parseInt(patientId),
      therapistId: parseInt(therapistId),
      appointmentId: appointmentId ? parseInt(appointmentId) : null,
      date,
      symptoms,
      evolution,
      recommendations,
      signature,
    }).returning();

    res.status(210).json(record[0]);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao salvar prontuário', details: error.message });
  }
});


// ------------------- ANAMNESES HOLÍSTICAS MULTIDIMENSIONAIS ----
app.get('/api/anamneses', requireAuth, async (req, res) => {
  try {
    const list = await db.query.anamneses.findMany({
      with: {
        patient: true,
        therapist: true,
      },
      orderBy: [desc(anamneses.createdAt)],
    });
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao consultar fichas de anamnese', details: error.message });
  }
});

app.get('/api/patients/:patientId/anamneses', requireAuth, async (req, res) => {
  try {
    const { patientId } = req.params;
    const records = await db.query.anamneses.findMany({
      where: eq(anamneses.patientId, parseInt(patientId)),
      with: {
        therapist: true,
      },
      orderBy: [desc(anamneses.createdAt)],
    });
    res.json(records);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao resgatar histórico de anamneses', details: error.message });
  }
});

app.post('/api/anamneses/analyze', requireAuth, async (req, res) => {
  try {
    const { patientName, data } = req.body;
    if (!patientName || !data || !data.physicalSymptoms) {
      return res.status(400).json({ error: 'Nome do Paciente e Diagnóstico de Sintomas Físicos são obrigatórios.' });
    }

    const analysis = await draftHolisticAnamnesisAnalysis(patientName, data);
    res.json(analysis);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao formular análise holística com IA', details: error.message });
  }
});

app.post('/api/anamneses', requireAuth, async (req, res) => {
  try {
    const {
      patientId,
      therapistId,
      date,
      physicalSymptoms,
      sleepPattern,
      dietHydration,
      energyLevel,
      emotionalState,
      mentalStressor,
      pastTraumas,
      energeticChakras,
      vibeAura,
      spiritualBeliefs,
      familyPatterns,
      relationships,
      therapeuticPlan,
      notes,
      aiAnalysis,
      signature,
    } = req.body;

    if (!patientId || !therapistId || !date || !physicalSymptoms) {
      return res.status(400).json({ error: 'Paciente, Terapeuta, Data e Queixas Físicas são obrigatórios.' });
    }

    const record = await db.insert(anamneses).values({
      patientId: parseInt(patientId),
      therapistId: parseInt(therapistId),
      date,
      physicalSymptoms,
      sleepPattern,
      dietHydration,
      energyLevel,
      emotionalState,
      mentalStressor,
      pastTraumas,
      energeticChakras,
      vibeAura,
      spiritualBeliefs,
      familyPatterns,
      relationships,
      therapeuticPlan,
      notes,
      aiAnalysis,
      signature: signature || 'Assinado eletronicamente',
    }).returning();

    res.status(210).json(record[0]);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao salvar ficha de anamnese', details: error.message });
  }
});

app.put('/api/anamneses/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      patientId,
      therapistId,
      date,
      physicalSymptoms,
      sleepPattern,
      dietHydration,
      energyLevel,
      emotionalState,
      mentalStressor,
      pastTraumas,
      energeticChakras,
      vibeAura,
      spiritualBeliefs,
      familyPatterns,
      relationships,
      therapeuticPlan,
      notes,
      aiAnalysis,
      signature,
    } = req.body;

    const result = await db.update(anamneses).set({
      patientId: patientId ? parseInt(patientId) : undefined,
      therapistId: therapistId ? parseInt(therapistId) : undefined,
      date,
      physicalSymptoms,
      sleepPattern,
      dietHydration,
      energyLevel,
      emotionalState,
      mentalStressor,
      pastTraumas,
      energeticChakras,
      vibeAura,
      spiritualBeliefs,
      familyPatterns,
      relationships,
      therapeuticPlan,
      notes,
      aiAnalysis,
      signature,
    }).where(eq(anamneses.id, parseInt(id))).returning();

    res.json(result[0]);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao atualizar ficha de anamnese', details: error.message });
  }
});

app.delete('/api/anamneses/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(anamneses).where(eq(anamneses.id, parseInt(id)));
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao remover ficha de anamnese', details: error.message });
  }
});


// ------------------- CONFIGURAÇÕES DA CLÍNICA (SETUP/INSTALAÇÃO) ----------
app.get('/api/clinic', async (req, res) => {
  try {
    const settingsList = await db.select().from(clinicSettings).limit(1);
    if (settingsList.length > 0) {
      res.json(settingsList[0]);
    } else {
      // Configuração padrão placeholder quando ainda não instalado/configurado
      res.json({
        id: 0,
        clinicName: 'Clínica de Terapias Integrativas',
        cnpj: '',
        phone: '(00) 00000-0000',
        email: '',
        address: '',
        accentColor: '#D4AF37',
        welcomeMessage: 'Bem-vindo ao Espaço de Harmonia',
        logoUrl: '',
        isConfigured: false
      });
    }
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao carregar configurações da clínica', details: error.message });
  }
});

app.post('/api/clinic', requireAuth, async (req, res) => {
  try {
    const {
      clinicName,
      cnpj,
      phone,
      email,
      address,
      accentColor,
      welcomeMessage,
      logoUrl,
    } = req.body;

    if (!clinicName || !phone) {
      return res.status(400).json({ error: 'Nome da Clínica e Telefone são campos obrigatórios para instalação.' });
    }

    const settingsList = await db.select().from(clinicSettings).limit(1);

    if (settingsList.length > 0) {
      const updated = await db.update(clinicSettings).set({
        clinicName,
        cnpj,
        phone,
        email,
        address,
        accentColor,
        welcomeMessage,
        logoUrl,
        isConfigured: true,
      }).where(eq(clinicSettings.id, settingsList[0].id)).returning();
      res.json(updated[0]);
    } else {
      const inserted = await db.insert(clinicSettings).values({
        clinicName,
        cnpj,
        phone,
        email,
        address,
        accentColor: accentColor || '#D4AF37',
        welcomeMessage,
        logoUrl,
        isConfigured: true,
      }).returning();
      res.json(inserted[0]);
    }
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao salvar configuração da clínica', details: error.message });
  }
});


// --------------------- FLUXO DE CAIXA (CASH FLOW) ------------
app.get('/api/cash-flow', requireAuth, async (req, res) => {
  try {
    const list = await db.select().from(cashFlow).orderBy(desc(cashFlow.date));
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao consultar fluxo de caixa', details: error.message });
  }
});

app.post('/api/cash-flow', requireAuth, async (req, res) => {
  try {
    const { type, category, description, amount, date, paymentMethod } = req.body;
    if (!type || !category || !description || amount === undefined || !date) {
      return res.status(400).json({ error: 'Tipo, Categoria, Descrição, Valor e Data são obrigatórios.' });
    }
    const result = await db.insert(cashFlow).values({
      type,
      category,
      description,
      amount: parseInt(amount),
      date,
      paymentMethod,
    }).returning();
    res.status(210).json(result[0]);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao registrar movimentação financeira', details: error.message });
  }
});

// --------------------- INVENTORY (ESTOQUE) -------------------
app.get('/api/inventory', requireAuth, async (req, res) => {
  try {
    const list = await db.select().from(inventory).orderBy(asc(inventory.name));
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao listar estoque', details: error.message });
  }
});

app.post('/api/inventory', requireAuth, async (req, res) => {
  try {
    const { name, category, quantity, minQuantity, unit } = req.body;
    if (!name || !category || quantity === undefined || minQuantity === undefined || !unit) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }
    const result = await db.insert(inventory).values({
      name,
      category,
      quantity: parseInt(quantity),
      minQuantity: parseInt(minQuantity),
      unit,
    }).returning();
    res.status(210).json(result[0]);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao cadastrar item no estoque', details: error.message });
  }
});

app.put('/api/inventory/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const result = await db.update(inventory).set({
      quantity: parseInt(quantity),
    }).where(eq(inventory.id, parseInt(id))).returning();
    res.json(result[0]);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao atualizar item no estoque', details: error.message });
  }
});

app.delete('/api/inventory/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(inventory).where(eq(inventory.id, parseInt(id)));
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao remover item do estoque', details: error.message });
  }
});

// --------------------- QUICK NOTES -------------------
app.get('/api/quick-notes/:patientId', requireAuth, async (req, res) => {
  try {
    const { patientId } = req.params;
    const list = await db.select().from(quickNotes).where(eq(quickNotes.patientId, parseInt(patientId))).orderBy(desc(quickNotes.createdAt));
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao listar notas rápidas', details: error.message });
  }
});

app.post('/api/quick-notes', requireAuth, async (req, res) => {
  try {
    const { patientId, content } = req.body;
    if (!patientId || !content) {
      return res.status(400).json({ error: 'Paciente e conteúdo são obrigatórios.' });
    }
    const result = await db.insert(quickNotes).values({
      patientId: parseInt(patientId),
      content,
    }).returning();
    res.status(210).json(result[0]);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao salvar nota rápida', details: error.message });
  }
});

// -------------------- MAIN DASHBOARD STATS -------------------
app.get('/api/dashboard-stats', requireAuth, async (req, res) => {
  try {
    // 1. Total counts
    const patientsCount = await db.select({ count: sql`count(*)` }).from(patients);
    const therapistsCount = await db.select({ count: sql`count(*)` }).from(therapists);
    const apptsCount = await db.select({ count: sql`count(*)` }).from(appointments);

    // 2. Financial calculation
    const allCashFlow = await db.select().from(cashFlow);
    let totalInflow = 0;
    let totalOutflow = 0;

    allCashFlow.forEach((item) => {
      if (item.type === 'income') {
        totalInflow += item.amount;
      } else {
        totalOutflow += item.amount;
      }
    });

    const netBalance = totalInflow - totalOutflow;

    // 3. Appointments stats (upcoming, completed, cancelled)
    const activeAppts = await db.query.appointments.findMany({
      limit: 10,
      with: {
        patient: true,
        therapy: true,
        therapist: true,
      },
      orderBy: [desc(appointments.appointmentDate), desc(appointments.appointmentTime)]
    });

    res.json({
      patientsCount: patientsCount[0]?.count || 0,
      therapistsCount: therapistsCount[0]?.count || 0,
      appointmentsCount: apptsCount[0]?.count || 0,
      totalInflow,
      totalOutflow,
      netBalance,
      latestAppointments: activeAppts,
      transactionsCount: allCashFlow.length,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao buscar métricas do dashboard', details: error.message });
  }
});

// -------------------------------------------------------------
// VITE AND STATIC SERVING MIDDLEWARE
// -------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Clinic Server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
