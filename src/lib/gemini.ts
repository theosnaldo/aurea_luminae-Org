import { GoogleGenAI, Type } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      aiInstance = new GoogleGenAI({ 
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    } else {
      console.warn("GEMINI_API_KEY not set in environment. AI features will be disabled.");
    }
  }
  return aiInstance;
}

/**
 * Drafts therapeutic evolution / notes and recommendations based on symptoms and therapy.
 */
export async function draftEvolutionAndRecommendations(
  patientName: string,
  typeName: string,
  symptoms: string,
  previousEvolution?: string
): Promise<{ evolution: string; recommendations: string }> {
  const ai = getAIClient();
  if (!ai) {
    return {
      evolution: `Acompanhamento para os sintomas apresentados: "${symptoms}". Paciente relata bem estar no final da sessão.`,
      recommendations: "Recomenda-se manter as práticas orientadas e nova sessão em 7-15 dias.",
    };
  }

  const prompt = `Você é um terapeuta integrativo sênior formulando prontuários de terapias alternativas (como Reiki, Acupuntura, Florais de Bach, Cromoterapia, etc.).
Paciente: ${patientName}
Terapia Aplicada: ${typeName}
Sintomas Relatados: ${symptoms}
Evolução Anterior (opcional): ${previousEvolution || "Sem histórico anterior."}

Por favor, elabore duas informações cruciais para o prontuário eletrônico em PORTUGUÊS:
1. Evolução Clínica: Uma descrição profissional e compassiva de como a sessão se desenrolou, a resposta do paciente, canais energéticos trabalhados ou pontos estimulados, e progresso emocional ou físico.
2. Recomendações Terapêuticas: Recomendações pós-sessão de auto-cuidado, hábitos ou formulações integrativas.

Retorne a resposta EXCLUSIVAMENTE em formato JSON com a seguinte estrutura:
{
  "evolution": "texto detalhado da evolução aqui...",
  "recommendations": "texto detalhado das recomendações pós-consulta..."
}
NÃO use blocos de código markdown ou texto extra, envie apenas o objeto JSON puro de forma que possa ser parseado diretamente.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text?.trim() || "";
    const parsed = JSON.parse(text);
    return {
      evolution: parsed.evolution || "",
      recommendations: parsed.recommendations || "",
    };
  } catch (error) {
    console.error("Error generating therapeutic suggestions via Gemini:", error);
    return {
      evolution: `Sessão de ${typeName} realizada com foco em: ${symptoms}. Fluxo energético reorganizado, paciente relata alívio das tensões e serenidade.`,
      recommendations: "Recomendar hidratação, repouso físico e mental nas próximas 24 horas. Retorno em breve.",
    };
  }
}

/**
 * Drafts therapeutic prescriptions with structured items based on symptoms & preferred therapies.
 */
export async function draftHolisticPrescription(
  patientName: string,
  therapyType: string,
  symptoms: string
): Promise<{ items: { type: string; name: string; instructions: string; duration: string }[]; observations: string }> {
  const ai = getAIClient();
  if (!ai) {
    return {
      items: [
        {
          type: "Floral de Bach",
          name: "Rescue Remedy (Para ansiedade imediata)",
          instructions: "Tomar 4 gotas sublinguais, 4 vezes ao dia.",
          duration: "30 dias"
        }
      ],
      observations: "Recomenda-se hidratação abundante, escalda-pés morno com sal grosso e lavanda antes de dormir."
    };
  }

  const prompt = `Você é um terapeuta integrativo sênior experiente e compassivo.
Paciente: ${patientName}
Modalidades Preferenciais/Sugestão: ${therapyType}
Queixas principais & Sintomas a tratar: ${symptoms}

Por favor, crie uma prescrição holística/receita integrativa altamente especializada em PORTUGUÊS. 
Personalize as fórmulas de infusões, óleos essenciais, florais de Bach, fitoterápicos ou suplementos mais assertivos para os sintomas trazidos pelo paciente.
Foque na usabilidade prática, carinho no tratamento e rigurosidade técnica não-alopática.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            items: {
              type: Type.ARRAY,
              description: "Lista de fórmulas ecológicas e naturais sugeridas para equilibrar o paciente.",
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { 
                    type: Type.STRING, 
                    description: "Tipos aceitos: 'Floral de Bach', 'Fitoterápico', 'Suplemento Alimentar', 'Aromaterapia', 'Recomendação Geral' ou 'Outro'" 
                  },
                  name: { 
                    type: Type.STRING, 
                    description: "Nome completo do floral, fitoterápico, óleo essencial ou composto natural (ex: 'Floral de Bach (Mimulus + Aspen + White Chestnut) para medos e insônia')" 
                  },
                  instructions: { 
                    type: Type.STRING, 
                    description: "Instruções exatas de dosagem e horários (ex: 'Inalar 3 gotas do colar difusor pessoal pela manhã', ou 'Ingerir 4 gotas 4x ao dia')" 
                  },
                  duration: { 
                    type: Type.STRING, 
                    description: "Duração recomendada, ex: '30 dias', '60 dias', 'Uso contínuo'" 
                  }
                },
                required: ["type", "name", "instructions", "duration"]
              }
            },
            observations: {
              type: Type.STRING,
              description: "Orientações gerais de estilo de vida, hábitos, rituais de auto-cuidado recomendados para complementar o tratamento."
            }
          },
          required: ["items", "observations"]
        }
      }
    });

    const text = response.text?.trim() || "";
    const parsed = JSON.parse(text);
    return {
      items: parsed.items || [],
      observations: parsed.observations || ""
    };
  } catch (error) {
    console.error("Error generating prescription suggestions via Gemini:", error);
    return {
      items: [
        {
          type: "Recomendação Geral",
          name: "Chá de Passiflora com Camomila e Melissa",
          instructions: "Preparar por infusão 1 xícara de chá 1h antes de deitar e tomar ainda morno.",
          duration: "Uso contínuo"
        }
      ],
      observations: `Sugestões baseadas nas queixas de "${symptoms}". Recomendamos repouso, meditação guiada diária e respiração diafragmática.`
    };
  }
}

/**
 * Drafts MD Holistic Anamnesis multi-dimensional insights
 */
export async function draftHolisticAnamnesisAnalysis(
  patientName: string,
  data: {
    physicalSymptoms: string;
    sleepPattern?: string;
    dietHydration?: string;
    energyLevel?: string;
    emotionalState?: string;
    mentalStressor?: string;
    pastTraumas?: string;
    energeticChakras?: string;
    vibeAura?: string;
    spiritualBeliefs?: string;
    familyPatterns?: string;
    relationships?: string;
  }
): Promise<{
  somatization: string;
  chakrasAndAura: string;
  systemicInsights: string;
  treatmentPlanSuggestions: string;
}> {
  const ai = getAIClient();
  if (!ai) {
    return {
      somatization: "Análise indisponível no momento. É salutar observar o reflexo de dores físicas no chakra plexo solar e cardíaco devido aos pontos de estresse emocional.",
      chakrasAndAura: "Vibração basal em reajuste. Recomendado alinhamento com cristais verdes (quartzo verde) para o coração e azuis (cianita azul) para a expressão.",
      systemicInsights: "Comportamentos auto-exigentes podem estar linkados a lealdades invisíveis do clã familiar materno.",
      treatmentPlanSuggestions: "Iniciar ciclo floral Rescue por 14 dias combinando meditação ativa de respiração da presença."
    };
  }

  const prompt = `Você é um terapeuta holístico, curador sutil e constelador sistêmico sênior extremamente experiente.
Analise a ficha de Anamnese Holística Multidimensional para o seguinte cliente:

Nome do Paciente: ${patientName}

=== DIMENSÕES COLETADAS ===
1. Dimensão Física:
- Sintomas Físicos / Dores: ${data.physicalSymptoms}
- Sono e Melatonina natural: ${data.sleepPattern || "Não relatado"}
- Alimentação e Hidratação: ${data.dietHydration || "Não relatado"}
- Nível de Vitalidade / Energia vital: ${data.energyLevel || "Não relatado"}

2. Dimensão Mental/Emocional:
- Sentimentos e Humor predominante: ${data.emotionalState || "Não relatado"}
- Estressores Mentais e Ruminação: ${data.mentalStressor || "Não relatado"}
- Experiências marcantes / Traumas informados: ${data.pastTraumas || "Não relatado"}

3. Dimensão Bioenergética/Espiritual:
- Sensação Energética / Chakras percebidos: ${data.energeticChakras || "Não relatado"}
- Aura e Sensibilidade Sutil: ${data.vibeAura || "Não relatado"}
- Crenças e Práticas de Conexão: ${data.spiritualBeliefs || "Não relatado"}

4. Dimensão Sistêmica/Familiar:
- Repetições de clã / Padrões familiares: ${data.familyPatterns || "Não relatado"}
- Dinâmica de Relacionamentos: ${data.relationships || "Não relatado"}

Sua tarefa é elaborar um laudo de Análise Holística Multidimensional em PORTUGUÊS com profunda sensatez, linguagem acolhedora, sensível e clinicamente fundamentada em conceitos como a metafísica da saúde, psicosubjetividade, chakras/meridianos (Medicina Tradicional Chinesa e Ayurvédica) e Constelação Familiar (Bert Hellinger). 

Por favor, gere 4 seções estruturadas no JSON de retorno:
1. "somatization": Somatização Física-Emocional. Explique brevemente como os sintomas físicos se correlacionam com as tensões mentais e emocionais sob a ótica da Metafísica da Saúde.
2. "chakrasAndAura": Diagnóstico dos Corpos Sutis & Chakras. Identifique quais centros energéticos (chakras) mostram maior necessidade de atenção com base nos relatos físicos/emocionais/energéticos, sugerindo gemas/cristais ou cores de reposição.
3. "systemicInsights": Percepções Sistêmicas e Familiares. Analise se há indícios de emaranhamentos, auto-sabotagem por lealdade familiar inconsciente ou padrões repetitivos que se manifestam nas relações e sintomas.
4. "treatmentPlanSuggestions": Recomendações e Práticas Integrativas. Sugira práticas diárias de auto-cura, exercícios respiratórios (Pranayama), ervas para banho/infusão, frequências sonoras ou florais de Bach adequados.

Retorne EXCLUSIVAMENTE a estrutura em formato JSON válida indicada abaixo:
{
  "somatization": "conteúdo descritivo",
  "chakrasAndAura": "conteúdo descritivo",
  "systemicInsights": "conteúdo descritivo",
  "treatmentPlanSuggestions": "conteúdo descritivo"
}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            somatization: { type: Type.STRING },
            chakrasAndAura: { type: Type.STRING },
            systemicInsights: { type: Type.STRING },
            treatmentPlanSuggestions: { type: Type.STRING }
          },
          required: ["somatization", "chakrasAndAura", "systemicInsights", "treatmentPlanSuggestions"]
        }
      }
    });

    const text = response.text?.trim() || "";
    return JSON.parse(text);
  } catch (err) {
    console.error("Error drafting holistic anamnesis analysis via Gemini:", err);
    return {
      somatization: "A análise física e emocional aponta para o acúmulo de tensões musculares correlacionadas a pressões do cotidiano, indicando que o corpo expressa o silenciamento das emoções.",
      chakrasAndAura: "Desequilíbrio secundário no Chakra Laríngeo (expressão bloqueada) e no Chakra Cardíaco (sentimentos retidos). Essencial terapia de som tibetana ou cromoterapia azul/verde.",
      systemicInsights: "Comportamentos repetitivos sugerem uma busca inconsciente por pertencer, honrando dificuldades antepassadas por meio da sobrecarga diária.",
      treatmentPlanSuggestions: "Recomendado escalda-pés com sais estimulantes e alecrim, meditações diárias de atenção plena (Mindfulness) e uso de óleos essenciais de lavanda no travesseiro."
    };
  }
}

