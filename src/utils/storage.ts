import { SeniorSettings, MedicineItem, AppointmentItem, ReminderItem } from '../types';
import { INITIAL_REMINDERS } from '../data/featureData';
import { STORAGE_KEYS } from './constants';

export const DEFAULT_SETTINGS: SeniorSettings = {
  fontSize: 'large',
  language: 'hi',
  soundEnabled: true,
  highContrast: false,
  reduceMotion: false,
  voiceSpeed: 'normal',
};

export const INITIAL_DEMO_MEDICINES: MedicineItem[] = [
  {
    id: 'med-1',
    name: 'Amlodipine (5mg)',
    dosage: '1 गोली (1 Tablet)',
    time: '08:00 AM',
    rawTime: '08:00',
    timeSlot: 'morning',
    frequency: 'Once Daily after light breakfast',
    frequencyHi: 'रोज़ाना सुबह हल्के नाश्ते के बाद',
    status: 'pending',
    instructions: 'Take with lukewarm water. Do not skip if blood pressure is normal.',
    instructionsHi: 'गुनगुने पानी से लें। बीपी सामान्य होने पर भी डॉक्टर की सलाह बिना बंद न करें।',
    isDemo: true,
  },
  {
    id: 'med-2',
    name: 'Metformin (500mg)',
    dosage: '1 गोली (1 Tablet)',
    time: '01:30 PM',
    rawTime: '13:30',
    timeSlot: 'afternoon',
    frequency: 'Once Daily right after lunch',
    frequencyHi: 'रोज़ाना दोपहर भोजन के तुरंत बाद',
    status: 'pending',
    instructions: 'Helps regulate blood sugar levels. Drink adequate water.',
    instructionsHi: 'शुगर को नियंत्रित रखने के लिए। पर्याप्त पानी पिएं।',
    isDemo: true,
  },
  {
    id: 'med-3',
    name: 'Atorvastatin (10mg)',
    dosage: '1 गोली (1 Tablet)',
    time: '08:00 PM',
    rawTime: '20:00',
    timeSlot: 'night',
    frequency: 'Daily after dinner',
    frequencyHi: 'रोज़ाना रात के खाने के बाद',
    status: 'pending',
    instructions: 'Take at consistent time every night for heart health.',
    instructionsHi: 'दिल की सेहत के लिए रोज़ाना एक ही समय पर लें।',
    isDemo: true,
  },
];

export const INITIAL_DEMO_APPOINTMENTS: AppointmentItem[] = [
  {
    id: 'app-1',
    doctorOrService: 'Dr. R. K. Sharma (Cardiologist)',
    specialty: 'हृदय रोग विशेषज्ञ (Heart Care)',
    date: 'Tomorrow (कल)',
    time: '11:30 AM',
    location: 'Metro Heart Institute, OPD Room 204',
    notes: 'Routine 6-month blood pressure review & ECG check.',
    status: 'upcoming',
    isDemo: true,
    preparationChecklist: [
      'Carry previous prescription and last 3 months BP log',
      'Recent blood lipid profile and kidney function report',
      'Ongoing medicine strips in their original box',
    ],
    questionsToAsk: [
      'Are my BP readings stable on current dosage?',
      'Can I take morning walks in winter?',
    ],
  },
  {
    id: 'app-2',
    doctorOrService: 'Dr. Sunita Mehra (Eye Specialist)',
    specialty: 'नेत्र रोग विशेषज्ञ (Eye & Cataract)',
    date: 'Thursday (गुरुवार)',
    time: '04:00 PM',
    location: 'Vision Care Clinic, Near Post Office',
    notes: 'Annual vision checkup and reading spectacles power check.',
    status: 'upcoming',
    isDemo: true,
    preparationChecklist: [
      'Current pair of reading and distance spectacles',
      'Sunglasses for comfort after pupil dilation drops',
    ],
    questionsToAsk: [
      'Is my cataract progressing or still mild?',
      'Do I need lubricating drops for dry eyes?',
    ],
  },
];

const SETTINGS_KEY = STORAGE_KEYS.SETTINGS;
const MEDICINES_KEY = STORAGE_KEYS.MEDICINES;
const APPOINTMENTS_KEY = STORAGE_KEYS.APPOINTMENTS;
const REMINDERS_KEY = STORAGE_KEYS.REMINDERS;

// In-memory write cache to prevent redundant localStorage stringifications and I/O writes
let lastSavedSettings = '';
let lastSavedMedicines = '';
let lastSavedAppointments = '';
let lastSavedReminders = '';

// Safe localStorage helpers with corruption protection
export function loadSeniorSettings(): SeniorSettings {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        lastSavedSettings = saved;
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    }
  } catch (e) {
    console.warn('Could not load settings from storage:', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveSeniorSettings(settings: SeniorSettings): void {
  try {
    const str = JSON.stringify(settings);
    if (str === lastSavedSettings) return; // Skip redundant I/O write
    localStorage.setItem(SETTINGS_KEY, str);
    lastSavedSettings = str;
  } catch (e) {
    console.warn('Could not save settings to storage:', e);
  }
}

export function loadMedicines(): MedicineItem[] {
  try {
    const saved = localStorage.getItem(MEDICINES_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        const valid = parsed.filter(
          (m): m is MedicineItem => Boolean(m && typeof m === 'object' && typeof (m as MedicineItem).id === 'string' && typeof (m as MedicineItem).name === 'string')
        );
        if (valid.length > 0) {
          lastSavedMedicines = saved;
          return valid;
        }
      }
    }
  } catch (e) {
    console.warn('Could not load medicines:', e);
  }
  return INITIAL_DEMO_MEDICINES;
}

export function saveMedicines(medicines: MedicineItem[]): void {
  try {
    const str = JSON.stringify(medicines);
    if (str === lastSavedMedicines) return; // Skip redundant I/O write
    localStorage.setItem(MEDICINES_KEY, str);
    lastSavedMedicines = str;
  } catch (e) {
    console.warn('Could not save medicines:', e);
  }
}

export function loadAppointments(): AppointmentItem[] {
  try {
    const saved = localStorage.getItem(APPOINTMENTS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        const valid = parsed.filter(
          (a): a is AppointmentItem => Boolean(a && typeof a === 'object' && typeof (a as AppointmentItem).id === 'string' && typeof (a as AppointmentItem).doctorOrService === 'string')
        );
        if (valid.length > 0) {
          lastSavedAppointments = saved;
          return valid;
        }
      }
    }
  } catch (e) {
    console.warn('Could not load appointments:', e);
  }
  return INITIAL_DEMO_APPOINTMENTS;
}

export function saveAppointments(appointments: AppointmentItem[]): void {
  try {
    const str = JSON.stringify(appointments);
    if (str === lastSavedAppointments) return; // Skip redundant I/O write
    localStorage.setItem(APPOINTMENTS_KEY, str);
    lastSavedAppointments = str;
  } catch (e) {
    console.warn('Could not save appointments:', e);
  }
}

export function loadReminders(): ReminderItem[] {
  try {
    const saved = localStorage.getItem(REMINDERS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        const valid = parsed.filter(
          (r): r is ReminderItem => Boolean(r && typeof r === 'object' && typeof (r as ReminderItem).id === 'string' && typeof (r as ReminderItem).title === 'string')
        );
        if (valid.length > 0) {
          lastSavedReminders = saved;
          return valid;
        }
      }
    }
  } catch (e) {
    console.warn('Could not load reminders:', e);
  }
  return INITIAL_REMINDERS;
}

export function saveReminders(reminders: ReminderItem[]): void {
  try {
    const str = JSON.stringify(reminders);
    if (str === lastSavedReminders) return; // Skip redundant I/O write
    localStorage.setItem(REMINDERS_KEY, str);
    lastSavedReminders = str;
  } catch (e) {
    console.warn('Could not save reminders:', e);
  }
}

export function resetDemoData(): void {
  try {
    localStorage.removeItem(MEDICINES_KEY);
    localStorage.removeItem(APPOINTMENTS_KEY);
    localStorage.removeItem(REMINDERS_KEY);
    lastSavedMedicines = '';
    lastSavedAppointments = '';
    lastSavedReminders = '';
  } catch (e) {
    console.warn('Could not reset demo data:', e);
  }
}
