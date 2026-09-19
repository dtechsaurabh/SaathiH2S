import { describe, it, expect } from 'vitest';
import { resolveLocalDirectAnswer } from '../services/aiService';
import { MedicineItem, AppointmentItem } from '../types';

describe('Senior Workflow & Problem Statement Alignment Suite', () => {
  const mockMedicines: MedicineItem[] = [
    {
      id: 'med-1',
      name: 'Amlodipine (5mg)',
      dosage: '1 tablet morning',
      time: '08:00 AM',
      frequency: 'Daily',
      instructions: 'After breakfast with water',
      instructionsHi: 'नाश्ते के बाद पानी के साथ',
      status: 'pending',
    },
    {
      id: 'med-2',
      name: 'Metformin (500mg)',
      dosage: '1 tablet evening',
      time: '08:00 PM',
      frequency: 'Daily',
      instructions: 'After dinner',
      instructionsHi: 'रात के खाने के बाद',
      status: 'completed',
    },
  ];

  const mockAppointments: AppointmentItem[] = [
    {
      id: 'app-1',
      doctorOrService: 'Dr. Sharma (Cardiologist)',
      specialty: 'Heart & Blood Pressure Follow-up',
      date: 'Tomorrow',
      time: '10:30 AM',
      location: 'Apex Heart Care, Sector 4',
      status: 'upcoming',
      notes: 'Bring old ECG and BP logs',
    },
  ];

  describe('Natural Senior Query Resolution (Deterministic Local-First)', () => {
    it('resolves "आज मेरा क्या काम है?" instantly without calling Gemini API', () => {
      const responseHi = resolveLocalDirectAnswer('आज मेरा क्या काम है?', 'hi', {
        medicines: mockMedicines,
        appointments: mockAppointments,
      });

      expect(responseHi).not.toBeNull();
      expect(responseHi?.source).toBe('local-companion');
      expect(responseHi?.reply).toContain('आज का Saathi Summary');
      expect(responseHi?.reply).toContain('1 दवाइयाँ बाकी');
      expect(responseHi?.reply).toContain('Dr. Sharma');
      expect(responseHi?.reply).toContain('OTP/PIN');
      expect(responseHi?.steps).toBeDefined();
      expect(responseHi?.steps?.length).toBeGreaterThanOrEqual(3);
    });

    it('resolves English equivalent "What tasks do I have today?" instantly', () => {
      const responseEn = resolveLocalDirectAnswer('What tasks do I have today?', 'en', {
        medicines: mockMedicines,
        appointments: mockAppointments,
      });

      expect(responseEn).not.toBeNull();
      expect(responseEn?.source).toBe('local-companion');
      expect(responseEn?.reply).toContain("Today's Saathi Summary");
      expect(responseEn?.reply).toContain('1 medicine(s) pending');
      expect(responseEn?.reply).toContain('Dr. Sharma');
    });

    it('resolves "मेरी दवा कब है?" with pending medicine name and time', () => {
      const response = resolveLocalDirectAnswer('मेरी दवा कब है?', 'hi', {
        medicines: mockMedicines,
      });

      expect(response).not.toBeNull();
      expect(response?.source).toBe('local-companion');
      expect(response?.reply).toContain('Amlodipine (5mg)');
      expect(response?.reply).toContain('08:00 AM');
      expect(response?.suggestedAction).toBe('open_medicine');
      expect(response?.steps).toBeDefined();
    });

    it('handles empty medicine schedule gracefully with instructions on adding medicines', () => {
      const response = resolveLocalDirectAnswer('मेरी दवा कब है?', 'hi', {
        medicines: [],
      });

      expect(response).not.toBeNull();
      expect(response?.source).toBe('local-companion');
      expect(response?.reply).toContain('वर्तमान में आपकी कोई दवा शेड्यूल नहीं है');
      expect(response?.suggestedAction).toBe('open_medicine');
    });

    it('resolves "कल डॉक्टर के पास जाना है" with 5-step preparation checklist', () => {
      const responseHi = resolveLocalDirectAnswer('कल डॉक्टर के पास जाना है, मुझे क्या तैयारी करनी चाहिए?', 'hi', {
        appointments: mockAppointments,
      });

      expect(responseHi).not.toBeNull();
      expect(responseHi?.source).toBe('local-companion');
      expect(responseHi?.suggestedAction).toBe('open_appointment');
      expect(responseHi?.steps?.length).toBe(5);
      expect(responseHi?.steps?.[0]).toContain('दवाइयों');
      expect(responseHi?.steps?.[1]).toContain('reports');
      expect(responseHi?.steps?.[2]).toContain('लक्षण');
      expect(responseHi?.steps?.[3]).toContain('दवाओं');
      expect(responseHi?.steps?.[4]).toContain('appointment');
    });

    it('resolves "डॉक्टर से क्या पूछूं?" with 4 actionable questions for senior consultation', () => {
      const responseEn = resolveLocalDirectAnswer('What questions should I ask doctor?', 'en', {
        appointments: mockAppointments,
      });

      expect(responseEn).not.toBeNull();
      expect(responseEn?.source).toBe('local-companion');
      expect(responseEn?.steps?.length).toBe(4);
      expect(responseEn?.steps?.[0]).toContain('medicines');
      expect(responseEn?.steps?.[1]).toContain('meals');
      expect(responseEn?.steps?.[2]).toContain('diet');
      expect(responseEn?.steps?.[3]).toContain('follow-up');
    });

    it('resolves "यह मैसेज सुरक्षित है?" by guiding senior to fraud protection and 1930 helpline', () => {
      const responseHi = resolveLocalDirectAnswer('यह मैसेज सुरक्षित है?', 'hi');

      expect(responseHi).not.toBeNull();
      expect(responseHi?.source).toBe('local-companion');
      expect(responseHi?.suggestedAction).toBe('open_scam');
      expect(responseHi?.reply).toContain('1930');
      expect(responseHi?.steps).toBeDefined();
      expect(responseHi?.steps?.join(' ')).toContain('OTP');
    });
  });

  describe('Senior Problem vs. Solution Workflow Coverage', () => {
    it('verifies that all 4 critical problem-statement journeys have automated local or guided fallbacks', () => {
      const journeys = [
        { name: 'Document Understanding', query: 'kaagaz samjhao', expectedAction: 'open_document' },
        { name: 'Scam Protection', query: 'bijli cut message aaya hai', expectedAction: 'open_scam' },
        { name: 'Doctor Visit Prep', query: 'doctor checklist', expectedAction: 'open_appointment' },
        { name: 'Medicine Routine', query: 'dawai ka time', expectedAction: 'open_medicine' },
      ];

      journeys.forEach((j) => {
        const res = resolveLocalDirectAnswer(j.query, 'hi', {
          medicines: mockMedicines,
          appointments: mockAppointments,
        });
        expect(res).not.toBeNull();
        expect(res?.suggestedAction).toBe(j.expectedAction);
      });
    });
  });
});
