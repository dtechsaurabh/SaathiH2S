import React from 'react';
import { Mic, ArrowDown, Shield, Heart, SlidersHorizontal, Sparkles } from 'lucide-react';
import { FontSize, Language } from '../types';

interface HeroSectionProps {
  language: Language;
  fontSize: FontSize;
  onOpenVoiceModal: () => void;
  onSelectPrompt: (promptText: string) => void;
  onScrollToTodayHelp?: () => void;
  onOpenAccessibility?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  language,
  fontSize,
  onOpenVoiceModal,
  onSelectPrompt,
  onScrollToTodayHelp,
  onOpenAccessibility,
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

  return (
    <section className="bg-amber-50/60 border-b-2 border-amber-200/80 pt-6 sm:pt-9 pb-7 px-4">
      <div className="max-w-3xl mx-auto text-center space-y-4 sm:space-y-5">
        {/* Core Value Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-black">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
            👵 {isHindi ? 'Senior-First Design' : 'Senior-First Design'}
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
            🌿 {isHindi ? 'सरल व शांत' : 'Simple & Calm'}
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-900 border border-blue-300">
            🛡️ {isHindi ? 'सुरक्षित व निजी' : '100% Safe & Private'}
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 text-purple-900 border border-purple-300">
            🤝 {isHindi ? 'आत्मनिर्भर सहायता' : 'Independent Living'}
          </span>
        </div>

        {/* 1. Purpose Heading */}
        <div className="space-y-2">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            {isHindi ? 'Saathi – आपका Digital Companion' : 'Saathi – Your Digital Companion'}
          </h2>
          <p className="text-lg sm:text-xl font-extrabold text-amber-800 max-w-2xl mx-auto leading-snug">
            {isHindi
              ? 'रोज़मर्रा के digital काम आसान, सुरक्षित और तनावमुक्त बनाने के लिए आपका भरोसेमंद साथी।'
              : 'Your trusted companion to make everyday digital tasks simple, safe, and stress-free.'}
          </p>
        </div>

        {/* Concise Senior Citizen Explanation */}
        <div className="bg-white/80 p-3.5 sm:p-4 rounded-2xl border-2 border-amber-200 text-slate-800 text-xs sm:text-sm font-semibold max-w-2xl mx-auto shadow-2xs leading-relaxed">
          <p>
            {isHindi
              ? '💡 Saathi खास तौर पर senior citizens के लिए बनाया गया है, ताकि आपको हर छोटे digital काम के लिए किसी और पर निर्भर न रहना पड़े।'
              : '💡 Saathi is specially designed for senior citizens, so you don’t have to depend on anyone else for daily digital tasks.'}
          </p>
        </div>

        {/* Primary and Secondary Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
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
        <div className="pt-1 flex items-center justify-center gap-2 text-xs font-bold text-slate-600">
          <span>
            {isHindi
              ? '👁️ Saathi को आपकी सुविधा के अनुसार बड़ा और आसान बनाया जा सकता है।'
              : '👁️ Saathi text size and contrast can be adjusted for your comfort.'}
          </span>
          {onOpenAccessibility && (
            <button
              type="button"
              onClick={onOpenAccessibility}
              className="text-amber-800 underline hover:text-amber-950 font-extrabold cursor-pointer"
            >
              {isHindi ? 'सुलभता बदलें' : 'Settings'}
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
