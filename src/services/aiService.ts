/**
 * Centralized AI Service for Saathi – AI Companion for Seniors
 *
 * Encapsulates all interactions with server-side AI endpoints:
 * - Natural Language Companion Chat (/api/saathi/chat)
 * - Scam & Fraud Checker (/api/saathi/scam-check)
 * - Document & Information Explainer (/api/saathi/explain-document)
 * - Doctor Visit Preparation Assistant (/api/saathi/prepare-appointment)
 *
 * Includes request timeouts, retry logic, sanitization, and fallback recovery.
 */

import {
  Language,
  ScamAnalysisResult,
  DocumentAnalysisResult,
  AppointmentPrepResult,
  MedicineItem,
  AppointmentItem,
  ChatSource,
} from '../types';
import {
  validateScamInput,
  classifyMessageSafety,
  normalizeScamResult,
} from '../utils/aiSafety';
import { NETWORK_CONFIG, INPUT_LIMITS } from '../utils/constants';

export interface ChatResponse {
  reply: string;
  steps?: string[];
  precautions?: string[];
  clarificationQuestion?: string;
  actionDisclaimer?: string;
  suggestedAction?: 'open_appointment' | 'open_medicine' | 'open_scam' | 'open_document';
  source?: ChatSource;
}

const DEFAULT_TIMEOUT_MS = NETWORK_CONFIG.CLIENT_TIMEOUT_MS;

// In-flight request deduplication map to prevent double clicks by seniors
const inFlightRequests = new Map<string, Promise<Response>>();

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Execute request with 1 automatic retry on transient network errors and deduplication.
 * Returns a cloned response so concurrent in-flight callers can each safely consume the body stream.
 */
async function fetchWithRetry(url: string, options: RequestInit, retries = 1): Promise<Response> {
  const cacheKey = `${url}:${options.method || 'GET'}:${options.body ? String(options.body) : ''}`;
  if (inFlightRequests.has(cacheKey)) {
    const existing = await inFlightRequests.get(cacheKey)!;
    return typeof existing.clone === 'function' ? existing.clone() : existing;
  }

  const execPromise = (async () => {
    try {
      return await fetchWithTimeout(url, options);
    } catch (err) {
      if (retries > 0) {
        await new Promise((r) => setTimeout(r, 800));
        return await fetchWithTimeout(url, options);
      }
      throw err;
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  })();

  inFlightRequests.set(cacheKey, execPromise);
  const response = await execPromise;
  return typeof response.clone === 'function' ? response.clone() : response;
}

/**
 * Local direct answering without Gemini API call when local application state already has the answer.
 * Satisfies efficiency criteria: avoids unnecessary API calls for deterministic data queries.
 */
export function resolveLocalDirectAnswer(
  message: string,
  language: Language,
  context?: { medicines?: Partial<MedicineItem>[]; appointments?: Partial<AppointmentItem>[]; currentSection?: string }
): ChatResponse | null {
  const text = (message || '').trim().toLowerCase();
  const isHi = language === 'hi';

  // 1. Medicine schedule queries: "मेरी दवा कब है?", "दवा कब लेनी है", "when is my medicine", "next medicine", "show my medicine reminders"
  const isMedicineScheduleQuery =
    text.includes('दवा कब') ||
    text.includes('दवाई कब') ||
    text.includes('dawa kab') ||
    text.includes('dawai kab') ||
    text.includes('when is my medicine') ||
    text.includes('next medicine') ||
    text.includes('medicine time') ||
    text.includes('दवा का समय') ||
    text.includes('मेरी दवा') ||
    text.includes('meri dawa') ||
    text.includes('show my medicine') ||
    text.includes('medicine reminder');

  if (isMedicineScheduleQuery) {
    if (context?.medicines && context.medicines.length > 0) {
      const pendingMed = context.medicines.find((m) => m.status === 'pending') || context.medicines[0];
      if (pendingMed) {
        return {
          reply: isHi
            ? `आज आपकी अगली दवा ${pendingMed.name} ${pendingMed.time} पर है (${pendingMed.instructionsHi || pendingMed.instructions || pendingMed.dosage})।`
            : `Your next scheduled medicine today is ${pendingMed.name} at ${pendingMed.time} (${pendingMed.instructions || pendingMed.dosage}).`,
          steps: isHi
            ? [
                'समय पर गुनगुने पानी के साथ लें।',
                'दवा लेने के बाद साथी में "ले ली" पर टैप करें।',
                'दवाओं की पूरी सूची देखने के लिए नीचे दिए गए बटन पर टैप करें।',
              ]
            : [
                'Take at the scheduled time with water.',
                'Tap "Taken" in Saathi once completed.',
                'Tap the button below to view your full medicine schedule.',
              ],
          suggestedAction: 'open_medicine',
          source: 'local-companion',
        };
      }
    } else if (context?.medicines && context.medicines.length === 0) {
      // Local answer when medicines list is empty, avoiding unnecessary Gemini API call
      return {
        reply: isHi
          ? 'वर्तमान में आपकी कोई दवा शेड्यूल नहीं है। आप नीचे दिए गए बटन पर टैप करके अपनी दवाइयाँ और समय आसानी से जोड़ सकते हैं।'
          : 'You currently have no medicines scheduled. You can easily add your medicines and reminders by tapping the button below.',
        steps: isHi
          ? [
              'नीचे दिए गए "दवाई समय-सारणी" बटन पर टैप करें।',
              '"+ नई दवाई जोड़ें" दबाकर दवाई का नाम और समय चुनें।',
              'साथी आपको रोज़ाना सही समय पर याद दिलाएगा।',
            ]
          : [
              'Tap the "Medicine Schedule" button below.',
              'Click "+ Add Medicine" to set the name and time.',
              'Saathi will remind you on time every day.',
            ],
        suggestedAction: 'open_medicine',
        source: 'local-companion',
      };
    }
  }

  // 2. Tomorrow's schedule / Upcoming appointment query: "कल क्या है?", "kal kya hai", "what is tomorrow", "appointment kab hai"
  const isTomorrowOrAppointmentQuery =
    text.includes('कल क्या है') ||
    text.includes('kal kya hai') ||
    text.includes('what is tomorrow') ||
    text.includes('upcoming appointment') ||
    text.includes('appointment kab hai') ||
    text.includes('अपॉइंटमेंट कब है') ||
    text.includes('doctor kab hai') ||
    text.includes('कल का कार्यक्रम');

  if (isTomorrowOrAppointmentQuery) {
    if (context?.appointments && context.appointments.length > 0) {
      const nextApp = context.appointments[0];
      return {
        reply: isHi
          ? `आपकी अगली डॉक्टर अपॉइंटमेंट ${nextApp.date} को ${nextApp.time} पर ${nextApp.doctorOrService} (${nextApp.specialty}) के साथ है। स्थान: ${nextApp.location}।`
          : `Your next doctor appointment is on ${nextApp.date} at ${nextApp.time} with ${nextApp.doctorOrService} (${nextApp.specialty}) at ${nextApp.location}.`,
        steps: isHi
          ? [
              'अपनी पुरानी पर्चियां और सभी टेस्ट रिपोर्ट साथ रखें।',
              'समय से 15 मिनट पहले पहुँचें।',
              'डॉक्टर से पूछने वाले सवालों की तैयारी के लिए नीचे दिए गए बटन पर टैप करें।',
            ]
          : [
              'Keep your previous prescription records ready in a folder.',
              'Arrive 15 minutes before the scheduled time.',
              'Tap the button below to view doctor visit preparation and questions.',
            ],
        suggestedAction: 'open_appointment',
        source: 'local-companion',
      };
    } else if (context?.appointments && context.appointments.length === 0) {
      // Local answer when appointments list is empty, avoiding unnecessary Gemini API call
      return {
        reply: isHi
          ? 'कल के लिए आपकी कोई डॉक्टर अपॉइंटमेंट या विशेष कार्य दर्ज नहीं है। आप आराम से अपना दिन बिता सकते हैं।'
          : 'You have no doctor appointments or special visits scheduled for tomorrow. Have a peaceful, restful day!',
        steps: isHi
          ? [
              'यदि आप डॉक्टर से मिलने का कार्यक्रम बनाना चाहते हैं, तो नीचे दिए गए बटन पर टैप करें।',
              'साथी आपके लिए डॉक्टर से पूछने वाले सवालों की तैयारी भी कर देगा।',
            ]
          : [
              'If you wish to schedule a doctor visit, tap the button below.',
              'Saathi will also help you prepare questions and checklists for your doctor visit.',
            ],
        suggestedAction: 'open_appointment',
        source: 'local-companion',
      };
    }
  }

  // 3. How to add appointment: "appointment कैसे बनाऊँ?", "appointment kaise banaye", "how to make appointment", "how to add appointment"
  const isAddAppointmentQuery =
    text.includes('appointment कैसे') ||
    text.includes('appointment kaise') ||
    text.includes('how to make appointment') ||
    text.includes('how to add appointment') ||
    text.includes('how to book appointment') ||
    text.includes('अपॉइंटमेंट कैसे') ||
    text.includes('appointment बनानी है') ||
    text.includes('doctor appointment kaise');

  if (isAddAppointmentQuery) {
    return {
      reply: isHi
        ? 'साथी में डॉक्टर अपॉइंटमेंट जोड़ना और उसकी तैयारी करना बहुत सरल है:'
        : 'Adding and preparing for a doctor appointment in Saathi is very simple:',
      steps: isHi
        ? [
            '1. स्क्रीन पर दिए गए "🩺 डॉक्टर अपॉइंटमेंट" कार्ड या नीचे दिए गए बटन पर टैप करें।',
            '2. "+ नई Appointment जोड़ें" दबाकर डॉक्टर का नाम, तारीख और समय दर्ज करें।',
            '3. "Save Appointment" दबाएँ। साथी आपके लिए रिमाइंडर और डॉक्टर से पूछने वाले सवालों की तैयारी खुद कर देगा।',
          ]
        : [
            '1. Tap on the "🩺 Doctor Appointments" card or use the button below.',
            '2. Click "+ Add Appointment" and enter doctor name, date, and time.',
            '3. Click "Save Appointment". Saathi will organize reminders and visit preparation checklist for you.',
          ],
      suggestedAction: 'open_appointment',
      source: 'local-companion',
    };
  }

  // 4. Questions to ask doctor: "मुझे डॉक्टर के लिए क्या पूछना चाहिए?", "what should i ask the doctor", "questions to ask doctor"
  const isQuestionsForDoctorQuery =
    text.includes('डॉक्टर के लिए क्या पूछना') ||
    text.includes('डॉक्टर से क्या पूछें') ||
    text.includes('डॉक्टर से क्या पूछना') ||
    text.includes('kya poochna chahiye') ||
    text.includes('kya puchna') ||
    text.includes('what should i ask') ||
    text.includes('questions to ask doctor') ||
    text.includes('questions for doctor') ||
    text.includes('doctor se kya pooche') ||
    text.includes('doctor se kya puchhe') ||
    text.includes('doctor ke liye sawal');

  if (isQuestionsForDoctorQuery) {
    return {
      reply: isHi
        ? 'डॉक्टर से मिलने पर आप ये ज़रूरी और सहज सवाल पूछ सकते हैं:'
        : 'Here are important, comfortable questions you can ask your doctor during your visit:',
      steps: isHi
        ? [
            '1. डॉक्टर साहब, क्या मेरी वर्तमान दवाइयाँ और खुराक मेरी रिपोर्ट्स के अनुसार सही चल रही हैं?',
            '2. क्या इन दवाइयों को भोजन से पहले लेना है या बाद में, और यदि कोई खुराक छूट जाए तो क्या करें?',
            '3. क्या मुझे खाने-पीने, नमक या टहलने में कोई खास सावधानी रखनी है?',
            '4. अगली बार मुझे कब दोबारा चेकअप के लिए आना चाहिए?',
          ]
        : [
            '1. Doctor, are my current medicines and doses working well with my latest reports?',
            '2. Should I take these before or after meals, and what should I do if I accidentally miss a dose?',
            '3. Are there any diet, salt, or physical precautions I need to observe?',
            '4. When should I return for my next follow-up checkup?',
          ],
      suggestedAction: 'open_appointment',
      source: 'local-companion',
    };
  }

  // 5. Critical Medical Safety Guardrail: Direct treatment / dosage alteration / diagnosis queries
  // Saathi must NEVER invent treatment instructions, diagnoses, or dosage changes.
  const isMedicalTreatmentOrDosageQuery =
    text.includes('खुराक बदल') ||
    text.includes('dosage change') ||
    text.includes('change dosage') ||
    text.includes('increase dose') ||
    text.includes('decrease dose') ||
    text.includes('कौन सी दवा लूँ') ||
    text.includes('kaun si dawa') ||
    text.includes('what medicine should i take') ||
    text.includes('diagnose my') ||
    text.includes('क्या बीमारी है');

  if (isMedicalTreatmentOrDosageQuery) {
    return {
      reply: isHi
        ? 'आपकी सुरक्षा सबसे पहले है। साथी आपकी दिनचर्या और याददाश्त में सहायता के लिए है। किसी भी बीमारी का निदान, दवा की खुराक बदलने या नया इलाज शुरू करने के लिए कृपया केवल अपने योग्य डॉक्टर (Physician) से प्रत्यक्ष परामर्श लें।'
        : 'Your safety is our top priority. Saathi is designed to assist with daily routines and reminders. For any medical diagnosis, changing medication dosages, or starting new treatments, please always consult your qualified doctor or physician directly.',
      steps: isHi
        ? [
            'अपनी पुरानी पर्ची और वर्तमान दवाइयाँ लेकर डॉक्टर से मिलें।',
            'बिना डॉक्टर की सलाह के अपनी दवा की खुराक कभी कम या ज्यादा न करें।',
            'अपॉइंटमेंट की तैयारी और पर्ची संभालने के लिए साथी का उपयोग करें।',
          ]
        : [
            'Consult your certified physician with your current prescription.',
            'Never increase, decrease, or stop prescription medicines without medical advice.',
            'Use Saathi to prepare your questions and keep your visit checklist ready.',
          ],
      suggestedAction: 'open_appointment',
      source: 'local-companion',
    };
  }

  return null;
}

export const aiService = {
  /**
   * 1. Send natural language message to Saathi Companion
   * With lightweight safety guardrail to detect abusive/harmful content and respond respectfully.
   */
  async sendChatMessage(
    message: string,
    language: Language,
    mode = 'general',
    context?: {
      medicines?: Partial<MedicineItem>[];
      appointments?: Partial<AppointmentItem>[];
      currentSection?: string;
    }
  ): Promise<ChatResponse> {
    const raw = (message || '').trim();
    if (!raw) {
      throw new Error(
        language === 'hi'
          ? 'कृपया अपनी बात लिखकर या बोलकर साझा करें।'
          : 'Please share your message by typing or speaking.'
      );
    }

    // Safety guardrail check
    const safety = classifyMessageSafety(raw, language);
    if (!safety.isAllowed && safety.safeResponse) {
      return {
        reply: safety.safeResponse,
        suggestedAction: safety.status === 'medical_unsafe' ? 'open_appointment' : undefined,
        source: 'local-companion',
      };
    }

    const sanitized = raw.slice(0, INPUT_LIMITS.CHAT_MESSAGE_MAX_CHARS);

    // Efficiency: Check if local application state can answer directly (e.g. medicine schedule, tomorrow's plan)
    const localAnswer = resolveLocalDirectAnswer(sanitized, language, context);
    if (localAnswer) {
      return localAnswer;
    }

    try {
      const response = await fetchWithRetry('/api/saathi/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: sanitized, language, mode, safetyStatus: safety.status, context }),
      });

      if (!response.ok) {
        throw new Error(`Server status ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.warn('AI service chat fallback triggered:', err);
      const isHi = language === 'hi';
      return {
        reply: isHi
          ? 'बिल्कुल चिंता न करें। मैं आपके साथ हूँ। आइए इसे शांत मन से समझें:'
          : 'Do not worry at all. I am right here with you. Let us solve this step by step:',
        steps: isHi
          ? [
              'शांत मन से अपनी बात दोहराएं, कोई जल्दी नहीं है।',
              'यदि यह डॉक्टर से मिलने के बारे में है, तो अपनी पुरानी पर्ची फ़ाइल में रख लें।',
              'यदि यह किसी मैसेज के बारे में है, तो किसी अनजान लिंक पर क्लिक बिल्कुल न करें।',
            ]
          : [
              'Take a deep breath and keep calm.',
              'If this is about a doctor visit, keep your previous medical records ready.',
              'If this is about an SMS or WhatsApp, do not click suspicious links or share passwords.',
            ],
        source: 'fallback',
      };
    }
  },

  /**
   * 2. Analyze suspicious message for fraud/scam indicators
   * Strictly validates input (no empty/spaces, length limit) and ensures normalized structured output.
   */
  async checkScam(messageText: string, language: Language): Promise<ScamAnalysisResult> {
    const validation = validateScamInput(messageText, language);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    try {
      const response = await fetchWithRetry('/api/saathi/scam-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: validation.sanitizedText, language }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => null);
        if (errJson?.error) {
          throw new Error(errJson.error);
        }
        throw new Error(`Server status ${response.status}`);
      }

      const rawData = await response.json();
      return normalizeScamResult(rawData, language);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : '';
      // Re-throw user validation error so UI displays friendly validation message
      if (errMsg && (errMsg.includes('कृपया पहले') || errMsg.includes('Please write or paste') || errMsg.includes('बहुत लंबा') || errMsg.includes('too long'))) {
        throw err;
      }

      console.warn('AI service scam check fallback triggered:', err);
      // Safe structured fallback, never exposing raw errors or stack traces
      return normalizeScamResult({ riskLevel: 'UNKNOWN / NEEDS REVIEW' }, language);
    }
  },

  /**
   * 3. Plain language explanation of documents and notices
   */
  async explainDocument(text: string, language: Language): Promise<DocumentAnalysisResult> {
    const sanitized = (text || '').trim().slice(0, 4000);
    if (!sanitized) {
      throw new Error('Document text is required');
    }

    try {
      const response = await fetchWithRetry('/api/saathi/explain-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sanitized, language }),
      });

      if (!response.ok) {
        throw new Error(`Server status ${response.status}`);
      }

      const data: DocumentAnalysisResult = await response.json();
      return data;
    } catch (err) {
      console.warn('AI service document explainer fallback triggered:', err);
      const isHi = language === 'hi';
      return {
        simpleExplanation: isHi
          ? 'यह दस्तावेज़ आपके लिए ज़रूरी निर्देशों या सूचनाओं का सारांश है।'
          : 'This document summarizes your essential instructions or notices in plain words.',
        importantThings: isHi
          ? ['तारीख और समय की पुष्टि करें।', 'कागज़ात को सुरक्षित फ़ाइल में रखें।']
          : ['Verify any due dates or deadlines.', 'Keep the original document safe in your file.'],
        difficultWords: [
          {
            term: isHi ? 'देय तिथि (Due Date)' : 'Due Date',
            explanation: isHi ? 'काम पूरा करने की अंतिम समय सीमा।' : 'The final date to complete required steps.',
          },
        ],
        actionSteps: isHi
          ? ['दस्तावेज़ की तारीख ध्यान से नोट करें।', 'परिवार के किसी सदस्य से भी एक बार दिखा लें।']
          : ['Note the key date on your calendar.', 'Double check with a trusted family member or certified advisor.'],
        safetyDisclaimer:
          'Saathi provides this AI-powered summary for informational understanding. It does not replace professional medical, legal or financial advice.',
      };
    }
  },

  /**
   * 4. Prepare personalized doctor visit checklist and questions
   */
  async prepareAppointment(
    doctorOrService: string,
    details: { date?: string; time?: string; notes?: string },
    language: Language
  ): Promise<AppointmentPrepResult> {
    const sanitizedDoc = (doctorOrService || '').trim().slice(0, 200);
    if (!sanitizedDoc) {
      throw new Error('Doctor or service name is required');
    }

    try {
      const response = await fetchWithRetry('/api/saathi/prepare-appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorOrService: sanitizedDoc,
          date: details.date || '',
          time: details.time || '',
          notes: details.notes || '',
          language,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server status ${response.status}`);
      }

      const data: AppointmentPrepResult = await response.json();
      return data;
    } catch (err) {
      console.warn('AI service appointment prep fallback triggered:', err);
      const isHi = language === 'hi';
      return {
        checklist: isHi
          ? [
              'पुरानी पर्चियां और हालिया टेस्ट रिपोर्ट एक फ़ाइल में रखें।',
              'वर्तमान में चल रही सभी दवाओं के पत्ते साथ ले जाएं।',
              'पढ़ने का चश्मा और पानी की बोतल साथ रखें।',
            ]
          : [
              'Previous prescription files and recent lab reports.',
              'Ongoing medicine strips in their original box.',
              'Reading glasses, a water bottle, and a light snack.',
            ],
        questionsToAsk: isHi
          ? [
              'डॉक्टर साहब, क्या मेरा बीपी और शुगर सुरक्षित सीमा में है?',
              'दवाइयाँ भोजन से पहले लेनी हैं या बाद में?',
              'अगली बार मुझे कब दिखाने आना है?',
            ]
          : [
              'Doctor, are my vital health parameters in the safe target range?',
              'Should I take these medicines before or after food?',
              'When should I schedule my next review visit?',
            ],
        comfortTips: isHi
          ? ['आरामदायक कपड़े पहनें।', 'किसी साथी या परिवार के सदस्य को साथ ले जाएं।']
          : ['Wear comfortable clothing and walking shoes.', 'Have a trusted family member accompany you.'],
        bookingNotice: isHi
          ? 'नोट: साथी आपकी तैयारी के लिए चेकलिस्ट तैयार करता है। साथी अस्पताल या क्लीनिक में सीधे बुकिंग नहीं करता।'
          : 'Note: Saathi provides visit preparation guidance. Saathi does not book appointments directly with hospitals.',
      };
    }
  },
};
