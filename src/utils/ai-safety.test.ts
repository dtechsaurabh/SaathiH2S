import { describe, it, expect } from 'vitest';
import {
  validateScamInput,
  classifyMessageSafety,
  normalizeScamResult,
} from './aiSafety';

describe('Senior AI Safety Guardrails & Input Validation', () => {
  describe('validateScamInput', () => {
    it('rejects empty or whitespace-only inputs with senior-friendly error message in Hindi and English', () => {
      const emptyResultHi = validateScamInput('', 'hi');
      expect(emptyResultHi.isValid).toBe(false);
      expect(emptyResultHi.error).toContain('कृपया पहले वह SMS');

      const whitespaceResultEn = validateScamInput('   \n\t  ', 'en');
      expect(whitespaceResultEn.isValid).toBe(false);
      expect(whitespaceResultEn.error).toContain('Please write or paste');

      const nullResult = validateScamInput(null, 'hi');
      expect(nullResult.isValid).toBe(false);
    });

    it('accepts valid suspicious SMS messages and trims whitespace', () => {
      const input = '   Dear customer, your electricity will be cut at 9:30 PM. Click bit.ly/3x   ';
      const result = validateScamInput(input, 'en');
      expect(result.isValid).toBe(true);
      expect(result.sanitizedText).toBe('Dear customer, your electricity will be cut at 9:30 PM. Click bit.ly/3x');
      expect(result.error).toBeUndefined();
    });

    it('handles excessively long inputs safely by rejecting with a clear warning', () => {
      const hugeInput = 'A'.repeat(6000);
      const result = validateScamInput(hugeInput, 'en');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Message is too long');
    });
  });

  describe('classifyMessageSafety (Chat Guardrails)', () => {
    it('allows normal safe queries and greeting questions from seniors', () => {
      const res1 = classifyMessageSafety('नमस्ते साथी, आज का मौसम कैसा है?', 'hi');
      expect(res1.isAllowed).toBe(true);
      expect(res1.status).toBe('safe');

      const res2 = classifyMessageSafety('Can you explain what an OTP is?', 'en');
      expect(res2.isAllowed).toBe(true);
      expect(res2.status).toBe('safe');
    });

    it('intercepts abusive and profanity-laden inputs with a calm, polite refusal', () => {
      const resAbuseEn = classifyMessageSafety('fuck you idiot bot', 'en');
      expect(resAbuseEn.isAllowed).toBe(false);
      expect(resAbuseEn.status).toBe('abusive');
      expect(resAbuseEn.safeResponse).toContain('respectful and safe conversation');

      const resAbuseHi = classifyMessageSafety('तू कुत्ता है कमीने', 'hi');
      expect(resAbuseHi.isAllowed).toBe(false);
      expect(resAbuseHi.status).toBe('abusive');
      expect(resAbuseHi.safeResponse).toContain('सम्मानजनक और सुरक्षित बातचीत');
    });

    it('intercepts self-harm and distress with emergency helplines 112 and 14567', () => {
      const resHarm = classifyMessageSafety('I want to kill myself', 'en');
      expect(resHarm.isAllowed).toBe(false);
      expect(resHarm.status).toBe('harmful');
      expect(resHarm.safeResponse).toContain('112');
      expect(resHarm.safeResponse).toContain('14567');
    });

    it('supports frustrated seniors without blocking them', () => {
      const resFrustrated = classifyMessageSafety('यह बैंक वाले बहुत परेशान कर रहे हैं समझ नहीं आ रहा', 'hi');
      expect(resFrustrated.isAllowed).toBe(true);
      expect(resFrustrated.status).toBe('frustrated');
    });
  });

  describe('normalizeScamResult (Structured Output Guarantee)', () => {
    it('produces a structured senior-friendly result even if AI returns partial or messy output', () => {
      const rawMessy = {
        risk: 'HIGH',
        warningSigns: 'Immediate disconnection threat',
        safeAction: 'Do not click the link',
        explanation: 'The SMS uses fake urgency to steal money.',
      };

      const normalized = normalizeScamResult(rawMessy, 'en');
      expect(normalized.riskLevel).toBe('HIGH RISK');
      expect(Array.isArray(normalized.warningSigns)).toBe(true);
      expect(normalized.warningSigns.length).toBeGreaterThan(0);
      expect(Array.isArray(normalized.safeAction)).toBe(true);
      expect(normalized.safeAction.length).toBeGreaterThan(0);
      expect(normalized.cyberHelpline).toBe('1930');
      expect(normalized.explanation).toBe('The SMS uses fake urgency to steal money.');
    });

    it('defaults gracefully to structured warning signs and safe actions if raw response is empty', () => {
      const normalizedHi = normalizeScamResult(null, 'hi');
      expect(normalizedHi.riskLevel).toBe('UNKNOWN / NEEDS REVIEW');
      expect(normalizedHi.warningSigns.length).toBeGreaterThan(0);
      expect(normalizedHi.safeAction.length).toBeGreaterThan(0);
      expect(normalizedHi.cyberHelpline).toBe('1930');
      expect(normalizedHi.helpline).toContain('1930');
      expect(normalizedHi.disclaimer).toContain('गारंटी नहीं देता');
    });
  });

  describe('Official Helpline Standards', () => {
    it('guarantees emergency cyber helpline 1930 and elderline 14567 are configured', () => {
      const CYBER_FRAUD_HELPLINE = '1930';
      const ELDERLINE_HELPLINE = '14567';

      expect(CYBER_FRAUD_HELPLINE).toBe('1930');
      expect(ELDERLINE_HELPLINE).toBe('14567');
    });
  });
});
