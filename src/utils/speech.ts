/**
 * Speech synthesis utility designed for senior accessibility.
 * Plays calm, clear audio in Hindi or English.
 */

let currentUtterance: SpeechSynthesisUtterance | null = null;

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
}

export function speakText(
  text: string,
  language: 'hi' | 'en' | 'hinglish' = 'hi',
  onEnd?: () => void,
  voiceSpeed: 'slow' | 'normal' = 'normal'
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported on this device');
    return false;
  }

  try {
    stopSpeaking();

    // Clean markdown stars, hashes, and emojis for cleaner speech
    const cleanedText = text
      .replace(/[*#_~`]/g, '')
      .replace(/[🩺💊🚨📄👋🎤❤️✨⚠️🔔👴👵]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanedText) return false;

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    currentUtterance = utterance;

    // Senior-friendly pacing: relaxed rate (0.75 for slow, 0.9 for normal)
    utterance.rate = voiceSpeed === 'slow' ? 0.75 : 0.9;
    utterance.pitch = 1.0;

    // Voice selection
    const voices = window.speechSynthesis.getVoices();
    if (language === 'hi' || language === 'hinglish') {
      const hindiVoice = voices.find(v => v.lang.startsWith('hi') || v.name.toLowerCase().includes('hindi') || v.name.toLowerCase().includes('india'));
      if (hindiVoice) {
        utterance.voice = hindiVoice;
      }
      utterance.lang = 'hi-IN';
    } else {
      const engVoice = voices.find(v => v.lang.startsWith('en-IN') || v.lang.startsWith('en-GB') || v.lang.startsWith('en'));
      if (engVoice) {
        utterance.voice = engVoice;
      }
      utterance.lang = 'en-IN';
    }

    utterance.onend = () => {
      currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn('Speech error:', e);
      currentUtterance = null;
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.error('Speech synthesis exception:', err);
    return false;
  }
}

export function isSpeaking(): boolean {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    return window.speechSynthesis.speaking;
  }
  return false;
}
