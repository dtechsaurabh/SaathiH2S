import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  PhoneCall,
  Volume2,
  RefreshCw,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { Language, ScamAnalysisResult, ScamRiskLevel } from '../types';
import { speakText } from '../utils/speech';
import { aiService } from '../services/aiService';
import { validateScamInput } from '../utils/aiSafety';

interface ScamCheckerModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  soundEnabled: boolean;
  onAskSaathi?: (prompt: string) => void;
}

const SAMPLE_PRESETS = [
  {
    titleHi: '⚡ बिजली बिल कटने की धमकी',
    titleEn: '⚡ Electricity Bill Threat',
    text: 'Dear Consumer, your electricity power will be disconnected tonight at 9:30 PM from the sub-division office because your previous month bill was not updated. Immediately call electricity officer at 9876543210 or click http://bijli-update.xyz to prevent power cut.',
  },
  {
    titleHi: '🏦 बैंक खाता / Aadhaar KYC बंद',
    titleEn: '🏦 Bank Account KYC Block',
    text: 'ALERT: Dear Customer, your bank account and NetBanking services have been blocked due to pending Aadhaar KYC. Update immediately within 12 hours at http://sbi-quick-kyc.com/auth or account will be permanently frozen.',
  },
  {
    titleHi: '🎁 25 लाख लॉटरी / KBC संदेश',
    titleEn: '🎁 25 Lakh Lottery WhatsApp',
    text: 'बधाई हो! आपका मोबाइल नंबर KBC ऑल इंडिया लकी ड्रॉ में ₹25,00,000 जीत चुका है। अपने इनाम की राशि प्राप्त करने के लिए मिस्टर वर्मा को व्हाट्सएप करें। प्रोसेसिंग फीस ₹10,000 तुरंत जमा करें।',
  },
  {
    titleHi: '👮 फर्जी पुलिस / डिजिटल अरेस्ट',
    titleEn: '👮 Fake Police / Digital Arrest',
    text: 'URGENT NOTICE: Narcotics Control Bureau and Police have intercepted an illegal parcel under your Aadhaar number. You are placed under digital arrest. Do not disconnect or speak to family.',
  },
];

export const ScamCheckerModal: React.FC<ScamCheckerModalProps> = ({
  isOpen,
  onClose,
  language,
  soundEnabled,
  onAskSaathi,
}) => {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScamAnalysisResult | null>(null);

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
  const isHindi = language === 'hi';

  const handleAnalyze = async (textToTest?: string) => {
    const candidate = textToTest !== undefined ? textToTest : inputText;
    const validation = validateScamInput(candidate, language);

    if (!validation.isValid) {
      setError(
        validation.error ||
          (isHindi
            ? 'कृपया पहले वह SMS या संदेश यहाँ लिखें जिसे आप जाँच करवाना चाहते हैं।'
            : 'Please write or paste the SMS or message you want to check first.')
      );
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await aiService.checkScam(validation.sanitizedText, language);
      setResult(data);

      if (soundEnabled) {
        const speechMsg = isHindi
          ? `${data.riskLevel === 'HIGH RISK' ? 'सावधान रहें, यह संदेश धोखाधड़ी के लक्षण दिखाता है।' : 'यह संदेश कम जोखिम का प्रतीत होता है।'} ${data.explanation}`
          : `${data.riskLevel === 'HIGH RISK' ? 'Caution: This message shows signs commonly associated with scams.' : 'This message shows low risk.'} ${data.explanation}`;
        speakText(speechMsg, language);
      }
    } catch (err: any) {
      console.error('Scam check failed:', err);
      const msg =
        err?.message && (err.message.includes('कृपया') || err.message.includes('Please') || err.message.includes('लंबा') || err.message.includes('long'))
          ? err.message
          : isHindi
          ? 'जाँच करने में तकनीकी कठिनाई आई। कृपया पुनः प्रयास करें।'
          : 'Unable to complete check at this moment. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPreset = (text: string) => {
    setInputText(text);
    setError(null);
    handleAnalyze(text);
  };

  const handleSpeakResult = () => {
    if (!result) return;
    const msg = isHindi
      ? `जोखिम स्तर: ${result.riskLabelHi}। ${result.explanation}। चेतावनी संकेत: ${result.warningSigns.join('। ')}। सुरक्षित कदम: ${result.recommendedActions.join('। ')}`
      : `Risk level: ${result.riskLevel}. ${result.explanation} Warning signs: ${result.warningSigns.join('. ')}. Safe action: ${result.recommendedActions.join('. ')}`;
    speakText(msg, language);
  };

  const getRiskDisplay = (level: ScamRiskLevel) => {
    switch (level) {
      case 'HIGH RISK':
      case 'High':
        return {
          icon: '🔴',
          label: 'HIGH RISK',
          labelHi: '🔴 उच्च जोखिम (HIGH RISK)',
          badgeClass: 'bg-rose-100 text-rose-900 border-2 border-rose-500',
          borderClass: 'border-rose-300 bg-white',
          iconComponent: <AlertTriangle className="w-7 h-7 text-rose-600 shrink-0" aria-hidden="true" />,
        };
      case 'MEDIUM RISK':
      case 'Medium':
        return {
          icon: '🟡',
          label: 'MEDIUM RISK',
          labelHi: '🟡 मध्यम जोखिम (MEDIUM RISK)',
          badgeClass: 'bg-amber-100 text-amber-900 border-2 border-amber-500',
          borderClass: 'border-amber-300 bg-white',
          iconComponent: <AlertTriangle className="w-7 h-7 text-amber-600 shrink-0" aria-hidden="true" />,
        };
      case 'LOW RISK':
      case 'Low':
        return {
          icon: '🟢',
          label: 'LOW RISK',
          labelHi: '🟢 कम जोखिम (LOW RISK)',
          badgeClass: 'bg-emerald-100 text-emerald-900 border-2 border-emerald-500',
          borderClass: 'border-emerald-300 bg-white',
          iconComponent: <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" aria-hidden="true" />,
        };
      case 'UNKNOWN / NEEDS REVIEW':
      default:
        return {
          icon: '⚪',
          label: 'UNKNOWN / NEEDS REVIEW',
          labelHi: '⚪ समीक्षा की आवश्यकता (UNKNOWN / NEEDS REVIEW)',
          badgeClass: 'bg-slate-100 text-slate-900 border-2 border-slate-500',
          borderClass: 'border-slate-300 bg-white',
          iconComponent: <HelpCircle className="w-7 h-7 text-slate-600 shrink-0" aria-hidden="true" />,
        };
    }
  };

  const riskInfo = result ? getRiskDisplay(result.riskLevel) : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="scam-checker-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border-2 border-slate-300 shadow-xl space-y-5 my-6 max-h-[92vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shrink-0 text-2xl">
              🚨
            </div>
            <div>
              <h2 id="scam-checker-title" className="text-xl sm:text-2xl font-black text-slate-900">
                🚨 {isHindi ? 'Scam Checker' : 'Scam Checker'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-semibold mt-0.5">
                {isHindi
                  ? 'कोई SMS, WhatsApp या email संदिग्ध लग रहा है?'
                  : 'Does an SMS, WhatsApp message, or email look suspicious?'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label={isHindi ? 'स्कैम चेकर बंद करें' : 'Close scam checker'}
            className="p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors focus-visible:ring-4 focus-visible:ring-amber-400 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Subtle Safety Reminder */}
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs sm:text-sm font-bold flex items-center gap-2.5">
          <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0" aria-hidden="true" />
          <span>
            {isHindi
              ? '⚠️ OTP, PIN, password या banking credentials यहाँ साझा न करें।'
              : '⚠️ Never share OTP, PIN, passwords, or banking credentials here.'}
          </span>
        </div>

        {/* Input Textarea */}
        <div className="space-y-2">
          <label htmlFor="scam-input-text" className="text-sm font-bold text-slate-800 block">
            {isHindi ? 'संदेश लिखें या चिपकाएं (Paste):' : 'Write or paste the message here:'}
          </label>
          <div className="relative">
            <textarea
              id="scam-input-text"
              rows={4}
              maxLength={5000}
              value={inputText}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'scam-error-alert' : undefined}
              onChange={(e) => {
                setInputText(e.target.value);
                if (error) setError(null);
              }}
              placeholder={
                isHindi
                  ? 'यहाँ संदेश लिखें या paste करें...'
                  : 'Type or paste the suspicious message here...'
              }
              className="w-full p-4 rounded-2xl border-2 border-slate-300 focus:border-amber-600 focus-visible:ring-4 focus-visible:ring-amber-200 text-base text-slate-900 bg-slate-50 focus:bg-white placeholder:text-slate-400 resize-none font-medium min-h-[110px]"
            />
            {inputText && (
              <button
                type="button"
                onClick={() => {
                  setInputText('');
                  setError(null);
                }}
                aria-label={isHindi ? 'संदेश साफ करें' : 'Clear message text'}
                className="absolute top-3 right-3 text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-2 rounded-lg font-bold min-h-[44px] flex items-center"
              >
                {isHindi ? 'साफ करें' : 'Clear'}
              </button>
            )}
          </div>
        </div>

        {/* Large Primary Action Button */}
        <div>
          <button
            type="button"
            disabled={loading || !inputText.trim()}
            onClick={() => handleAnalyze()}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-black text-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 transition-all focus-visible:ring-4 focus-visible:ring-amber-400 min-h-[54px] cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>{isHindi ? 'जाँच हो रही है...' : 'Checking safely...'}</span>
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span>{isHindi ? '🔍 संदेश जाँचें' : '🔍 Check Message'}</span>
              </>
            )}
          </button>
        </div>

        {/* Real-World Quick Presets */}
        <div className="space-y-2 pt-1">
          <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{isHindi ? 'आम फर्जी संदेश के उदाहरण (क्लिक करके देखें):' : 'Common scam examples (tap to test):'}</span>
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SAMPLE_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(preset.text)}
                className="p-3 rounded-xl border border-slate-200 hover:border-amber-400 bg-slate-50 hover:bg-amber-50/50 text-left transition-all text-xs font-semibold text-slate-800 flex items-center justify-between group min-h-[44px] cursor-pointer focus-visible:ring-4 focus-visible:ring-amber-400"
              >
                <span className="line-clamp-1">{isHindi ? preset.titleHi : preset.titleEn}</span>
                <span className="text-[11px] text-amber-700 font-bold opacity-80 group-hover:opacity-100 shrink-0">
                  {isHindi ? 'जाँचें →' : 'Test →'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            id="scam-error-alert"
            role="alert"
            aria-live="polite"
            className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-400 text-amber-950 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2.5 text-sm font-bold">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
            {inputText.trim() && (
              <button
                type="button"
                onClick={() => handleAnalyze()}
                className="px-4 py-2.5 rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold text-xs shrink-0 min-h-[44px] flex items-center cursor-pointer"
              >
                {isHindi ? 'दोबारा करें' : 'Retry'}
              </button>
            )}
          </div>
        )}

        {/* Structured Senior-Friendly Result Display */}
        {result && riskInfo && (
          <div
            role="region"
            aria-label={isHindi ? 'स्कैम विश्लेषण परिणाम' : 'Scam analysis result'}
            className={`p-5 sm:p-6 rounded-2xl border-2 ${riskInfo.borderClass} shadow-sm space-y-4`}
          >
            {/* 1. Risk Level */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-3">
                {riskInfo.iconComponent}
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500 block">
                    {isHindi ? 'Risk Level' : 'Risk Level'}
                  </span>
                  <span className={`inline-block mt-0.5 px-3 py-1 rounded-xl text-sm sm:text-base font-black tracking-wide ${riskInfo.badgeClass}`}>
                    {riskInfo.icon} {isHindi ? riskInfo.labelHi : riskInfo.label}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSpeakResult}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-900 font-bold text-xs sm:text-sm flex items-center gap-1.5 shrink-0 self-start sm:self-center"
              >
                <Volume2 className="w-4 h-4 text-amber-600" />
                <span>{isHindi ? 'आवाज़ में सुनें' : 'Listen'}</span>
              </button>
            </div>

            {/* 2. Warning Signs */}
            {result.warningSigns && result.warningSigns.length > 0 && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs sm:text-sm font-black uppercase tracking-wide text-slate-800 block">
                  ⚠️ {isHindi ? 'Warning Signs (चेतावनी संकेत):' : 'Warning Signs:'}
                </span>
                <ul className="space-y-1.5">
                  {result.warningSigns.map((sign, idx) => (
                    <li key={idx} className="text-xs sm:text-sm flex items-start gap-2 font-semibold text-slate-800">
                      <span className="text-amber-600 text-base leading-none shrink-0" aria-hidden="true">•</span>
                      <span>{sign}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 3. Simple Explanation */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-xs sm:text-sm font-black uppercase tracking-wide text-slate-800 block">
                💡 {isHindi ? 'Simple Explanation (सरल व्याख्या):' : 'Simple Explanation:'}
              </span>
              <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                {result.explanation}
              </p>
            </div>

            {/* 4. Safe Action */}
            {result.recommendedActions && result.recommendedActions.length > 0 && (
              <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-300 space-y-2">
                <span className="text-xs sm:text-sm font-black uppercase tracking-wide text-emerald-950 block">
                  ✅ {isHindi ? 'Safe Action (सुरक्षित कदम):' : 'Safe Action:'}
                </span>
                <ul className="space-y-1.5">
                  {result.recommendedActions.map((act, idx) => (
                    <li key={idx} className="text-xs sm:text-sm flex items-start gap-2 font-bold text-emerald-900">
                      <span className="text-emerald-600 text-base leading-none shrink-0" aria-hidden="true">✓</span>
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 5. Cyber Crime Helpline 1930 */}
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-slate-800 font-bold text-xs sm:text-sm">
                <PhoneCall className="w-5 h-5 text-amber-700 shrink-0" />
                <span>
                  {isHindi
                    ? '☎️ सहायता: किसी भी वित्तीय धोखाधड़ी या संदेह में 1930 (National Cyber Crime Helpline) पर तुरंत कॉल करें।'
                    : '☎️ Help: In case of financial fraud or suspicion, call 1930 (National Cyber Crime Helpline) immediately.'}
                </span>
              </div>
              <a
                id="scam-modal-call-1930"
                href="tel:1930"
                aria-label={isHindi ? '1930 साइबर क्राइम हेल्पलाइन पर कॉल करें' : 'Call 1930 National Cyber Helpline'}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs sm:text-sm shrink-0 shadow-xs min-h-[44px] flex items-center justify-center focus-visible:ring-4 focus-visible:ring-amber-400"
              >
                📞 {isHindi ? '1930 पर कॉल करें' : 'Call 1930'}
              </a>
            </div>

            {/* 6. Non-100% Certainty Disclaimer */}
            <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-center">
              <p className="text-[11px] sm:text-xs text-slate-600 font-semibold leading-relaxed">
                {isHindi
                  ? '💡 अस्वीकरण (Disclaimer): यह विश्लेषण AI सुरक्षा मॉडल पर आधारित है और 100% निश्चित होने का दावा नहीं करता। यदि आपको संदेह हो, तो किसी अज्ञात लिंक या OTP को कभी न खोलें और सीधे बैंक या 1930 से पुष्टि करें।'
                  : '💡 Disclaimer: This analysis is based on AI safety models and does not claim 100% certainty. When in doubt, never click unknown links or share OTPs; always verify with your bank or call 1930.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
