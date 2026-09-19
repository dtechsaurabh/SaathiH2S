export type FontSize = 'normal' | 'large' | 'xlarge';
export type Language = 'hi' | 'en';

export interface SeniorSettings {
  fontSize: FontSize;
  language: Language;
  soundEnabled: boolean;
  highContrast: boolean;
  reduceMotion: boolean;
  voiceSpeed?: 'slow' | 'normal';
}

export interface MedicineItem {
  id: string;
  name: string;
  dosage: string;
  time: string;
  rawTime?: string;
  startDate?: string;
  timeSlot: 'morning' | 'afternoon' | 'night';
  frequency: string;
  frequencyHi?: string;
  status: 'pending' | 'taken' | 'skipped';
  statusTimestamp?: string;
  instructions?: string;
  instructionsHi?: string;
  isDemo?: boolean;
}

export interface AppointmentItem {
  id: string;
  doctorOrService: string;
  specialty: string;
  date: string;
  time: string;
  location: string;
  notes?: string;
  status: 'upcoming' | 'completed';
  isDemo?: boolean;
  preparationChecklist?: string[];
  questionsToAsk?: string[];
}

export interface ReminderItem {
  id: string;
  title: string;
  titleHi?: string;
  time: string;
  timeLabel: string;
  timeLabelHi: string;
  category: 'medicine' | 'doctor' | 'family' | 'task';
  completed: boolean;
  status?: 'pending' | 'taken' | 'skipped' | 'done';
  notes?: string;
  notesHi?: string;
  important?: boolean;
  isDemo?: boolean;
}

export interface FeatureCardInfo {
  id: 'doctor' | 'medicine' | 'scam' | 'document';
  title: string;
  titleHi: string;
  subtitle: string;
  subtitleHi: string;
  iconName: string;
  colorTheme: {
    bg: string;
    border: string;
    badgeBg: string;
    badgeText: string;
    iconColor: string;
  };
  samplePrompts: {
    hi: string;
    en: string;
  }[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'saathi';
  text: string;
  steps?: string[];
  precautions?: string[];
  clarificationQuestion?: string;
  actionDisclaimer?: string;
  timestamp: string;
  source?: 'gemini' | 'local-companion' | 'fallback';
  actionLink?: {
    label: string;
    labelHi?: string;
    feature: 'doctor' | 'medicine' | 'scam' | 'document';
  };
}

export type ScamRiskLevel = 'HIGH RISK' | 'MEDIUM RISK' | 'LOW RISK' | 'UNKNOWN / NEEDS REVIEW' | 'High' | 'Medium' | 'Low';

export interface ScamAnalysisResult {
  riskLevel: ScamRiskLevel;
  riskLabelHi: string;
  warningSigns: string[];
  explanation: string;
  recommendedActions: string[];
  safeAction: string[];
  disclaimer: string;
  helpline: string;
  cyberHelpline: string;
}

export interface DocumentAnalysisResult {
  simpleExplanation: string;
  importantThings: string[];
  importantDates?: string[];
  actionSteps: string[];
  precautions?: string[];
  difficultWords: Array<{ term: string; explanation: string }>;
  safetyDisclaimer: string;
  sourceBreakdown?: {
    foundInText: string[];
    aiExplanation: string;
    missingOrUncertain: string[];
  };
}

export interface AppointmentPrepResult {
  checklist: string[];
  questionsToAsk: string[];
  comfortTips: string[];
  bookingNotice: string;
}

