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
      id: 'doctor' as const,
      icon: <Stethoscope className="w-8 h-8 text-emerald-700" />,
      emoji: '🩺',
      title: isHindi ? 'Doctor & Appointments' : 'Doctor & Appointments',
      description: isHindi ? 'Appointment संभालें' : 'Manage visits & doctor appointments',
      bgClass: 'bg-emerald-50/70 hover:bg-emerald-100/80 border-emerald-300',
      tagColor: 'text-emerald-800 bg-emerald-100',
      action: () => onSelectFeature('doctor'),
    },
    {
      id: 'medicine' as const,
      icon: <Pill className="w-8 h-8 text-amber-700" />,
      emoji: '💊',
      title: isHindi ? 'Medicines' : 'Medicines',
      description: isHindi ? 'दवाइयों के reminders' : 'Medicine schedule & reminders',
      bgClass: 'bg-amber-50/70 hover:bg-amber-100/80 border-amber-300',
      tagColor: 'text-amber-800 bg-amber-100',
      action: () => onSelectFeature('medicine'),
    },
    {
      id: 'scam' as const,
      icon: <ShieldAlert className="w-8 h-8 text-rose-700" />,
      emoji: '🚨',
      title: isHindi ? 'Scam Checker' : 'Scam Checker',
      description: isHindi ? 'संदिग्ध message जाँचें' : 'Check suspicious SMS, WhatsApp or calls',
      bgClass: 'bg-rose-50/70 hover:bg-rose-100/80 border-rose-300',
      tagColor: 'text-rose-800 bg-rose-100',
      action: () => onSelectFeature('scam'),
    },
    {
      id: 'document' as const,
      icon: <FileText className="w-8 h-8 text-purple-700" />,
      emoji: '📄',
      title: isHindi ? 'समझाएँ (Explain Info)' : 'Explain Information',
      description: isHindi ? 'कठिन जानकारी आसान करें' : 'Simplify documents, bills & letters',
      bgClass: 'bg-purple-50/70 hover:bg-purple-100/80 border-purple-300',
      tagColor: 'text-purple-800 bg-purple-100',
      action: () => onSelectFeature('document'),
    },
    {
      id: 'voice' as const,
      icon: <Mic className="w-8 h-8 text-amber-600" />,
      emoji: '🎤',
      title: isHindi ? 'Saathi से बात करें' : 'Talk to Saathi',
      description: isHindi ? 'अपनी बात बताइए' : 'Ask questions or talk freely',
      bgClass: 'bg-amber-100/70 hover:bg-amber-200/80 border-amber-400',
      tagColor: 'text-amber-900 bg-amber-200',
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
          {isHindi ? 'मैं आपकी किस तरह मदद करूँ?' : 'How can I help you today?'}
        </h3>
        <p className="text-sm font-semibold text-slate-600 mt-1">
          {isHindi
            ? 'किसी भी विकल्प पर क्लिक करके सीधे शुरू करें'
            : 'Select any option below to get simple, guided assistance'}
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
              <h4 className="text-base sm:text-lg font-black text-slate-900 leading-snug group-hover:text-amber-800 transition-colors">
                {act.title}
              </h4>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1 leading-normal">
                {act.description}
              </p>
            </div>

            <div className="pt-3 mt-2 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-slate-700">
              <span>{isHindi ? 'शुरू करें' : 'Open'}</span>
              <ArrowRight className="w-4 h-4 text-amber-700 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};
