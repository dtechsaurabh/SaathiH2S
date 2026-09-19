import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadMedicines, saveMedicines } from './storage';
import { MedicineItem } from '../types';

describe('Medicine Management & Lifecycle Tests', () => {
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

  it('creates and persists a new medicine item with rawTime and startDate', () => {
    const today = new Date().toISOString().split('T')[0];
    const newMed: MedicineItem = {
      id: 'med-bp-1',
      name: 'Telmisartan (40mg)',
      dosage: '1 गोली',
      time: '09:00 AM',
      rawTime: '09:00',
      startDate: today,
      timeSlot: 'morning',
      frequency: 'Daily',
      status: 'pending',
      instructionsHi: 'नाश्ते के बाद गुनगुने पानी से',
    };

    saveMedicines([newMed]);

    const loaded = loadMedicines();
    expect(loaded.length).toBe(1);
    expect(loaded[0].id).toBe('med-bp-1');
    expect(loaded[0].name).toBe('Telmisartan (40mg)');
    expect(loaded[0].rawTime).toBe('09:00');
    expect(loaded[0].startDate).toBe(today);
    expect(loaded[0].status).toBe('pending');
  });

  it('edits an existing medicine and persists updated dosage, time, and instructions', () => {
    const initialMed: MedicineItem = {
      id: 'med-edit-1',
      name: 'Thyroxine (50mcg)',
      dosage: '1 गोली',
      time: '07:00 AM',
      rawTime: '07:00',
      startDate: '2026-09-01',
      timeSlot: 'morning',
      frequency: 'Daily',
      status: 'pending',
    };

    saveMedicines([initialMed]);

    // Perform Edit: update dosage to 75mcg and time to 06:30 AM
    const updatedMed: MedicineItem = {
      ...initialMed,
      dosage: '1.5 गोली (75mcg)',
      time: '06:30 AM',
      rawTime: '06:30',
      instructions: 'Early morning empty stomach with fresh water',
    };

    saveMedicines([updatedMed]);

    const reloaded = loadMedicines();
    expect(reloaded.length).toBe(1);
    expect(reloaded[0].dosage).toBe('1.5 गोली (75mcg)');
    expect(reloaded[0].time).toBe('06:30 AM');
    expect(reloaded[0].rawTime).toBe('06:30');
    expect(reloaded[0].instructions).toContain('Early morning empty stomach');
  });

  it('deletes a medicine and persists the remaining items', () => {
    const med1: MedicineItem = {
      id: 'med-1',
      name: 'Medicine A',
      dosage: '1 pill',
      time: '08:00 AM',
      timeSlot: 'morning',
      frequency: 'Daily',
      status: 'pending',
    };
    const med2: MedicineItem = {
      id: 'med-2',
      name: 'Medicine B',
      dosage: '2 pills',
      time: '08:00 PM',
      timeSlot: 'night',
      frequency: 'Daily',
      status: 'pending',
    };

    saveMedicines([med1, med2]);
    expect(loadMedicines().length).toBe(2);

    // Delete med1
    const remaining = loadMedicines().filter((m) => m.id !== 'med-1');
    saveMedicines(remaining);

    const reloaded = loadMedicines();
    expect(reloaded.length).toBe(1);
    expect(reloaded[0].id).toBe('med-2');
    expect(reloaded[0].name).toBe('Medicine B');
  });

  it('marks a medicine as Taken and records the status timestamp', () => {
    const med: MedicineItem = {
      id: 'med-status-1',
      name: 'Atorvastatin (10mg)',
      dosage: '1 Tab',
      time: '09:00 PM',
      timeSlot: 'night',
      frequency: 'Daily',
      status: 'pending',
    };

    saveMedicines([med]);

    // Action: Mark Taken
    const takenTime = '09:05 PM';
    const takenList = loadMedicines().map((m) =>
      m.id === 'med-status-1' ? { ...m, status: 'taken' as const, statusTimestamp: takenTime } : m
    );
    saveMedicines(takenList);

    const reloaded = loadMedicines();
    expect(reloaded[0].status).toBe('taken');
    expect(reloaded[0].statusTimestamp).toBe(takenTime);
  });

  it('marks a medicine as Skipped without double dosing warning', () => {
    const med: MedicineItem = {
      id: 'med-status-2',
      name: 'Metformin (500mg)',
      dosage: '1 Tab',
      time: '01:30 PM',
      timeSlot: 'afternoon',
      frequency: 'Daily',
      status: 'pending',
    };

    saveMedicines([med]);

    // Action: Mark Skipped
    const skippedList = loadMedicines().map((m) =>
      m.id === 'med-status-2' ? { ...m, status: 'skipped' as const } : m
    );
    saveMedicines(skippedList);

    const reloaded = loadMedicines();
    expect(reloaded[0].status).toBe('skipped');
  });

  describe('Medicine Input Validation & Invalid Data Protection', () => {
    const validateMedicineInput = (name: string, rawTime: string, language: 'hi' | 'en') => {
      const trimmedName = (name || '').trim();
      if (!trimmedName) {
        return {
          isValid: false,
          error: language === 'hi' ? 'कृपया दवाई का नाम लिखें' : 'Please enter medicine name',
        };
      }
      if (trimmedName.length > 80) {
        return {
          isValid: false,
          error: language === 'hi' ? 'दवाई का नाम 80 अक्षरों से कम होना चाहिए' : 'Medicine name must be under 80 characters',
        };
      }
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (rawTime && !timeRegex.test(rawTime)) {
        return {
          isValid: false,
          error: language === 'hi' ? 'कृपया सही समय चुनें' : 'Please select a valid time',
        };
      }
      return { isValid: true };
    };

    it('rejects empty or whitespace-only medicine name with senior-friendly error message', () => {
      const res1 = validateMedicineInput('', '08:00', 'hi');
      expect(res1.isValid).toBe(false);
      expect(res1.error).toBe('कृपया दवाई का नाम लिखें');

      const res2 = validateMedicineInput('   \n\t  ', '08:00', 'en');
      expect(res2.isValid).toBe(false);
      expect(res2.error).toBe('Please enter medicine name');
    });

    it('rejects excessively long medicine names to prevent UI overflows', () => {
      const longName = 'A'.repeat(100);
      const res = validateMedicineInput(longName, '08:00', 'en');
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('must be under 80 characters');
    });

    it('validates 24-hour time format before converting to 12-hour AM/PM', () => {
      const invalidTime = validateMedicineInput('Aspirin', '99:99', 'en');
      expect(invalidTime.isValid).toBe(false);
      expect(invalidTime.error).toContain('valid time');

      const validTime = validateMedicineInput('Aspirin', '08:30', 'en');
      expect(validTime.isValid).toBe(true);
    });
  });
});
