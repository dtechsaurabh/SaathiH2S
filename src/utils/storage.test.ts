import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  loadSeniorSettings,
  saveSeniorSettings,
  DEFAULT_SETTINGS,
  loadMedicines,
  saveMedicines,
  loadAppointments,
  saveAppointments,
  resetDemoData,
} from './storage';
import { MedicineItem, AppointmentItem } from '../types';

describe('Senior Storage Utilities', () => {
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

  it('should load default senior settings when storage is empty', () => {
    const settings = loadSeniorSettings();
    expect(settings).toEqual(DEFAULT_SETTINGS);
    expect(settings.fontSize).toBe('large');
    expect(settings.language).toBe('hi');
    expect(settings.soundEnabled).toBe(true);
    expect(settings.highContrast).toBe(false);
  });

  it('should persist and retrieve customized senior settings', () => {
    saveSeniorSettings({
      fontSize: 'xlarge',
      language: 'en',
      soundEnabled: false,
      highContrast: true,
      reduceMotion: true,
      voiceSpeed: 'slow',
    });

    const loaded = loadSeniorSettings();
    expect(loaded.fontSize).toBe('xlarge');
    expect(loaded.language).toBe('en');
    expect(loaded.soundEnabled).toBe(false);
    expect(loaded.highContrast).toBe(true);
    expect(loaded.reduceMotion).toBe(true);
    expect(loaded.voiceSpeed).toBe('slow');
  });

  it('should return initial demo medicines when no custom medicines exist', () => {
    const medicines = loadMedicines();
    expect(medicines.length).toBeGreaterThan(0);
    expect(medicines[0].name).toContain('Amlodipine');
  });

  it('should update medicines when saved including rawTime and startDate', () => {
    const today = new Date().toISOString().split('T')[0];
    const customMed: MedicineItem = {
      id: 'custom-1',
      name: 'Calcium (500mg)',
      dosage: '1 Tab',
      time: '10:00 AM',
      rawTime: '10:00',
      startDate: today,
      timeSlot: 'morning',
      frequency: 'Daily',
      status: 'pending',
    };

    saveMedicines([customMed]);
    const loaded = loadMedicines();
    expect(loaded.length).toBe(1);
    expect(loaded[0].name).toBe('Calcium (500mg)');
    expect(loaded[0].rawTime).toBe('10:00');
    expect(loaded[0].startDate).toBe(today);
  });

  it('should reset demo data when resetDemoData is triggered', () => {
    const customAppointment: AppointmentItem = {
      id: 'test-app',
      doctorOrService: 'Dr. Test',
      specialty: 'Testing',
      date: 'Today',
      time: '10:00 AM',
      location: 'Room 1',
      status: 'upcoming',
    };

    saveAppointments([customAppointment]);
    expect(loadAppointments().length).toBe(1);

    resetDemoData();
    // After reset, it should fall back to initial demo appointments
    const refreshed = loadAppointments();
    expect(refreshed.length).toBeGreaterThan(1);
    expect(refreshed[0].doctorOrService).toContain('Dr. R. K. Sharma');
  });
});
