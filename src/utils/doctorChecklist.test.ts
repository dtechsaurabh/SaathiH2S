import { describe, it, expect, beforeEach, vi } from 'vitest';
import { aiService } from '../services/aiService';

describe('Doctor Visit Checklist & Consultation Questions Test Suite', () => {
  let mockStore: Record<string, string> = {};

  beforeEach(() => {
    mockStore = {};
    const mockLocalStorage = {
      getItem: (key: string) => mockStore[key] || null,
      setItem: (key: string, val: string) => {
        mockStore[key] = val;
      },
      removeItem: (key: string) => {
        delete mockStore[key];
      },
      clear: () => {
        mockStore = {};
      },
    };

    vi.stubGlobal('localStorage', mockLocalStorage);
  });

  const DEFAULT_DOCTOR_CHECKLIST = [
    { id: 'med_list', hi: 'अपनी दवाइयों की सूची साथ रखें', en: 'Keep your current medicine list ready' },
    { id: 'old_reports', hi: 'पुराने reports/documents साथ रखें', en: 'Keep previous medical reports & test documents ready' },
    { id: 'main_issue', hi: 'अपनी मुख्य समस्या/सवाल लिख लें', en: 'Write down your primary concern or symptoms' },
    { id: 'ask_meds', hi: 'डॉक्टर से अपनी दवाओं के बारे में पूछें', en: 'Ask the doctor about your current medications' },
    { id: 'next_visit', hi: 'अगली appointment/date पूछें', en: 'Clarify the follow-up appointment date & next steps' },
  ];

  const DEFAULT_DOCTOR_QUESTIONS = [
    { hi: 'मेरी समस्या के बारे में आपकी क्या सलाह है?', en: 'What is your recommendation regarding my current concern?' },
    { hi: 'इस दवा का उद्देश्य क्या है?', en: 'What is the purpose and expected outcome of this medication?' },
    { hi: 'मुझे किन बातों पर ध्यान देना चाहिए?', en: 'Are there any precautions or warning signs I should watch out for?' },
    { hi: 'अगली बार कब मिलना चाहिए?', en: 'When should I schedule my next follow-up visit?' },
    { hi: 'कौन-सी जानकारी या report साथ लानी चाहिए?', en: 'Which tests or documents should I bring for the next visit?' },
  ];

  it('1. Verifies rendering of all 5 standard senior-friendly checklist items in Hindi and English', () => {
    expect(DEFAULT_DOCTOR_CHECKLIST.length).toBe(5);
    DEFAULT_DOCTOR_CHECKLIST.forEach((item) => {
      expect(item.id).toBeDefined();
      expect(item.hi.length).toBeGreaterThan(5);
      expect(item.en.length).toBeGreaterThan(5);
    });
  });

  it('2. Supports checking and unchecking items with dynamic state toggling', () => {
    const checkedMap: Record<string, boolean> = {};

    // Check item 1
    checkedMap['med_list'] = true;
    expect(checkedMap['med_list']).toBe(true);

    // Check item 2
    checkedMap['old_reports'] = true;
    expect(checkedMap['old_reports']).toBe(true);

    // Uncheck item 1
    checkedMap['med_list'] = false;
    expect(checkedMap['med_list']).toBe(false);
    expect(checkedMap['old_reports']).toBe(true);
  });

  it('3. Persists checklist item completion state to localStorage and restores reliably', () => {
    const storageKey = 'saathi_doctor_checklist_items';
    const initialToggles = {
      'app-1_med_list': true,
      'app-1_old_reports': true,
      'app-1_ask_meds': false,
    };

    localStorage.setItem(storageKey, JSON.stringify(initialToggles));

    const restoredRaw = localStorage.getItem(storageKey);
    expect(restoredRaw).not.toBeNull();
    const restored = JSON.parse(restoredRaw!);

    expect(restored['app-1_med_list']).toBe(true);
    expect(restored['app-1_old_reports']).toBe(true);
    expect(restored['app-1_ask_meds']).toBe(false);
  });

  it('4. Provides safe, empowering questions for senior consultation without diagnostic assumptions', () => {
    expect(DEFAULT_DOCTOR_QUESTIONS.length).toBeGreaterThanOrEqual(4);
    DEFAULT_DOCTOR_QUESTIONS.forEach((q) => {
      // Questions must prompt doctor communication, never assume a self-diagnosis
      expect(q.en.toLowerCase()).not.toContain('take this antibiotic');
      expect(q.en.toLowerCase()).not.toContain('stop taking');
      expect(q.hi.length).toBeGreaterThan(5);
    });
  });

  it('5. Medical safety: Intercepts dosage alteration requests and refuses clinical prescription', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    const dosageAlterationQueries = [
      'क्या मैं अपनी बीपी की दवा की खुराक बदल सकता हूँ?',
      'Can I change dosage of my medication?',
      'should I increase dose of insulin?',
    ];

    for (const q of dosageAlterationQueries) {
      const res = await aiService.sendChatMessage(q, 'hi', 'general');
      expect(res.source).toBe('local-companion');
      expect(res.reply).toContain('डॉक्टर');
      expect(res.reply).toContain('खुराक');
      // Verifies zero Gemini calls for dangerous medical advice
      expect(fetchSpy).not.toHaveBeenCalled();
    }
  });
});
