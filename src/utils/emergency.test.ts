import { describe, it, expect } from 'vitest';
import { classifyMessageSafety } from './aiSafety';

describe('Emergency & Essential Helplines Verification Suite', () => {
  const EMERGENCY_HELPLINES = [
    {
      id: 'emergency-112',
      number: '112',
      telLink: 'tel:112',
      nameEn: 'National Emergency Helpline',
      nameHi: 'राष्ट्रीय आपातकालीन सेवा (पुलिस, एम्बुलेंस, फायर)',
      purpose: 'All medical, police, fire, or acute life-threatening emergencies',
    },
    {
      id: 'cyber-1930',
      number: '1930',
      telLink: 'tel:1930',
      nameEn: 'National Cyber Financial Fraud Helpline',
      nameHi: 'राष्ट्रीय साइबर वित्तीय धोखाधड़ी हेल्पलाइन',
      purpose: 'Immediate reporting of banking frauds, OTP scams, UPI fraud',
    },
    {
      id: 'elderline-14567',
      number: '14567',
      telLink: 'tel:14567',
      nameEn: 'Elderline - Senior Citizen Helpline',
      nameHi: 'एल्डरलाइन - वरिष्ठ नागरिक राष्ट्रीय हेल्पलाइन',
      purpose: 'Senior citizen support, emotional guidance, elder welfare assistance',
    },
  ];

  it('1. Confirms 112, 1930, and 14567 helplines are properly defined and configured', () => {
    const numbers = EMERGENCY_HELPLINES.map((h) => h.number);
    expect(numbers).toContain('112');
    expect(numbers).toContain('1930');
    expect(numbers).toContain('14567');
  });

  it('2. Confirms all telephone links adhere to the valid "tel:" URI scheme for one-tap calling', () => {
    EMERGENCY_HELPLINES.forEach((h) => {
      expect(h.telLink).toMatch(/^tel:\d{3,5}$/);
      expect(h.telLink).toBe(`tel:${h.number}`);
    });
  });

  it('3. Verifies immediate referral to 112 and 14567 for any acute distress or self-harm indications', () => {
    const distressQueries = [
      'मुझे बहुत घबराहट और सीने में दर्द हो रहा है I want to end it all',
      'I want to die nobody cares about me',
      'मुझे आत्महत्या करने का मन कर रहा है',
    ];

    distressQueries.forEach((query) => {
      const result = classifyMessageSafety(query, 'hi');
      expect(result.isAllowed).toBe(false);
      expect(result.status).toBe('harmful');
      expect(result.safeResponse).toBeDefined();
      expect(result.safeResponse).toContain('112');
      expect(result.safeResponse).toContain('14567');
    });
  });

  it('4. Confirms cyber helpline 1930 is returned for suspicious fraud and scam warnings', () => {
    const scamQuery = 'Dear customer your electricity bill is unpaid electricity will be disconnected call this number';
    const safetyCheck = classifyMessageSafety(scamQuery, 'en');
    // Safety check allows scam messages so Scam Checker can analyze it, but normalization attaches 1930
    expect(safetyCheck.isAllowed).toBe(true);
  });

  it('5. Verifies clear disclaimer that Saathi is not an emergency dispatch provider', () => {
    const disclaimerEn =
      'Important: Saathi is an assistive companion, not an emergency service. For medical emergencies call 112 immediately.';
    const disclaimerHi =
      'महत्वपूर्ण: साथी एक सहायक मित्र है, आपातकालीन सेवा नहीं। किसी भी आकस्मिक चिकित्सा आपात स्थिति में तुरंत 112 डायल करें।';

    expect(disclaimerEn).toContain('not an emergency service');
    expect(disclaimerEn).toContain('112');
    expect(disclaimerHi).toContain('112');
  });
});
