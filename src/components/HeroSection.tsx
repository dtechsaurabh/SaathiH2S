import React from 'react';
import { Mic, ArrowDown, Sparkles } from 'lucide-react';
import { FontSize, Language } from '../types';

interface HeroSectionProps {
  language: Language;
  fontSize: FontSize;
  onOpenVoiceModal: () => void;
  onSelectPrompt: (promptText: string) => void;
  onScrollToTodayHelp?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  language,
  fontSize,
  onOpenVoiceModal,
  onSelectPrompt,
  onScrollToTodayHelp,
}) => {
  const isHindi = language === 'hi';

  const titleSizeClass =
    fontSize === 'xlarge'
      ? 'text-3xl sm:text-4xl'
      : fontSize === 'large'
      ? 'text-2xl sm:text-3xl'
      : 'text-xl sm:text-2xl';

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

  return (
    <section className="bg-amber-50/50 border-b border-amber-200/70 pt-6 sm:pt-10 pb-8 px-4">
      <div className="max-w-3xl mx-auto text-center space-y-4 sm:space-y-5">
        {/* Friendly greeting */}
        <div className="space-y-1.5">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {isHindi ? 'नमस्ते 👋' : 'Namaste 👋'}
          </h2>
          <p className="text-xl sm:text-2xl font-black text-amber-700">
            {isHindi ? 'मैं Saathi हूँ' : 'I am Saathi'}
          </p>
          <p className="text-base sm:text-lg font-bold text-slate-800 max-w-xl mx-auto">
            {isHindi
              ? 'मैं आपके रोज़मर्रा के काम आसान बनाने में आपकी मदद कर सकता हूँ।'
              : 'I am here to make your everyday digital tasks easy, calm, and simple.'}
          </p>
        </div>

        {/* Supportive line */}
        <p className="text-sm sm:text-base font-medium text-slate-600 max-w-lg mx-auto leading-relaxed">
          {isHindi
            ? 'आप जो करना चाहते हैं, बस बताइए। मैं आसान तरीके से समझाऊँगा।'
            : 'Whatever you need help with, just ask. I will explain everything in simple, clear steps.'}
        </p>

        {/* Primary and Secondary Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
          {/* Prominent Primary Action: 🎤 Saathi से बात करें */}
          <button
            id="talk-to-saathi-btn"
            type="button"
            onClick={onOpenVoiceModal}
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-3 px-6 sm:px-8 py-4 rounded-2xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-extrabold text-lg sm:text-xl shadow-md hover:shadow-lg transition-all border-2 border-amber-700 min-h-[56px] focus-visible:ring-4 focus-visible:ring-amber-400 cursor-pointer"
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
      </div>
    </section>
  );
};
