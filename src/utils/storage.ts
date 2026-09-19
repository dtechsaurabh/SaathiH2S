import { SeniorSettings, MedicineItem, AppointmentItem, ReminderItem } from '../types';
import { INITIAL_REMINDERS } from '../data/featureData';

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

const SETTINGS_KEY = 'saathi_senior_settings_v2';
const MEDICINES_KEY = 'saathi_medicines_v2';
const APPOINTMENTS_KEY = 'saathi_appointments_v2';
const REMINDERS_KEY = 'saathi_reminders_v2';

// Safe localStorage helpers
export function loadSeniorSettings(): SeniorSettings {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (e) {
    console.warn('Could not load settings from storage:', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveSeniorSettings(settings: SeniorSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Could not save settings to storage:', e);
  }
}

export function loadMedicines(): MedicineItem[] {
  try {
    const saved = localStorage.getItem(MEDICINES_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Could not load medicines:', e);
  }
  return INITIAL_DEMO_MEDICINES;
}

export function saveMedicines(medicines: MedicineItem[]): void {
  try {
    localStorage.setItem(MEDICINES_KEY, JSON.stringify(medicines));
  } catch (e) {
    console.warn('Could not save medicines:', e);
  }
}

export function loadAppointments(): AppointmentItem[] {
  try {
    const saved = localStorage.getItem(APPOINTMENTS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Could not load appointments:', e);
  }
  return INITIAL_DEMO_APPOINTMENTS;
}

export function saveAppointments(appointments: AppointmentItem[]): void {
  try {
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
  } catch (e) {
    console.warn('Could not save appointments:', e);
  }
}

export function loadReminders(): ReminderItem[] {
  try {
    const saved = localStorage.getItem(REMINDERS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Could not load reminders:', e);
  }
  return INITIAL_REMINDERS;
}

export function saveReminders(reminders: ReminderItem[]): void {
  try {
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
  } catch (e) {
    console.warn('Could not save reminders:', e);
  }
}

export function resetDemoData(): void {
  try {
    localStorage.removeItem(MEDICINES_KEY);
    localStorage.removeItem(APPOINTMENTS_KEY);
    localStorage.removeItem(REMINDERS_KEY);
  } catch (e) {
    console.warn('Could not reset demo data:', e);
  }
}
