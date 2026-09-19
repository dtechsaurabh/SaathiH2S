import React from 'react';
import { ShieldCheck, Lock, PhoneCall, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Language } from '../types';

interface TrustSafetySectionProps {
  language: Language;
}

export const TrustSafetySection: React.FC<TrustSafetySectionProps> = ({ language }) => {
  const isHindi = language === 'hi';

  return (
    <section aria-labelledby="trust-safety-heading" className="w-full max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-300 shadow-sm space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 id="trust-safety-heading" className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
              <span>{isHindi ? 'विश्वास, सुरक्षा और गोपनीयता' : 'Trust, Safety & Privacy'}</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-semibold mt-0.5">
              {isHindi
                ? 'वरिष्ठ नागरिकों की सुरक्षा और निजता हमारे लिए सर्वोपरि है'
                : 'Designed with elder-protective boundaries, zero tracking, and transparent guidance'}
            </p>
          </div>
        </div>

        {/* 3 Core Trust Guarantees */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
              <Lock className="w-4 h-4 shrink-0" />
              <span>{isHindi ? 'पासवर्ड या OTP कभी न दें' : 'Never Share Credentials'}</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              {isHindi
                ? 'OTP, PIN, password या banking credentials कभी साझा न करें। साथी या कोई भी व्यक्ति फोन पर आपसे बैंक पासवर्ड, एटीएम पिन या OTP नहीं मांग सकता।'
                : 'Never share OTP, PIN, password or banking credentials with Saathi or anyone over phone or internet.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{isHindi ? 'पेशेवर सलाह का विकल्प नहीं' : 'Advisory Guidance'}</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              {isHindi
                ? 'Saathi AI-powered assistance देता है और professional medical, legal या financial advice का replacement नहीं है।'
                : 'Saathi provides AI-powered assistance and is not a replacement for professional medical, legal or financial advice.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{isHindi ? 'स्थानीय निजी डेटा' : 'Local Browser Privacy'}</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              {isHindi
                ? 'आपकी सुलभता प्राथमिकताएं, दवाइयों की सूची और अपॉइंटमेंट नोट्स केवल आपके इसी उपकरण में सहेजे जाते हैं।'
                : 'Your medicine schedules, accessibility settings, and notes remain private on your device browser.'}
            </p>
          </div>
        </div>

        {/* Emergency Senior Helplines Grid */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700">
            <PhoneCall className="w-4 h-4 text-amber-600" />
            <span>{isHindi ? 'ज़रूरी आपातकालीन नंबर:' : 'Emergency Senior Helplines:'}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <a
              href="tel:14567"
              className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs sm:text-sm font-bold transition-colors"
            >
              👵 14567 ({isHindi ? 'एल्डरलाइन' : 'Elderline'})
            </a>
            <a
              href="tel:1930"
              className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-300 text-xs sm:text-sm font-bold transition-colors"
            >
              🚨 1930 ({isHindi ? 'साइबर फ्रॉड' : 'Cyber Fraud'})
            </a>
            <a
              href="tel:112"
              className="px-3.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-300 text-xs sm:text-sm font-bold transition-colors"
            >
              🚑 112 ({isHindi ? 'आपातकाल' : 'Emergency'})
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
