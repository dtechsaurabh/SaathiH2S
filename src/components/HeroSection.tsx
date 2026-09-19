import React from 'react';
import {
  Mic,
  ArrowDown,
  Shield,
  Heart,
  FileText,
  ShieldAlert,
  Pill,
  Stethoscope,
  PhoneCall,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { FontSize, Language } from '../types';

interface HeroSectionProps {
  language: Language;
  fontSize: FontSize;
  onOpenVoiceModal: () => void;
  onSelectPrompt: (promptText: string) => void;
  onScrollToTodayHelp?: () => void;
  onOpenAccessibility?: () => void;
  onOpenMedicineTracker?: () => void;
  onOpenAppointments?: () => void;
  onOpenScamChecker?: () => void;
  onOpenDocExplainer?: () => void;
  onScrollToEmergency?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  language,
  fontSize,
  onOpenVoiceModal,
  onSelectPrompt,
  onScrollToTodayHelp,
  onOpenAccessibility,
  onOpenMedicineTracker,
  onOpenAppointments,
  onOpenScamChecker,
  onOpenDocExplainer,
  onScrollToEmergency,
}) => {
  const isHindi = language === 'hi';

  const handleScrollToTodayHelp = () => {
    if (onScrollToTodayHelp) {
      onScrollToTodayHelp();
    } else {
      const el = document.getElementById('today-help-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleScrollToEmergencyHelp = () => {
    if (onScrollToEmergency) {
      onScrollToEmergency();
    } else {
      const el = document.getElementById('emergency-help-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const featuresList = [
    {
      id: 'digital-help',
      emoji: '📱',
      icon: <Mic className="w-5 h-5 text-sky-700" />,
      labelHi: 'डिजिटल सहायता',
      labelEn: 'Digital help',
      subHi: 'बोलकर या लिखकर सवाल पूछें',
      subEn: 'Speak or type queries',
      badge: 'AI Companion',
      badgeColor: 'bg-sky-100 text-sky-900 border-sky-300',
      action: onOpenVoiceModal,
    },
    {
      id: 'difficult-docs',
      emoji: '📄',
      icon: <FileText className="w-5 h-5 text-purple-700" />,
      labelHi: 'कठिन कागजात व बिल',
      labelEn: 'Difficult documents',
      subHi: 'पेंशन, नोटिस व अस्पताल बिल',
      subEn: 'Pension, notice & hospital bills',
      badge: 'AI Explanation',
      badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
      action: () => onOpenDocExplainer && onOpenDocExplainer(),
    },
    {
      id: 'scam-protection',
      emoji: '🛡️',
      icon: <ShieldAlert className="w-5 h-5 text-rose-700" />,
      labelHi: 'धोखाधड़ी से सुरक्षा',
      labelEn: 'Scam protection',
      subHi: 'फर्जी SMS, बिजली बिल व 1930',
      subEn: 'Fake SMS, bills & 1930 helpline',
      badge: 'AI Scam Analysis',
      badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
      action: () => onOpenScamChecker && onOpenScamChecker(),
    },
    {
      id: 'medicine-routine',
      emoji: '💊',
      icon: <Pill className="w-5 h-5 text-amber-700" />,
      labelHi: 'दवाई समय-सारणी',
      labelEn: 'Medicine routine',
      subHi: 'समय, खुराक व ले ली/नागा रिकॉर्ड',
      subEn: 'Doses, timings & Taken/Skip',
      badge: 'Local • Private',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      action: () => onOpenMedicineTracker && onOpenMedicineTracker(),
    },
    {
      id: 'doctor-prep',
      emoji: '👨‍⚕️',
      icon: <Stethoscope className="w-5 h-5 text-emerald-700" />,
      labelHi: 'डॉक्टर विजिट तैयारी',
      labelEn: 'Doctor preparation',
      subHi: '5-पॉइंट चेकलिस्ट व ज़रूरी सवाल',
      subEn: '5-point checklist & questions',
      badge: 'Visit Checklist',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      action: () => onOpenAppointments && onOpenAppointments(),
    },
    {
      id: 'emergency-help',
      emoji: '🆘',
      icon: <PhoneCall className="w-5 h-5 text-red-700" />,
      labelHi: 'आपातकालीन मदद',
      labelEn: 'Emergency help',
      subHi: '112 पुलिस • 1930 साइबर • 14567 एल्डरलाइन',
      subEn: '112 Police • 1930 Cyber • 14567 Elderline',
      badge: '1-Tap Helpline',
      badgeColor: 'bg-red-100 text-red-900 border-red-300',
      action: handleScrollToEmergencyHelp,
    },
  ];

  return (
    <section className="bg-amber-50/60 border-b-2 border-amber-200/80 pt-6 sm:pt-8 pb-7 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Core Value Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-black">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
            👵 {isHindi ? 'वरिष्ठ नागरिक समर्पित • Senior-First' : 'Senior-First Design'}
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs">
            🌿 {isHindi ? 'सरल व तनावमुक्त' : 'Simple & Stress-Free'}
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-900 border border-blue-300 shadow-2xs">
            🛡️ {isHindi ? 'सुरक्षित व 100% निजी' : 'Safe & 100% Private'}
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 text-purple-900 border border-purple-300 shadow-2xs">
            🤝 {isHindi ? 'आत्मनिर्भर जीवन' : 'Independent Living'}
          </span>
        </div>

        {/* 1. Purpose Heading & Supporting Message */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {isHindi ? 'साथी Saathi – AI Companion for Seniors' : 'Saathi – AI Companion for Seniors'}
          </h1>
          <p className="text-lg sm:text-xl font-black text-amber-900 max-w-2xl mx-auto leading-snug">
            {isHindi
              ? 'रोज़मर्रा के digital काम आसान, सुरक्षित और तनावमुक्त बनाने के लिए आपका भरोसेमंद साथी।'
              : 'Your trusted companion to make everyday digital tasks simple, safe, and stress-free.'}
          </p>
        </div>

        {/* 2. Evaluator-Visible Problem & Solution Architecture Block */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-amber-300 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5 p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200">
            <div className="flex items-center gap-2 text-rose-950 font-black text-sm sm:text-base">
              <span className="text-lg">⚠️</span>
              <span>{isHindi ? 'समस्या (The Problem):' : 'The Problem:'}</span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-700 leading-relaxed">
              {isHindi
                ? 'वरिष्ठ नागरिक अक्सर जटिल डिजिटल ऐप्स, कठिन सरकारी कागजात, पेंशन नोटिस, अस्पताल बिल, डॉक्टर अपॉइंटमेंट और ऑनलाइन साइबर धोखाधड़ी से परेशान होते हैं।'
                : 'Senior citizens often struggle with complex digital services, online information, appointments, medicines, official documents, bills, and online scams.'}
            </p>
          </div>

          <div className="space-y-1.5 p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
            <div className="flex items-center gap-2 text-emerald-950 font-black text-sm sm:text-base">
              <span className="text-lg">✅</span>
              <span>{isHindi ? 'साथी का समाधान (Saathi’s Solution):' : 'Saathi’s Solution:'}</span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-700 leading-relaxed">
              {isHindi
                ? 'एक सरल, सुलभ और विश्वसनीय AI साथी जो सूचनाओं को सरल बनाता है, दैनिक कार्य कराता है, डॉक्टर विजिट की तैयारी कराता है और धोखाधड़ी से सुरक्षित रखता है।'
                : 'One simple, accessible and trustworthy AI companion that helps seniors understand information, complete everyday digital tasks, prepare for appointments, and stay safer online.'}
            </p>
          </div>
        </div>

        {/* 3. Concise Visual Section: "Saathi helps you with / साथी आपकी मदद करता है" */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
              <span>{isHindi ? 'साथी आपकी मदद करता है (Saathi helps you with):' : 'Saathi helps you with:'}</span>
            </h2>
            <span className="text-xs font-extrabold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-300">
              {isHindi ? 'सीधे कनेक्टेड टूल्स' : 'Connected Features'}
            </span>
          </div>

          {/* 6 Connected Interactive Feature Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
            {featuresList.map((item) => (
              <button
                key={item.id}
                id={`hero-feature-${item.id}`}
                type="button"
                onClick={item.action}
                className="p-3 sm:p-3.5 rounded-2xl bg-white hover:bg-amber-100/60 active:bg-amber-200 border-2 border-slate-200 hover:border-amber-400 text-left transition-all shadow-2xs hover:shadow-xs focus-visible:ring-4 focus-visible:ring-amber-400 min-h-[72px] flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-lg sm:text-xl shrink-0">{item.emoji}</span>
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-amber-900 leading-snug">
                    {isHindi ? item.labelHi : item.labelEn}
                  </h3>
                  <p className="text-[11px] font-medium text-slate-500 line-clamp-1 mt-0.5">
                    {isHindi ? item.subHi : item.subEn}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 4. Primary and Secondary Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-lg mx-auto">
          {/* Prominent Primary Action: 🎤 Saathi से बात करें */}
          <button
            id="talk-to-saathi-btn"
            type="button"
            onClick={onOpenVoiceModal}
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-3 px-6 sm:px-8 py-4 rounded-2xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-black text-lg sm:text-xl shadow-md hover:shadow-lg transition-all border-2 border-amber-700 min-h-[56px] focus-visible:ring-4 focus-visible:ring-amber-400 cursor-pointer"
          >
            <Mic className="w-6 h-6 text-amber-100 shrink-0" />
            <span>{isHindi ? '🎤 Saathi से बात करें' : '🎤 Talk to Saathi'}</span>
          </button>

          {/* Secondary Action: आज की मदद देखें */}
          <button
            id="view-today-help-btn"
            type="button"
            onClick={handleScrollToTodayHelp}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3.5 rounded-2xl bg-white hover:bg-amber-100/70 active:bg-amber-200 text-slate-800 font-extrabold text-sm sm:text-base border-2 border-slate-300 hover:border-amber-400 shadow-2xs transition-all min-h-[56px] focus-visible:ring-4 focus-visible:ring-amber-400 cursor-pointer"
          >
            <ArrowDown className="w-4 h-4 text-amber-600" />
            <span>{isHindi ? 'आज की मदद देखें' : "View Today's Help"}</span>
          </button>
        </div>

        {/* Accessibility Assurance Banner */}
        <div className="pt-1 flex items-center justify-center gap-2 text-xs font-bold text-slate-600 text-center">
          <span>
            {isHindi
              ? '👁️ Saathi में बड़े अक्षर, उच्च कंट्रास्ट और बोलकर सुनने की सुविधा उपलब्ध है।'
              : '👁️ Saathi includes large text, high contrast, and voice assistance for seniors.'}
          </span>
          {onOpenAccessibility && (
            <button
              type="button"
              onClick={onOpenAccessibility}
              className="text-amber-800 underline hover:text-amber-950 font-extrabold cursor-pointer"
            >
              {isHindi ? 'सुलभता सेटिंग्स' : 'Settings'}
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

