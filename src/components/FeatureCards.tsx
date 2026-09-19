import React from 'react';
import {
  Stethoscope,
  Pill,
  ShieldAlert,
  FileText,
  Mic,
  ArrowRight,
} from 'lucide-react';
import { FontSize, Language, FeatureCardInfo } from '../types';

interface FeatureCardsProps {
  language: Language;
  fontSize: FontSize;
  onSelectFeature: (featureId: FeatureCardInfo['id']) => void;
  onOpenVoiceModal?: () => void;
}

export const FeatureCards: React.FC<FeatureCardsProps> = ({
  language,
  fontSize,
  onSelectFeature,
  onOpenVoiceModal,
}) => {
  const isHindi = language === 'hi';

  const actions = [
    {
      id: 'medicine' as const,
      icon: <Pill className="w-8 h-8 text-amber-700" />,
      emoji: '💊',
      title: isHindi ? '💊 मेरी दवाइयाँ' : '💊 My Medicines',
      subtitle: isHindi ? 'दवाइयों का समय, खुराक और ट्रैकिंग' : 'Medicine timings, doses & daily tracking',
      secondaryLabel: isHindi ? 'My Medicines' : 'Schedule & Tracker',
      bgClass: 'bg-amber-50 hover:bg-amber-100/90 border-amber-300',
      tagColor: 'text-amber-900 bg-amber-100',
      action: () => onSelectFeature('medicine'),
    },
    {
      id: 'doctor' as const,
      icon: <Stethoscope className="w-8 h-8 text-emerald-700" />,
      emoji: '📅',
      title: isHindi ? '📅 अपॉइंटमेंट' : '📅 Appointments',
      subtitle: isHindi ? 'डॉक्टर विजिट, चेकलिस्ट व पूछने वाले सवाल' : 'Doctor visits, checklist & prep questions',
      secondaryLabel: isHindi ? 'Appointments' : 'Doctor Visits & Prep',
      bgClass: 'bg-emerald-50 hover:bg-emerald-100/90 border-emerald-300',
      tagColor: 'text-emerald-900 bg-emerald-100',
      action: () => onSelectFeature('doctor'),
    },
    {
      id: 'scam' as const,
      icon: <ShieldAlert className="w-8 h-8 text-rose-700" />,
      emoji: '🛡️',
      title: isHindi ? '🛡️ Scam Check' : '🛡️ Scam Check',
      subtitle: isHindi ? 'धोखाधड़ी, फर्जी बिजली बिल व बैंक SMS की जांच' : 'Check fake bills, KYC threats & suspicious SMS',
      secondaryLabel: isHindi ? 'Scam & Fraud Check' : 'Cyber Safety 1930',
      bgClass: 'bg-rose-50 hover:bg-rose-100/90 border-rose-300',
      tagColor: 'text-rose-900 bg-rose-100',
      action: () => onSelectFeature('scam'),
    },
    {
      id: 'document' as const,
      icon: <FileText className="w-8 h-8 text-purple-700" />,
      emoji: '📄',
      title: isHindi ? '📄 दस्तावेज़ समझें' : '📄 Explain Documents',
      subtitle: isHindi ? 'पेंशन, सरकारी नोटिस व अस्पताल बिल सरल शब्दों में' : 'Simplify pension, legal & hospital notices',
      secondaryLabel: isHindi ? 'Document Explainer' : 'Read & Understand',
      bgClass: 'bg-purple-50 hover:bg-purple-100/90 border-purple-300',
      tagColor: 'text-purple-900 bg-purple-100',
      action: () => onSelectFeature('document'),
    },
    {
      id: 'voice' as const,
      icon: <Mic className="w-8 h-8 text-sky-700" />,
      emoji: '🤖',
      title: isHindi ? '🤖 AI Companion' : '🤖 AI Companion',
      subtitle: isHindi ? 'बोलकर या लिखकर शांत व सुरक्षित डिजिटल सहायता' : 'Speak or type for calm, respectful assistance',
      secondaryLabel: isHindi ? 'Talk & Chat with Saathi' : 'Voice & Chat Helper',
      bgClass: 'bg-sky-50 hover:bg-sky-100/90 border-sky-300',
      tagColor: 'text-sky-900 bg-sky-100',
      action: () => {
        if (onOpenVoiceModal) {
          onOpenVoiceModal();
        } else {
          const el = document.getElementById('saathi-assistant-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }
      },
    },
  ];

  return (
    <section aria-labelledby="main-actions-heading" className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-5">
        <h3
          id="main-actions-heading"
          className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight"
        >
          {isHindi ? 'Saathi आपके लिए क्या कर सकता है?' : 'What Saathi Can Do For You'}
        </h3>
        <p className="text-sm font-semibold text-slate-600 mt-1">
          {isHindi
            ? 'सरल, सुरक्षित और आपकी सुविधा के अनुसार तैयार किए गए खास टूल्स'
            : 'Simple, secure, and respectful tools designed especially for seniors'}
        </p>
      </div>

      {/* Grid of 5 accessible action tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {actions.map((act) => (
          <button
            key={act.id}
            id={`action-tile-${act.id}`}
            type="button"
            onClick={act.action}
            className={`p-4 sm:p-5 rounded-2xl border-2 ${act.bgClass} text-left transition-all duration-150 flex flex-col justify-between shadow-2xs hover:shadow-sm focus-visible:ring-4 focus-visible:ring-amber-500 focus:outline-hidden cursor-pointer min-h-[140px] group`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-white shadow-2xs border border-slate-200/80 flex items-center justify-center shrink-0">
                  {act.icon}
                </div>
                <span className="text-xl shrink-0">{act.emoji}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-base sm:text-lg font-black text-slate-900 leading-snug group-hover:text-amber-800 transition-colors">
                  {act.title}
                </h4>
                {act.secondaryLabel && (
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md shrink-0 ${act.tagColor}`}>
                    {act.secondaryLabel}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1.5 leading-normal">
                {act.subtitle}
              </p>
            </div>

            <div className="pt-3 mt-2 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-slate-700">
              <span>{isHindi ? 'खोलें (Tap to Open)' : 'Open Tool'}</span>
              <ArrowRight className="w-4 h-4 text-amber-700 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};
