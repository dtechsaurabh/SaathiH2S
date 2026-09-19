import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { aiService } from '../services/aiService';
import {
  loadSeniorSettings,
  saveSeniorSettings,
  loadMedicines,
  saveMedicines,
  loadAppointments,
  saveAppointments,
  loadReminders,
  saveReminders,
} from './storage';
import { speakText, stopSpeaking } from './speech';
import { MedicineItem, AppointmentItem } from '../types';

describe('Evidence-Based Efficiency & Concurrency Verification Suite', () => {
  let mockStore: Record<string, string> = {};
  let setItemSpy: any;

  beforeEach(() => {
    mockStore = {};
    const mockLocalStorage = {
      getItem: (key: string) => mockStore[key] || null,
      setItem: vi.fn((key: string, val: string) => {
        mockStore[key] = val;
      }),
      removeItem: vi.fn((key: string) => {
        delete mockStore[key];
      }),
      clear: vi.fn(() => {
        mockStore = {};
      }),
    };
    setItemSpy = mockLocalStorage.setItem;
    vi.stubGlobal('localStorage', mockLocalStorage);
    vi.stubGlobal('window', {
      speechSynthesis: undefined,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. API & Gemini Efficiency Verification', () => {
    it('verifies local-first queries NEVER trigger Gemini or network fetch', async () => {
      const fetchSpy = vi.fn();
      vi.stubGlobal('fetch', fetchSpy);

      // Query 1: Medicine inquiry with medicine list
      const res1 = await aiService.sendChatMessage('मेरी दवा कब है?', 'hi', 'general', {
        medicines: [
          {
            id: 'm1',
            name: 'Metformin',
            dosage: '500mg',
            time: '08:00 AM',
            status: 'pending',
          },
        ],
      });
      expect(res1.source).toBe('local-companion');
      expect(fetchSpy).not.toHaveBeenCalled();

      // Query 2: Medicine inquiry with empty medicine list
      const res2 = await aiService.sendChatMessage('show my medicine reminders', 'en', 'general', {
        medicines: [],
      });
      expect(res2.source).toBe('local-companion');
      expect(res2.reply).toContain('no medicines scheduled');
      expect(fetchSpy).not.toHaveBeenCalled();

      // Query 3: Appointment schedule inquiry with empty list
      const res3 = await aiService.sendChatMessage('कल का कार्यक्रम', 'hi', 'general', {
        appointments: [],
      });
      expect(res3.source).toBe('local-companion');
      expect(fetchSpy).not.toHaveBeenCalled();

      // Query 4: Doctor question guide query
      const res4 = await aiService.sendChatMessage('doctor se kya pooche', 'hi', 'general');
      expect(res4.source).toBe('local-companion');
      expect(fetchSpy).not.toHaveBeenCalled();

      // Query 5: How to add appointment
      const res5 = await aiService.sendChatMessage('how to book appointment', 'en', 'general');
      expect(res5.source).toBe('local-companion');
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('verifies in-flight request deduplication and concurrent clone execution', async () => {
      let resolvePromise: any;
      const fakeFetch = vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            resolvePromise = () =>
              resolve({
                ok: true,
                clone: function () {
                  return this;
                },
                json: async () => ({ reply: 'Unified response', source: 'gemini' }),
              });
          })
      );
      vi.stubGlobal('fetch', fakeFetch);

      // Trigger 3 identical requests simultaneously
      const [req1, req2, req3] = [
        aiService.sendChatMessage('General query concurrent', 'en'),
        aiService.sendChatMessage('General query concurrent', 'en'),
        aiService.sendChatMessage('General query concurrent', 'en'),
      ];

      resolvePromise();
      const [res1, res2, res3] = await Promise.all([req1, req2, req3]);

      // Only 1 actual fetch was issued across the 3 concurrent calls
      expect(fakeFetch).toHaveBeenCalledTimes(1);
      expect(res1.reply).toBe('Unified response');
      expect(res2.reply).toBe('Unified response');
      expect(res3.reply).toBe('Unified response');
    });

    it('verifies request retry is bounded to 1 attempt and handles transient errors gracefully', async () => {
      const fetchSpy = vi
        .fn()
        .mockRejectedValueOnce(new Error('Transient 503 error'))
        .mockRejectedValueOnce(new Error('Fatal 503 error'));

      vi.stubGlobal('fetch', fetchSpy);

      const res = await aiService.sendChatMessage('Non-local conversational query', 'hi');
      // Must not endlessly retry: exactly 2 fetch calls (initial + 1 retry)
      expect(fetchSpy).toHaveBeenCalledTimes(2);
      expect(res.source).toBe('fallback');
      expect(res.reply).toBeDefined();
    });
  });

  describe('2. Storage Efficiency & Corruption Recovery', () => {
    it('verifies localStorage writes are deduplicated when state has not changed', () => {
      const sampleMeds: MedicineItem[] = [
        {
          id: `med-${Date.now()}-1`,
          name: 'Telmisartan',
          dosage: '40mg',
          time: '09:00 AM',
          timeSlot: 'morning',
          frequency: 'Daily',
          status: 'pending',
          isDemo: false,
        },
      ];

      // First save: writes to localStorage
      saveMedicines(sampleMeds);
      const callCountAfterFirst = setItemSpy.mock.calls.length;
      expect(callCountAfterFirst).toBeGreaterThanOrEqual(1);

      // Consecutive saves with identical data: skipped due to in-memory write cache
      saveMedicines(sampleMeds);
      saveMedicines(sampleMeds);
      saveMedicines(sampleMeds);
      expect(setItemSpy.mock.calls.length).toBe(callCountAfterFirst);

      // Modify data: writes again
      const updatedMeds = [...sampleMeds, { ...sampleMeds[0], id: `med-${Date.now()}-2`, name: 'Aspirin' }];
      saveMedicines(updatedMeds);
      expect(setItemSpy.mock.calls.length).toBe(callCountAfterFirst + 1);
    });

    it('verifies settings storage deduplication', () => {
      const settings = loadSeniorSettings();
      // Ensure modified settings to trigger initial write
      const customSettings = { ...settings, soundEnabled: false };

      saveSeniorSettings(customSettings);
      const callCountAfterFirst = setItemSpy.mock.calls.length;

      // Re-saving same settings is a no-op for disk I/O
      saveSeniorSettings(customSettings);
      saveSeniorSettings(customSettings);
      expect(setItemSpy.mock.calls.length).toBe(callCountAfterFirst);
    });

    it('recovers gracefully from corrupted or invalid JSON in storage without crashing', () => {
      mockStore['saathi_settings_v2'] = 'MALFORMED_JSON_STRING{{{{';
      mockStore['saathi_medicines_v2'] = 'NOT_AN_ARRAY{"name": 123}';
      mockStore['saathi_appointments_v2'] = 'null';
      mockStore['saathi_reminders_v2'] = '12345';

      // None of these should throw or return corrupted data
      const settings = loadSeniorSettings();
      expect(settings).toBeDefined();
      expect(settings.fontSize).toBe('large');
      expect(settings.language).toBe('hi');

      const meds = loadMedicines();
      expect(Array.isArray(meds)).toBe(true);
      expect(meds.length).toBeGreaterThan(0); // Falls back to valid initial demo medicines

      const apps = loadAppointments();
      expect(Array.isArray(apps)).toBe(true);
      expect(apps.length).toBeGreaterThan(0); // Falls back to valid initial demo appointments

      const rems = loadReminders();
      expect(Array.isArray(rems)).toBe(true);
      expect(rems.length).toBeGreaterThan(0);
    });
  });

  describe('3. Speech Efficiency & Rapid Click Throttling', () => {
    it('throttles rapid repeated Read Aloud triggers with identical text', () => {
      let speakCount = 0;

    class MockSpeechSynthesisUtterance {
      text: string;
      rate: number = 1;
      pitch: number = 1;
      lang: string = '';
      onend: any = null;
      onerror: any = null;
      constructor(text: string) {
        this.text = text;
      }
    }

    const mockSpeechSynthesis = {
      speak: vi.fn(),
      cancel: vi.fn(),
      speaking: false,
      paused: false,
      pending: false,
      getVoices: () => [],
    };

    vi.stubGlobal('SpeechSynthesisUtterance', MockSpeechSynthesisUtterance);
    vi.stubGlobal('window', {
      speechSynthesis: mockSpeechSynthesis,
    });

      // First click
      const res1 = speakText('दवाई लेने का समय हो गया है', 'hi');
      expect(res1).toBe(true);
      expect(mockSpeechSynthesis.cancel).toHaveBeenCalledTimes(1);
      expect(mockSpeechSynthesis.speak).toHaveBeenCalledTimes(1);

      // Rapid second click (within 50ms) with identical text
      mockSpeechSynthesis.speaking = true;
      const res2 = speakText('दवाई लेने का समय हो गया है', 'hi');
      expect(res2).toBe(true);
      // speak should NOT have been called again because of throttling
      expect(mockSpeechSynthesis.speak).toHaveBeenCalledTimes(1);

      // Stop speech cleans up listeners without error
      stopSpeaking();
      expect(mockSpeechSynthesis.cancel).toHaveBeenCalledTimes(2);
    });

    it('safely handles environments where SpeechSynthesis is unavailable', () => {
      vi.stubGlobal('speechSynthesis', undefined);
      vi.stubGlobal('window', {});
      const res = speakText('Test text', 'en');
      expect(res).toBe(false);
      expect(() => stopSpeaking()).not.toThrow();
    });
  });

  describe('4. Concurrency & State Integrity', () => {
    it('verifies appointments list preserves integrity across multiple saves', () => {
      const initialAppointments: AppointmentItem[] = [
        {
          id: 'app-test-1',
          doctorOrService: 'Dr. A',
          specialty: 'Physician',
          date: 'Tomorrow',
          time: '10:00 AM',
          location: 'OPD',
          status: 'upcoming',
        },
      ];

      saveAppointments(initialAppointments);
      let stored = loadAppointments();
      expect(stored.length).toBe(1);
      expect(stored[0].id).toBe('app-test-1');

      const app2: AppointmentItem = {
        id: 'app-test-2',
        doctorOrService: 'Dr. B',
        specialty: 'Cardiology',
        date: 'Day after',
        time: '11:00 AM',
        location: 'Heart Clinic',
        status: 'upcoming',
      };

      saveAppointments([...stored, app2]);
      stored = loadAppointments();
      expect(stored.length).toBe(2);
      expect(stored.map((a) => a.id)).toEqual(['app-test-1', 'app-test-2']);
    });
  });
});
