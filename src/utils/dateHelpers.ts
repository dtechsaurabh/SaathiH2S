import { Language } from '../types';

/**
 * Converts a 24-hour time string ("HH:MM") to 12-hour format ("hh:mm AM/PM").
 */
export function convert24To12Hour(time24: string): string {
  if (!time24 || !time24.includes(':')) return time24 || '08:00 AM';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (isNaN(h) || isNaN(m)) return time24;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12;
  const hDisplay = h < 10 ? `0${h}` : `${h}`;
  const mDisplay = m < 10 ? `0${m}` : `${m}`;
  return `${hDisplay}:${mDisplay} ${ampm}`;
}

/**
 * Derives time slot ('morning' | 'afternoon' | 'night') from a 24-hour time string or 12-hour string.
 */
export function deriveTimeSlot(timeStr: string): 'morning' | 'afternoon' | 'night' {
  if (!timeStr) return 'morning';

  let hour = 8;
  if (timeStr.includes(':')) {
    const parts = timeStr.split(':');
    let h = parseInt(parts[0], 10);
    if (timeStr.toUpperCase().includes('PM') && h < 12) h += 12;
    if (timeStr.toUpperCase().includes('AM') && h === 12) h = 0;
    if (!isNaN(h)) hour = h;
  }

  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'night';
}

/**
 * Formats medicine reminder time into a crystal-clear, senior-friendly string.
 * Example outputs:
 *  - Hindi: "आज सुबह 08:00 AM बजे" / "कल दोपहर 01:30 PM बजे"
 *  - English: "Today at 08:00 AM" / "Tomorrow at 01:30 PM"
 */
export function formatSeniorMedicineTime(
  displayTime: string,
  startDate?: string,
  rawTime?: string,
  language: Language = 'hi'
): string {
  const isHindi = language === 'hi';
  const finalTime12 = rawTime ? convert24To12Hour(rawTime) : displayTime || '08:00 AM';

  // Check if startDate is provided
  if (startDate) {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    if (startDate === todayStr) {
      if (isHindi) {
        const slot = deriveTimeSlot(rawTime || displayTime);
        const slotWord = slot === 'morning' ? 'सुबह' : slot === 'afternoon' ? 'दोपहर' : 'रात';
        return `आज ${slotWord} ${finalTime12}`;
      }
      return `Today at ${finalTime12}`;
    }

    if (startDate === tomorrowStr) {
      if (isHindi) {
        const slot = deriveTimeSlot(rawTime || displayTime);
        const slotWord = slot === 'morning' ? 'सुबह' : slot === 'afternoon' ? 'दोपहर' : 'रात';
        return `कल ${slotWord} ${finalTime12}`;
      }
      return `Tomorrow at ${finalTime12}`;
    }

    // Different date
    try {
      const parsedDate = new Date(`${startDate}T12:00:00`);
      const dateFormatted = parsedDate.toLocaleDateString(isHindi ? 'hi-IN' : 'en-US', {
        month: 'short',
        day: 'numeric',
      });
      if (isHindi) {
        return `${dateFormatted} को ${finalTime12}`;
      }
      return `${dateFormatted} at ${finalTime12}`;
    } catch {
      // Fallback
    }
  }

  // Without specific date (e.g. daily routine)
  if (isHindi) {
    const slot = deriveTimeSlot(rawTime || displayTime);
    const slotWord = slot === 'morning' ? 'सुबह' : slot === 'afternoon' ? 'दोपहर' : 'रात';
    return `आज ${slotWord} ${finalTime12}`;
  }
  return `Today at ${finalTime12}`;
}
