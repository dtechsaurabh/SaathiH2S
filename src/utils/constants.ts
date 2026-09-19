/**
 * Centralized Application Constants for Saathi – AI Companion for Seniors
 */

// Official National Helplines in India
export const HELPLINES = {
  SENIOR_CITIZEN: '14567',
  CYBER_CRIME: '1930',
  EMERGENCY: '112',
} as const;

// Input Sanitization & Character Limits
export const INPUT_LIMITS = {
  CHAT_MESSAGE_MAX_CHARS: 2000,
  SCAM_TEXT_MAX_CHARS: 5000,
  DOCUMENT_TEXT_MAX_CHARS: 5000,
} as const;

// Network, Retry & Resilience Constants
export const NETWORK_CONFIG = {
  CLIENT_TIMEOUT_MS: 16000,
  SERVER_GEMINI_TIMEOUT_MS: 18000,
  MAX_RETRIES: 1,
  RETRY_BACKOFF_MS: 800,
  RATE_LIMIT_WINDOW_MS: 60 * 1000,
  RATE_LIMIT_MAX_REQUESTS: 60,
} as const;

// LocalStorage Persistence Keys
export const STORAGE_KEYS = {
  SETTINGS: 'saathi_senior_settings_v2',
  MEDICINES: 'saathi_medicines_v2',
  APPOINTMENTS: 'saathi_appointments_v2',
  REMINDERS: 'saathi_reminders_v2',
} as const;

// Senior Speech Pacing Configuration
export const SPEECH_CONFIG = {
  RATE_NORMAL: 0.9,
  RATE_SLOW: 0.75,
  PITCH_DEFAULT: 1.0,
  RAPID_CLICK_THROTTLE_MS: 300,
} as const;
