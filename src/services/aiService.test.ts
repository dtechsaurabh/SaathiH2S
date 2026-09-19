import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { aiService, resolveLocalDirectAnswer } from './aiService';

describe('AI Service Hardening & Resilience Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Local Direct Answering (Efficiency & No Unnecessary Gemini Calls)', () => {
    it('answers "मेरी दवा कब है?" directly from local state without network call', async () => {
      const mockMedicines = [
        {
          id: 'med-1',
          name: 'Amlodipine (5mg)',
          dosage: '1 गोली',
          time: '08:00 AM',
          instructionsHi: 'नाश्ते के बाद गुनगुने पानी से',
          status: 'pending',
        },
      ];

      const result = await aiService.sendChatMessage(
        'मेरी दवा कब है?',
        'hi',
        'general',
        { medicines: mockMedicines }
      );

      expect(result.source).toBe('local-companion');
      expect(result.reply).toContain('Amlodipine');
      expect(result.reply).toContain('08:00 AM');
      expect(result.suggestedAction).toBe('open_medicine');
    });

    it('answers "When is my medicine?" in English directly from local state', async () => {
      const mockMedicines = [
        {
          id: 'med-2',
          name: 'Metformin (500mg)',
          dosage: '1 tablet',
          time: '01:30 PM',
          instructions: 'After lunch with water',
          status: 'pending',
        },
      ];

      const result = await aiService.sendChatMessage(
        'when is my medicine?',
        'en',
        'general',
        { medicines: mockMedicines }
      );

      expect(result.source).toBe('local-companion');
      expect(result.reply).toContain('Metformin');
      expect(result.reply).toContain('01:30 PM');
    });

    it('answers "कल क्या है?" / tomorrow schedule directly from local appointment state', async () => {
      const mockAppointments = [
        {
          id: 'app-1',
          doctorOrService: 'Dr. Ramesh Sharma',
          specialty: 'हृदय रोग विशेषज्ञ (Cardiologist)',
          date: 'कल (Tomorrow)',
          time: '11:00 AM',
          location: 'Max Healthcare, Saket',
          status: 'upcoming',
        },
      ];

      const result = await aiService.sendChatMessage(
        'कल क्या है?',
        'hi',
        'general',
        { appointments: mockAppointments }
      );

      expect(result.source).toBe('local-companion');
      expect(result.reply).toContain('Dr. Ramesh Sharma');
      expect(result.reply).toContain('11:00 AM');
      expect(result.suggestedAction).toBe('open_appointment');
    });

    it('answers "appointment कैसे बनाऊँ?" with step-by-step guidance locally', async () => {
      const result = await aiService.sendChatMessage(
        'appointment कैसे बनाऊँ?',
        'hi',
        'general'
      );

      expect(result.source).toBe('local-companion');
      expect(result.reply).toContain('साथी में डॉक्टर अपॉइंटमेंट जोड़ना');
      expect(result.steps?.length).toBeGreaterThan(0);
      expect(result.suggestedAction).toBe('open_appointment');
    });
  });

  describe('Chat API Endpoint Integration & Error Recovery', () => {
    it('handles normal successful chat response from server', async () => {
      const mockResponse = {
        reply: 'नमस्ते, मैं आपकी सहायता के लिए तैयार हूँ।',
        steps: ['कदम 1', 'कदम 2'],
        source: 'gemini',
      };

      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        })
      );

      const result = await aiService.sendChatMessage('साधारण सवाल', 'hi');
      expect(result.reply).toBe(mockResponse.reply);
      expect(result.steps).toEqual(mockResponse.steps);
    });

    it('recovers with senior-friendly fallback when API fails or server errors out (500)', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          status: 500,
        })
      );

      const result = await aiService.sendChatMessage('कुछ भी पूछें', 'hi');
      expect(result.source).toBe('fallback');
      expect(result.reply).toContain('बिल्कुल चिंता न करें');
      expect(result.steps?.length).toBeGreaterThan(0);
    });

    it('recovers with fallback when network request times out or aborts', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockRejectedValue(new Error('AbortError: The user aborted a request.'))
      );

      const result = await aiService.sendChatMessage('लंबा सवाल', 'en');
      expect(result.source).toBe('fallback');
      expect(result.reply).toContain('Do not worry at all');
    });

    it('retries transient failures once before falling back', async () => {
      const fetchMock = vi
        .fn()
        .mockRejectedValueOnce(new Error('Transient network glitch'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            reply: 'सफलतापूर्वक प्राप्त हुआ (Retried OK)',
            source: 'gemini',
          }),
        });

      vi.stubGlobal('fetch', fetchMock);

      const result = await aiService.sendChatMessage('पुनः प्रयास टेस्ट', 'hi');
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(result.reply).toContain('Retried OK');
    });
  });

  describe('Scam Checker Hardening & Fallbacks', () => {
    it('normalizes valid scam check response into complete senior-friendly structure', async () => {
      const rawBackendScam = {
        riskLevel: 'HIGH RISK',
        warningSigns: ['Threat of disconnection', 'Unknown link bit.ly'],
        safeAction: ['Do not click link', 'Call official electricity board'],
        simpleExplanation: 'Fraudsters use fake electricity cut threats.',
      };

      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValueOnce({
          ok: true,
          json: async () => rawBackendScam,
        })
      );

      const result = await aiService.checkScam(
        'Electricity will be disconnected tonight. Call 9876543210',
        'en'
      );

      expect(result.riskLevel).toBe('HIGH RISK');
      expect(result.cyberHelpline).toBe('1930');
      expect(result.warningSigns).toContain('Threat of disconnection');
      expect(result.disclaimer).toContain('Saathi AI provides guidance and does not guarantee');
    });

    it('rejects empty and whitespace inputs with a clear error without calling network', async () => {
      const fetchSpy = vi.fn();
      vi.stubGlobal('fetch', fetchSpy);

      await expect(aiService.checkScam('   ', 'hi')).rejects.toThrow('कृपया पहले वह SMS');
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('provides safe normalized fallback when scam API throws or returns invalid response', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockRejectedValue(new Error('Network disconnected'))
      );

      const result = await aiService.checkScam('कुछ संदिग्ध मैसेज यहाँ है', 'hi');
      expect(result.riskLevel).toBe('UNKNOWN / NEEDS REVIEW');
      expect(result.cyberHelpline).toBe('1930');
      expect(result.helpline).toContain('1930');
      expect(result.disclaimer).toContain('गारंटी नहीं देता');
    });
  });

  describe('Document Explainer Fallbacks', () => {
    it('provides clear fallback explanations if document explanation endpoint fails', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockRejectedValue(new Error('Server overloaded'))
      );

      const result = await aiService.explainDocument('Pension life certificate notice text', 'hi');
      expect(result.simpleExplanation).toBeDefined();
      expect(result.importantThings.length).toBeGreaterThan(0);
      expect(result.actionSteps.length).toBeGreaterThan(0);
      expect(result.safetyDisclaimer).toContain('Saathi provides this AI-powered summary');
    });
  });

  describe('Appointment Preparation Fallbacks', () => {
    it('provides checklist and questions fallback when appointment prep endpoint fails', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockRejectedValue(new Error('Server timeout'))
      );

      const result = await aiService.prepareAppointment(
        'Dr. Sharma',
        { date: 'कल', time: '11:00 AM' },
        'hi'
      );

      expect(result.checklist.length).toBeGreaterThan(0);
      expect(result.questionsToAsk.length).toBeGreaterThan(0);
      expect(result.comfortTips.length).toBeGreaterThan(0);
      expect(result.bookingNotice).toContain('साथी अस्पताल या क्लीनिक में सीधे बुकिंग नहीं करता');
    });
  });
});
