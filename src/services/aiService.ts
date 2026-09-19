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
} from '../types';
import {
  validateScamInput,
  classifyMessageSafety,
  normalizeScamResult,
} from '../utils/aiSafety';

export interface ChatResponse {
  reply: string;
  steps?: string[];
  precautions?: string[];
  clarificationQuestion?: string;
  actionDisclaimer?: string;
  suggestedAction?: 'open_appointment' | 'open_medicine' | 'open_scam' | 'open_document';
  source?: 'gemini' | 'local-companion' | 'fallback';
}

const DEFAULT_TIMEOUT_MS = 16000;

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
 * Execute request with 1 automatic retry on transient network errors
 */
async function fetchWithRetry(url: string, options: RequestInit, retries = 1): Promise<Response> {
  try {
    return await fetchWithTimeout(url, options);
  } catch (err) {
    if (retries > 0) {
      // Small pause before single retry
      await new Promise((r) => setTimeout(r, 800));
      return await fetchWithTimeout(url, options);
    }
    throw err;
  }
}

export const aiService = {
  /**
   * 1. Send natural language message to Saathi Companion
   * With lightweight safety guardrail to detect abusive/harmful content and respond respectfully.
   */
  async sendChatMessage(message: string, language: Language, mode = 'general'): Promise<ChatResponse> {
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
        source: 'local-companion',
      };
    }

    const sanitized = raw.slice(0, 2000);

    try {
      const response = await fetchWithRetry('/api/saathi/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: sanitized, language, mode, safetyStatus: safety.status }),
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
    } catch (err: any) {
      // Re-throw user validation error so UI displays friendly validation message
      if (err?.message && (err.message.includes('कृपया पहले') || err.message.includes('Please write or paste') || err.message.includes('बहुत लंबा') || err.message.includes('too long'))) {
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
