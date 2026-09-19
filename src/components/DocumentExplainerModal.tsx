import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  HelpCircle,
  AlertCircle,
  Volume2,
  RefreshCw,
  Sparkles,
  CheckSquare,
  BookOpen,
  Info,
} from 'lucide-react';
import { Language, DocumentAnalysisResult } from '../types';
import { speakText } from '../utils/speech';
import { aiService } from '../services/aiService';

interface DocumentExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  soundEnabled: boolean;
  onAskSaathi?: (prompt: string) => void;
}

const SAMPLE_DOCS = [
  {
    titleHi: '📜 जीवन प्रमाण पत्र (Jeevan Pramaan)',
    titleEn: '📜 Annual Pension Life Certificate',
    text: 'GOVERNMENT OF INDIA - DEPARTMENT OF PENSION: All central & state pensioners are hereby informed to submit their Annual Digital Life Certificate (DLC) through Jeevan Pramaan portal or Face Authentication App between October 1 and November 30. Submission requires valid 12-digit PPO number, Aadhaar-linked mobile, and biometric authorization. Default in timely submission will lead to provisional withholding of monthly pension disbursement starting December.',
  },
  {
    titleHi: '🏥 अस्पताल डिस्चार्ज व बिल सारांश',
    titleEn: '🏥 Hospital Discharge & Billing Summary',
    text: 'DISCHARGE SUMMARY & INTERIM INVOICE: Patient admitted for acute hypertensive crisis. Stabilized with IV antihypertensives. Net Payable Amount after TPA insurance co-pay deduction: ₹14,250 towards non-medical consumables, pharmacy, and investigation charges. Strictly follow low-sodium diet. Review after 10 days in Cardiology OPD with fresh Renal Function Test (RFT) and Serum Electrolytes report.',
  },
  {
    titleHi: '⚡ बिजली बोर्ड सुरक्षा निधि नोटिस',
    titleEn: '⚡ Electricity Security Deposit Revision',
    text: 'STATE POWER DISTRIBUTION CORP: Notice under Section 47 of Electricity Act 2003. Additional Security Deposit (ASD) of ₹2,400 has been calculated based on average bi-monthly consumption for FY 2025-26. Amount will be automatically adjusted in upcoming bi-monthly invoice or payable via RTGS/NEFT before due date 15-May to prevent billing surcharge.',
  },
];

export const DocumentExplainerModal: React.FC<DocumentExplainerModalProps> = ({
  isOpen,
  onClose,
  language,
  soundEnabled,
  onAskSaathi,
}) => {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DocumentAnalysisResult | null>(null);

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

  const handleExplain = async (textToExplain?: string) => {
    const text = (textToExplain !== undefined ? textToExplain : inputText).trim();
    if (!text) {
      setError(isHindi ? 'कृपया वह कागज़ात या नोटिस यहाँ लिखें या चिपकाएँ जिसे आप समझना चाहते हैं।' : 'Please paste or type the document text you wish to understand.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await aiService.explainDocument(text, language);
      setResult(data);

      if (soundEnabled) {
        const speechMsg = `${data.simpleExplanation} ${data.actionSteps.length > 0 ? (isHindi ? 'मुख्य कदम:' : 'Key actions:') + ' ' + data.actionSteps.join('. ') : ''}`;
        speakText(speechMsg, language);
      }
    } catch (err: any) {
      console.error('Document explanation failed:', err);
      setError(
        isHindi
          ? 'कागज़ात समझने में तकनीकी समस्या आई। कृपया पुनः प्रयास करें।'
          : 'Unable to explain document right now. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSample = (sampleText: string) => {
    setInputText(sampleText);
    handleExplain(sampleText);
  };

  const handleSpeak = () => {
    if (!result) return;
    const msg = `${result.simpleExplanation} ${isHindi ? 'महत्वपूर्ण बातें:' : 'Important points:'} ${result.importantThings.join('. ')} ${isHindi ? 'आपको क्या करना चाहिए:' : 'What you should do:'} ${result.actionSteps.join('. ')}`;
    speakText(msg, language);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="doc-explainer-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border-2 border-slate-300 shadow-xl space-y-6 my-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 border border-sky-300 flex items-center justify-center text-sky-800 shrink-0 text-2xl">
              📄
            </div>
            <div>
              <h2 id="doc-explainer-title" className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <span>{isHindi ? 'कागज़ात और फॉर्म समझें' : 'Document Explainer'}</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-semibold mt-0.5">
                {isHindi
                  ? 'पेंशन, सरकारी नोटिस, अस्पताल बिल या फॉर्म को सरल शब्दों में समझें'
                  : 'Understand pension forms, medical bills, and official notices in simple language'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label={isHindi ? 'कागज़ात समझें बंद करें' : 'Close document explainer'}
            className="p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors focus-visible:ring-4 focus-visible:ring-sky-400 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Sample Documents for Seniors */}
        <div className="space-y-2">
          <span className="text-xs sm:text-sm font-extrabold text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{isHindi ? 'आम सरकारी व मेडिकल कागज़ात (उदाहरण पर क्लिक करें):' : 'Sample documents for testing (tap to test):'}</span>
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {SAMPLE_DOCS.map((doc, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSample(doc.text)}
                className="p-3 rounded-xl border-2 border-slate-200 hover:border-sky-300 bg-slate-50 hover:bg-sky-50/50 text-left transition-all text-xs font-semibold text-slate-800 flex items-center justify-between group focus:ring-4 focus:ring-sky-300 min-h-[44px] cursor-pointer"
              >
                <span className="line-clamp-2">{isHindi ? doc.titleHi : doc.titleEn}</span>
                <span className="text-[11px] text-sky-600 font-bold shrink-0 ml-1">
                  →
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Text Input Area */}
        <div className="space-y-2">
          <label htmlFor="doc-input-text" className="text-sm sm:text-base font-extrabold text-slate-900 block">
            {isHindi ? 'कागज़ात का पाठ (Text) यहाँ चिपकाएं:' : 'Paste the document text here:'}
          </label>
          <div className="relative">
            <textarea
              id="doc-input-text"
              rows={4}
              value={inputText}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'doc-error-alert' : undefined}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isHindi
                  ? 'उदा: जीवन प्रमाण पत्र के संबंध में निर्देश, अस्पताल डिस्चार्ज समरी, या बिजली बिल का नोटिस यहाँ लिखें...'
                  : 'E.g., Paste pension notice, medical discharge summary, or legal bill text here...'
              }
              className="w-full p-4 rounded-2xl border-2 border-slate-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-200 text-sm sm:text-base text-slate-900 bg-slate-50 focus:bg-white placeholder:text-slate-400 resize-none font-medium"
            />
            {inputText && (
              <button
                type="button"
                onClick={() => setInputText('')}
                aria-label={isHindi ? 'पाठ साफ करें' : 'Clear document text'}
                className="absolute top-3 right-3 text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-2 rounded-lg font-bold min-h-[44px] flex items-center"
              >
                {isHindi ? 'साफ करें' : 'Clear'}
              </button>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleExplain()}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-base shadow-lg shadow-sky-600/20 disabled:opacity-60 flex items-center justify-center gap-2 transition-all focus:ring-4 focus:ring-sky-300 min-h-[50px] cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>{isHindi ? 'सरल भाषा में समझ रहे हैं...' : 'Simplifying document...'}</span>
              </>
            ) : (
              <>
                <BookOpen className="w-5 h-5" />
                <span>{isHindi ? 'आसान भाषा में समझाइए' : 'Explain in Simple Words'}</span>
              </>
            )}
          </button>
          <span className="text-xs text-slate-500 font-medium">
            {isHindi ? '⚡ जेमिनी एआई द्वारा संचालित' : '⚡ Powered by Gemini AI'}
          </span>
        </div>

        {/* Error State */}
        {error && (
          <div
            id="doc-error-alert"
            role="alert"
            aria-live="polite"
            className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2 text-sm font-bold">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => handleExplain()}
              className="px-4 py-2 rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-950 font-extrabold text-xs shrink-0 min-h-[44px] flex items-center"
            >
              {isHindi ? 'दोबारा करें' : 'Retry'}
            </button>
          </div>
        )}

        {/* Result Breakdown */}
        {result && (
          <div className="p-5 sm:p-6 rounded-3xl bg-sky-50/70 border-3 border-sky-300 text-slate-900 space-y-5">
            {/* Header + Read Aloud */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-sky-200">
              <div className="flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-sky-700 shrink-0" />
                <h3 className="text-lg sm:text-xl font-black text-sky-950">
                  {isHindi ? 'कागज़ात का सरल सारांश' : 'Simple Summary'}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleSpeak}
                className="px-3 py-1.5 rounded-xl bg-white border border-sky-300 text-sky-900 font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow-xs hover:bg-sky-100"
              >
                <Volume2 className="w-4 h-4 text-amber-600" />
                <span>{isHindi ? 'बोलकर सुनाएं' : 'Read Aloud'}</span>
              </button>
            </div>

            {/* 1. Simple Explanation */}
            <div className="space-y-1">
              <span className="text-xs font-black text-sky-900 uppercase tracking-wider block">
                {isHindi ? '1. सरल शब्दों में क्या है यह (Simple Explanation):' : '1. Simple Explanation:'}
              </span>
              <p className="text-sm sm:text-base font-semibold text-slate-800 leading-relaxed bg-white/80 p-3.5 rounded-2xl border border-sky-200">
                {result.simpleExplanation}
              </p>
            </div>

            {/* 2. Important Things */}
            {result.importantThings && result.importantThings.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs font-black text-sky-900 uppercase tracking-wider block">
                  {isHindi ? '2. ज़रूरी तारीखें और बातें (Important Things):' : '2. Key Dates & Important Things:'}
                </span>
                <ul className="space-y-1.5 bg-white/80 p-3.5 rounded-2xl border border-sky-200">
                  {result.importantThings.map((item, idx) => (
                    <li key={idx} className="text-xs sm:text-sm font-medium text-slate-800 flex items-start gap-2">
                      <span className="text-sky-600 font-black shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 3. Difficult Words Explained */}
            {result.difficultWords && result.difficultWords.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs font-black text-sky-900 uppercase tracking-wider block flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-sky-600" />
                  <span>{isHindi ? '3. कठिन शब्दों का आसान अर्थ (Difficult Words Explained):' : '3. Difficult Words Explained:'}</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {result.difficultWords.map((item, idx) => (
                    <div key={idx} className="bg-white/90 p-3 rounded-xl border border-sky-200 space-y-0.5">
                      <span className="text-xs font-black text-sky-800 block">{item.term}</span>
                      <span className="text-xs text-slate-600 font-medium">{item.explanation}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Action Steps */}
            {result.actionSteps && result.actionSteps.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs font-black text-sky-900 uppercase tracking-wider block flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                  <span>{isHindi ? '4. आपको क्या करना चाहिए (What Should I Do):' : '4. What Should You Do:'}</span>
                </span>
                <div className="space-y-1.5 bg-white/80 p-3.5 rounded-2xl border border-sky-200">
                  {result.actionSteps.map((step, idx) => (
                    <div key={idx} className="text-xs sm:text-sm font-bold text-slate-800 flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-800 border border-sky-300 flex items-center justify-center text-[11px] font-black shrink-0">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ask Saathi More button */}
            {onAskSaathi && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onAskSaathi(
                    isHindi
                      ? `मुझे इस कागज़ात के बारे में और समझाइए: "${result.simpleExplanation.slice(0, 80)}..."`
                      : `Please explain more about this document: "${result.simpleExplanation.slice(0, 80)}..."`
                  );
                }}
                className="w-full py-3 px-4 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xs"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {isHindi
                    ? 'साथी से इस कागज़ात के बारे में और पूछें'
                    : 'Ask Saathi to Explain More in Chat'}
                </span>
              </button>
            )}

            {/* Mandatory Safety Disclaimer */}
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium italic border-t border-sky-200 pt-2 flex items-start gap-1.5">
              <Info className="w-4 h-4 shrink-0 text-slate-400" />
              <span>{result.safetyDisclaimer}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
