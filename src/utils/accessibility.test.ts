import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  loadSeniorSettings,
  saveSeniorSettings,
  DEFAULT_SETTINGS,
} from './storage';
import { SeniorSettings } from '../types';

describe('Senior Accessibility & Preferences Test Suite', () => {
  let mockStore: Record<string, string> = {};

  beforeEach(() => {
    mockStore = {};
    const mockLocalStorage = {
      getItem: (key: string) => mockStore[key] || null,
      setItem: (key: string, val: string) => {
        mockStore[key] = val;
      },
      removeItem: (key: string) => {
        delete mockStore[key];
      },
      clear: () => {
        mockStore = {};
      },
    };

    vi.stubGlobal('localStorage', mockLocalStorage);
  });

  it('loads defaults designed specifically for seniors (large font, Hindi language, sound enabled)', () => {
    const settings = loadSeniorSettings();
    expect(settings.fontSize).toBe('large');
    expect(settings.language).toBe('hi');
    expect(settings.soundEnabled).toBe(true);
    expect(settings.highContrast).toBe(false);
    expect(settings.reduceMotion).toBe(false);
    expect(settings.voiceSpeed).toBe('normal');
  });

  it('handles language switching between Hindi and English with full persistence', () => {
    // Switch to English
    saveSeniorSettings({ ...DEFAULT_SETTINGS, language: 'en' });
    expect(loadSeniorSettings().language).toBe('en');

    // Switch back to Hindi
    saveSeniorSettings({ ...DEFAULT_SETTINGS, language: 'hi' });
    expect(loadSeniorSettings().language).toBe('hi');
  });

  it('handles text size changes (normal, large, xlarge) with persistence', () => {
    // Set to xlarge for seniors with low vision
    saveSeniorSettings({ ...DEFAULT_SETTINGS, fontSize: 'xlarge' });
    expect(loadSeniorSettings().fontSize).toBe('xlarge');

    // Set to normal
    saveSeniorSettings({ ...DEFAULT_SETTINGS, fontSize: 'normal' });
    expect(loadSeniorSettings().fontSize).toBe('normal');
  });

  it('handles High Contrast mode toggle and persistence', () => {
    saveSeniorSettings({ ...DEFAULT_SETTINGS, highContrast: true });
    expect(loadSeniorSettings().highContrast).toBe(true);

    saveSeniorSettings({ ...DEFAULT_SETTINGS, highContrast: false });
    expect(loadSeniorSettings().highContrast).toBe(false);
  });

  it('handles Reduce Motion toggle for vestibular comfort', () => {
    saveSeniorSettings({ ...DEFAULT_SETTINGS, reduceMotion: true });
    expect(loadSeniorSettings().reduceMotion).toBe(true);
  });

  it('handles Read Aloud (soundEnabled) state and voiceSpeed settings', () => {
    // Toggle sound off
    saveSeniorSettings({ ...DEFAULT_SETTINGS, soundEnabled: false });
    expect(loadSeniorSettings().soundEnabled).toBe(false);

    // Set slower speech speed for elders
    saveSeniorSettings({ ...DEFAULT_SETTINGS, voiceSpeed: 'slow', soundEnabled: true });
    const loaded = loadSeniorSettings();
    expect(loaded.soundEnabled).toBe(true);
    expect(loaded.voiceSpeed).toBe('slow');
  });
});
