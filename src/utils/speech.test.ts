import { describe, it, expect, vi, beforeEach } from 'vitest';
import { speakText, stopSpeaking, isSpeaking } from './speech';

describe('Senior Speech Synthesis Utility', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('handles gracefully when window.speechSynthesis is undefined', () => {
    vi.stubGlobal('window', {});
    const result = speakText('नमस्ते', 'hi');
    expect(result).toBe(false);
    expect(isSpeaking()).toBe(false);
  });

  it('cleans markdown symbols and emojis from spoken text', () => {
    const mockSpeak = vi.fn();
    const mockCancel = vi.fn();

    class MockSpeechSynthesisUtterance {
      text: string;
      rate: number = 1;
      pitch: number = 1;
      lang: string = '';
      constructor(text: string) {
        this.text = text;
      }
    }

    vi.stubGlobal('SpeechSynthesisUtterance', MockSpeechSynthesisUtterance);
    vi.stubGlobal('window', {
      speechSynthesis: {
        speak: mockSpeak,
        cancel: mockCancel,
        speaking: false,
        getVoices: () => [],
      },
    });

    const success = speakText('**नमस्ते** 👋 यह 💊 दवाई का *समय* है!', 'hi');
    expect(success).toBe(true);
    expect(mockCancel).toHaveBeenCalled();
    expect(mockSpeak).toHaveBeenCalled();
  });

  it('stops speaking when stopSpeaking is invoked', () => {
    const mockCancel = vi.fn();
    vi.stubGlobal('window', {
      speechSynthesis: {
        cancel: mockCancel,
        speak: vi.fn(),
        speaking: true,
        getVoices: () => [],
      },
    });

    stopSpeaking();
    expect(mockCancel).toHaveBeenCalled();
  });
});
