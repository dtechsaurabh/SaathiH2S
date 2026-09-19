import { describe, it, expect } from 'vitest';
import { convert24To12Hour, deriveTimeSlot, formatSeniorMedicineTime } from './dateHelpers';

describe('Senior Date & Time Helpers', () => {
  describe('convert24To12Hour', () => {
    it('converts morning 24-hour time to 12-hour AM', () => {
      expect(convert24To12Hour('08:00')).toBe('08:00 AM');
      expect(convert24To12Hour('09:30')).toBe('09:30 AM');
      expect(convert24To12Hour('00:15')).toBe('12:15 AM');
    });

    it('converts afternoon and evening 24-hour time to 12-hour PM', () => {
      expect(convert24To12Hour('12:00')).toBe('12:00 PM');
      expect(convert24To12Hour('13:30')).toBe('01:30 PM');
      expect(convert24To12Hour('20:00')).toBe('08:00 PM');
      expect(convert24To12Hour('21:45')).toBe('09:45 PM');
    });
  });

  describe('deriveTimeSlot', () => {
    it('categorizes times into morning, afternoon, and night slots', () => {
      expect(deriveTimeSlot('08:00')).toBe('morning');
      expect(deriveTimeSlot('11:59')).toBe('morning');
      expect(deriveTimeSlot('12:00')).toBe('afternoon');
      expect(deriveTimeSlot('14:30')).toBe('afternoon');
      expect(deriveTimeSlot('17:00')).toBe('night');
      expect(deriveTimeSlot('21:00')).toBe('night');
    });
  });

  describe('formatSeniorMedicineTime', () => {
    it('formats time for today in Hindi and English', () => {
      const today = new Date().toISOString().split('T')[0];
      const resHi = formatSeniorMedicineTime('08:00 AM', today, '08:00', 'hi');
      expect(resHi).toContain('आज');
      expect(resHi).toContain('08:00 AM');

      const resEn = formatSeniorMedicineTime('08:00 AM', today, '08:00', 'en');
      expect(resEn).toBe('Today at 08:00 AM');
    });

    it('formats time for tomorrow in English', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      const resEn = formatSeniorMedicineTime('01:30 PM', tomorrowStr, '13:30', 'en');
      expect(resEn).toBe('Tomorrow at 01:30 PM');
    });

    it('handles medicines without specific dates with senior-friendly label', () => {
      const resEn = formatSeniorMedicineTime('08:00 PM', undefined, undefined, 'en');
      expect(resEn).toBe('Today at 08:00 PM');
    });
  });
});
