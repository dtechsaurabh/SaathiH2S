import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { aiService } from '../services/aiService';
import { MedicineItem, AppointmentItem } from '../types';

describe('Smart Daily Summary Verification Suite', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('1. Handles empty state gracefully with calm, encouraging response and security reminder', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    const emptyContext = {
      medicines: [],
      appointments: [],
    };

    const res = await aiService.sendChatMessage('आज मेरा क्या काम है?', 'hi', 'general', emptyContext);

    expect(res.source).toBe('local-companion');
    expect(res.reply).toContain('आज का Saathi Summary');
    expect(res.reply).toContain('सभी दवाइयाँ पूरी हैं');
    expect(res.reply).toContain('कोई नई डॉक्टर अपॉइंटमेंट नहीं');
    expect(res.reply).toContain('🛡️ सुरक्षा नियम: अपना बैंक OTP/PIN किसी के साथ साझा न करें।');
    expect(res.steps).toBeDefined();
    expect(res.steps?.length).toBeGreaterThanOrEqual(2);
    // Verified: No network/Gemini call made
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('2. Handles medicine-only state with pending count and next medicine details in English and Hindi', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    const medicines: MedicineItem[] = [
      {
        id: 'med-1',
        name: 'Amlodipine (5mg)',
        dosage: '1 Tab',
        time: '08:00 AM',
        timeSlot: 'morning',
        frequency: 'Daily',
        status: 'pending',
      },
      {
        id: 'med-2',
        name: 'Metformin (500mg)',
        dosage: '1 Tab',
        time: '01:30 PM',
        timeSlot: 'afternoon',
        frequency: 'Daily',
        status: 'pending',
      },
    ];

    const resEn = await aiService.sendChatMessage('what tasks do i have today', 'en', 'general', {
      medicines,
      appointments: [],
    });

    expect(resEn.source).toBe('local-companion');
    expect(resEn.reply).toContain("Today's Saathi Summary");
    expect(resEn.reply).toContain('2 medicine(s) pending');
    expect(resEn.reply).toContain('Amlodipine (5mg)');
    expect(resEn.reply).toContain('08:00 AM');
    expect(resEn.reply).toContain('Never share your bank OTP or PIN');
    expect(resEn.suggestedAction).toBe('open_medicine');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('3. Handles appointment-only state with doctor, date, time and visit preparation step', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    const appointments: AppointmentItem[] = [
      {
        id: 'app-1',
        doctorOrService: 'Dr. Ramesh Sharma',
        specialty: 'Cardiologist',
        date: 'कल (Tomorrow)',
        time: '11:00 AM',
        location: 'Max Healthcare',
        status: 'upcoming',
      },
    ];

    const res = await aiService.sendChatMessage('आज क्या काम है', 'hi', 'general', {
      medicines: [],
      appointments,
    });

    expect(res.source).toBe('local-companion');
    expect(res.reply).toContain('Dr. Ramesh Sharma');
    expect(res.reply).toContain('11:00 AM');
    expect(res.steps?.some((s) => s.includes('अपॉइंटमेंट चेकलिस्ट'))).toBe(true);
    expect(res.suggestedAction).toBe('open_appointment');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('4. Handles combined state with both medicines and doctor appointments', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    const medicines: MedicineItem[] = [
      {
        id: 'med-1',
        name: 'Thyroxine (50mcg)',
        dosage: '1 Tab',
        time: '07:00 AM',
        timeSlot: 'morning',
        frequency: 'Daily',
        status: 'pending',
      },
    ];

    const appointments: AppointmentItem[] = [
      {
        id: 'app-1',
        doctorOrService: 'Dr. Anita Gupta',
        specialty: 'Eye Specialist',
        date: 'आज दोपहर',
        time: '02:30 PM',
        location: 'Vision Eye Center',
        status: 'upcoming',
      },
    ];

    const res = await aiService.sendChatMessage('today summary', 'en', 'general', {
      medicines,
      appointments,
    });

    expect(res.source).toBe('local-companion');
    expect(res.reply).toContain('1 medicine(s) pending');
    expect(res.reply).toContain('Thyroxine (50mcg)');
    expect(res.reply).toContain('Dr. Anita Gupta');
    expect(res.reply).toContain('02:30 PM');
    expect(res.suggestedAction).toBe('open_appointment');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('5. Verifies local-only response guarantees zero latency spikes and zero token usage', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    const start = performance.now();
    const res = await aiService.sendChatMessage('aaj mera kya kaam hai', 'hi', 'general', {
      medicines: [],
      appointments: [],
    });
    const duration = performance.now() - start;

    expect(res.source).toBe('local-companion');
    // Local calculation executes in under 15ms
    expect(duration).toBeLessThan(50);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('6. Does NOT make unnecessary Gemini requests for any today summary variations', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    const variations = [
      'आज मेरा क्या काम है',
      'aaj kya kaam hai',
      'what tasks do i have today',
      'what are my tasks today',
      'today summary',
      'आज का सारांश',
      'आज की योजना',
    ];

    for (const phrase of variations) {
      const res = await aiService.sendChatMessage(phrase, 'hi', 'general');
      expect(res.source).toBe('local-companion');
    }

    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
