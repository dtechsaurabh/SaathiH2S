import React from 'react';
import { Heart, Volume2, VolumeX, PhoneCall, SlidersHorizontal } from 'lucide-react';
import { FontSize, Language } from '../types';

interface HeaderProps {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  highContrast?: boolean;
  onOpenAccessibility: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  fontSize,
  setFontSize,
  language,
  setLanguage,
  soundEnabled,
  setSoundEnabled,
  highContrast = false,
  onOpenAccessibility,
}) => {
  const isHindi = language === 'hi';

  return (
    <header
      className={`sticky top-0 z-40 backdrop-blur-md border-b-2 transition-colors ${
        highContrast
          ? 'bg-black text-white border-white'
          : 'bg-white/95 text-slate-900 border-slate-200 shadow-xs'
      }`}
    >
      {/* Senior Helpline Announcement Ribbon */}
      <div
        className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold border-b ${
          highContrast
            ? 'bg-amber-400 text-black border-white'
            : 'bg-amber-50 text-amber-950 border-amber-200/80'
        }`}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 truncate">
            <PhoneCall
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${
                highContrast ? 'text-black' : 'text-amber-700'
              }`}
            />
            <span className="truncate">
              {isHindi
                ? 'वरिष्ठ नागरिक हेल्पलाइन: 14567 • साइबर फ्रॉड: 1930 • आपातकाल: 112'
                : 'Senior Helpline: 14567 • Cyber Helpline: 1930 • Emergency: 112'}
            </span>
          </span>
          <span
            className={`hidden sm:inline-block font-bold shrink-0 ${
              highContrast ? 'text-black' : 'text-amber-800'
            }`}
          >
            {isHindi ? 'सुरक्षित व सरल' : 'Safe & Simple'}
          </span>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-4xl mx-auto px-4 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-xs border-2 border-amber-600 shrink-0">
            <Heart className="w-6 h-6 sm:w-7 sm:h-7 fill-white text-white" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <h1
                className={`text-xl sm:text-2xl font-black tracking-tight ${
                  highContrast ? 'text-white' : 'text-slate-900'
                }`}
              >
                साथी <span className="text-amber-600 font-extrabold">Saathi</span>
              </h1>
            </div>
            <p
              className={`text-xs font-semibold ${
                highContrast ? 'text-amber-300' : 'text-slate-600'
              }`}
            >
              {isHindi ? 'आपका Digital Companion' : 'Your Digital Companion'}
            </p>
          </div>
        </div>

        {/* Controls: Sound, Accessibility & Language */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Sound Toggle Button */}
          <button
            id="toggle-audio-sound"
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            aria-label={
              soundEnabled
                ? isHindi
                  ? 'आवाज़ बंद करें'
                  : 'Mute voice audio'
                : isHindi
                ? 'आवाज़ चालू करें'
                : 'Enable voice audio'
            }
            className={`p-2 sm:px-3 sm:py-2 rounded-xl border font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors focus-visible:ring-4 focus-visible:ring-amber-400 min-h-[44px] ${
              soundEnabled
                ? highContrast
                  ? 'bg-amber-400 text-black border-white'
                  : 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
                : highContrast
                ? 'bg-slate-900 text-white border-slate-700'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
            }`}
            title={soundEnabled ? (isHindi ? 'आवाज़ चालू है' : 'Voice is ON') : isHindi ? 'आवाज़ बंद है' : 'Voice is OFF'}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-amber-700" />
                <span className="hidden md:inline font-bold">
                  {isHindi ? 'आवाज़' : 'Voice'}
                </span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
                <span className="hidden md:inline">
                  {isHindi ? 'म्यूट' : 'Muted'}
                </span>
              </>
            )}
          </button>

          {/* Accessibility Settings Trigger */}
          <button
            id="open-accessibility-panel"
            type="button"
            onClick={onOpenAccessibility}
            aria-label={isHindi ? 'सुलभता सेटिंग्स खोलें' : 'Open accessibility settings'}
            className={`p-2 sm:px-3 sm:py-2 rounded-xl border font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors focus-visible:ring-4 focus-visible:ring-amber-400 min-h-[44px] ${
              highContrast
                ? 'bg-amber-400 text-black border-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
            }`}
            title={isHindi ? 'अक्षर का आकार, कंट्रास्ट और गति' : 'Text size, contrast, and voice'}
          >
            <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
            <span className="hidden sm:inline">
              {isHindi ? 'सुलभता' : 'Settings'}
            </span>
          </button>

          {/* Simple Language Switcher */}
          <div
            role="group"
            aria-label={isHindi ? 'भाषा चुनें' : 'Select language'}
            className={`flex p-0.5 sm:p-1 rounded-xl border min-h-[44px] items-center ${
              highContrast ? 'bg-slate-900 border-white' : 'bg-slate-100 border-slate-200'
            }`}
          >
            <button
              id="lang-hindi-btn"
              type="button"
              onClick={() => setLanguage('hi')}
              aria-pressed={language === 'hi'}
              aria-label="हिन्दी (Hindi)"
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-black transition-all min-h-[40px] min-w-[44px] flex items-center justify-center ${
                language === 'hi'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : highContrast
                  ? 'text-white hover:text-amber-300'
                  : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              हिन्दी
            </button>
            <button
              id="lang-english-btn"
              type="button"
              onClick={() => setLanguage('en')}
              aria-pressed={language === 'en'}
              aria-label="English"
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-black transition-all min-h-[40px] min-w-[44px] flex items-center justify-center ${
                language === 'en'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : highContrast
                  ? 'text-white hover:text-amber-300'
                  : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              English
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
