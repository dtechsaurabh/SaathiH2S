import React, { useEffect } from 'react';
import { X, Type, Eye, Zap, Volume2, Globe, RotateCcw } from 'lucide-react';
import { SeniorSettings, FontSize } from '../types';

interface AccessibilitySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SeniorSettings;
  onUpdateSettings: (newSettings: Partial<SeniorSettings>) => void;
  onResetSettings: () => void;
}

export const AccessibilitySettingsModal: React.FC<AccessibilitySettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetSettings,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isHindi = settings.language === 'hi';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="accessibility-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border-2 border-slate-300 shadow-xl space-y-6 my-6 max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-xl shrink-0">
              ♿
            </div>
            <div>
              <h2 id="accessibility-title" className="text-xl sm:text-2xl font-black text-slate-900">
                {isHindi ? '♿ Accessibility Settings' : '♿ Accessibility Settings'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-semibold mt-0.5">
                {isHindi ? 'अक्षर का आकार, भाषा, आवाज़ और कंट्रास्ट' : 'Text size, contrast, language and sound'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label={isHindi ? 'सेटिंग्स बंद करें' : 'Close accessibility settings'}
            className="p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors focus-visible:ring-4 focus-visible:ring-amber-400 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 1. Text Size: ○ सामान्य  ○ बड़ा  ○ बहुत बड़ा */}
        <div className="space-y-2.5">
          <span id="text-size-label" className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
            <Type className="w-5 h-5 text-amber-600" aria-hidden="true" />
            <span>{isHindi ? 'Text Size (अक्षर का आकार):' : 'Text Size:'}</span>
          </span>
          <div
            role="radiogroup"
            aria-labelledby="text-size-label"
            className="grid grid-cols-3 gap-2"
          >
            {[
              { id: 'normal' as FontSize, labelHi: 'सामान्य', labelEn: 'Normal' },
              { id: 'large' as FontSize, labelHi: 'बड़ा', labelEn: 'Large' },
              { id: 'xlarge' as FontSize, labelHi: 'बहुत बड़ा', labelEn: 'Extra Large' },
            ].map((size) => {
              const isSelected = settings.fontSize === size.id;
              return (
                <button
                  key={size.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => onUpdateSettings({ fontSize: size.id })}
                  className={`p-3 rounded-2xl border-2 text-center transition-all min-h-[50px] flex items-center justify-center gap-1.5 focus-visible:ring-4 focus-visible:ring-amber-400 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-600 text-white border-amber-700 font-black shadow-xs'
                      : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100 font-bold'
                  }`}
                >
                  <span className="text-sm font-black">
                    {isSelected ? '●' : '○'} {isHindi ? size.labelHi : size.labelEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. High Contrast: ON / OFF */}
        <div className="p-4 rounded-2xl border-2 border-slate-200 bg-slate-50/70 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span id="high-contrast-label" className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <Eye className="w-5 h-5 text-amber-700" aria-hidden="true" />
              <span>{isHindi ? 'High Contrast (उच्च कंट्रास्ट)' : 'High Contrast'}</span>
            </span>
            <p className="text-xs text-slate-600 font-medium">
              {isHindi ? 'अक्षरों और बॉर्डरों को और अधिक स्पष्ट बनाएँ' : 'Maximum border and text contrast'}
            </p>
          </div>
          <div
            role="group"
            aria-labelledby="high-contrast-label"
            className="flex items-center rounded-xl bg-slate-200 p-1 border border-slate-300 shrink-0 min-h-[44px]"
          >
            <button
              type="button"
              aria-pressed={settings.highContrast}
              onClick={() => onUpdateSettings({ highContrast: true })}
              className={`px-3.5 py-2 rounded-lg text-xs font-black transition-all min-h-[38px] ${
                settings.highContrast
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ON
            </button>
            <button
              type="button"
              aria-pressed={!settings.highContrast}
              onClick={() => onUpdateSettings({ highContrast: false })}
              className={`px-3.5 py-2 rounded-lg text-xs font-black transition-all min-h-[38px] ${
                !settings.highContrast
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              OFF
            </button>
          </div>
        </div>

        {/* 3. Reduce Motion: ON / OFF */}
        <div className="p-4 rounded-2xl border-2 border-slate-200 bg-slate-50/70 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span id="reduce-motion-label" className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-600" aria-hidden="true" />
              <span>{isHindi ? 'Reduce Motion (गति कम करें)' : 'Reduce Motion'}</span>
            </span>
            <p className="text-xs text-slate-600 font-medium">
              {isHindi ? 'स्क्रीन पर अनावश्यक एनिमेशन बंद करें' : 'Disable bouncy screen animations'}
            </p>
          </div>
          <div
            role="group"
            aria-labelledby="reduce-motion-label"
            className="flex items-center rounded-xl bg-slate-200 p-1 border border-slate-300 shrink-0 min-h-[44px]"
          >
            <button
              type="button"
              aria-pressed={settings.reduceMotion}
              onClick={() => onUpdateSettings({ reduceMotion: true })}
              className={`px-3.5 py-2 rounded-lg text-xs font-black transition-all min-h-[38px] ${
                settings.reduceMotion
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ON
            </button>
            <button
              type="button"
              aria-pressed={!settings.reduceMotion}
              onClick={() => onUpdateSettings({ reduceMotion: false })}
              className={`px-3.5 py-2 rounded-lg text-xs font-black transition-all min-h-[38px] ${
                !settings.reduceMotion
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              OFF
            </button>
          </div>
        </div>

        {/* 4. Language: हिंदी / English */}
        <div className="space-y-2.5">
          <span id="language-settings-label" className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-600" aria-hidden="true" />
            <span>{isHindi ? 'Language (भाषा):' : 'Language:'}</span>
          </span>
          <div
            role="radiogroup"
            aria-labelledby="language-settings-label"
            className="grid grid-cols-2 gap-3"
          >
            <button
              type="button"
              role="radio"
              aria-checked={settings.language === 'hi'}
              onClick={() => onUpdateSettings({ language: 'hi' })}
              className={`p-3.5 rounded-2xl border-2 text-center transition-all min-h-[48px] focus-visible:ring-4 focus-visible:ring-amber-400 ${
                settings.language === 'hi'
                  ? 'bg-amber-600 text-white border-amber-700 shadow-xs font-black'
                  : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100 font-bold'
              }`}
            >
              हिन्दी (Hindi)
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={settings.language === 'en'}
              onClick={() => onUpdateSettings({ language: 'en' })}
              className={`p-3.5 rounded-2xl border-2 text-center transition-all min-h-[48px] focus-visible:ring-4 focus-visible:ring-amber-400 ${
                settings.language === 'en'
                  ? 'bg-amber-600 text-white border-amber-700 shadow-xs font-black'
                  : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100 font-bold'
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* 5. Read Aloud: ON / OFF */}
        <div className="p-4 rounded-2xl border-2 border-slate-200 bg-slate-50/70 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span id="read-aloud-label" className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-amber-700" aria-hidden="true" />
              <span>{isHindi ? 'Read Aloud (बोलकर सुनाएँ)' : 'Read Aloud'}</span>
            </span>
            <p className="text-xs text-slate-600 font-medium">
              {isHindi ? 'जवाबों और सूचनाओं को आवाज़ में पढ़ें' : 'Automatically read messages aloud'}
            </p>
          </div>
          <div
            role="group"
            aria-labelledby="read-aloud-label"
            className="flex items-center rounded-xl bg-slate-200 p-1 border border-slate-300 shrink-0 min-h-[44px]"
          >
            <button
              type="button"
              aria-pressed={settings.soundEnabled}
              onClick={() => onUpdateSettings({ soundEnabled: true })}
              className={`px-3.5 py-2 rounded-lg text-xs font-black transition-all min-h-[38px] ${
                settings.soundEnabled
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ON
            </button>
            <button
              type="button"
              aria-pressed={!settings.soundEnabled}
              onClick={() => onUpdateSettings({ soundEnabled: false })}
              className={`px-3.5 py-2 rounded-lg text-xs font-black transition-all min-h-[38px] ${
                !settings.soundEnabled
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              OFF
            </button>
          </div>
        </div>

        {/* Reset & Done Footer */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onResetSettings}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm flex items-center gap-1.5 min-h-[44px] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{isHindi ? 'डिफ़ॉल्ट रीसेट करें' : 'Reset to Default'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-sm shadow-xs min-h-[44px] cursor-pointer"
          >
            {isHindi ? 'संपन्न' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};

