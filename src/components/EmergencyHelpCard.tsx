import React from 'react';
import { PhoneCall, ShieldAlert, HeartHandshake, AlertCircle } from 'lucide-react';
import { Language } from '../types';

interface EmergencyHelpCardProps {
  language: Language;
}

export const EmergencyHelpCard: React.FC<EmergencyHelpCardProps> = ({ language }) => {
  const isHindi = language === 'hi';

  return (
    <section
      id="emergency-safety-section"
      aria-labelledby="emergency-safety-heading"
      className="w-full max-w-4xl mx-auto px-4 py-4 sm:py-6"
    >
      <div className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-rose-300 shadow-sm space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-black text-xl border border-rose-300 shrink-0">
              🆘
            </div>
            <div>
              <h3
                id="emergency-safety-heading"
                className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight"
              >
                {isHindi ? '🆘 तुरंत मदद • Emergency & Safety Helplines' : '🆘 Immediate Help • Emergency & Safety'}
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-0.5">
                {isHindi
                  ? 'किसी भी आपातकाल या धोखाधड़ी में इन आधिकारिक राष्ट्रीय नंबरों पर तुरंत संपर्क करें'
                  : 'Official national helplines for emergencies, fraud prevention, and senior support'}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-rose-900 bg-rose-50 px-3 py-1 rounded-full border border-rose-200 self-start sm:self-center">
            24×7 Free & Toll-Free
          </span>
        </div>

        {/* 3 Clear Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
          {/* 1. Emergency Response 112 */}
          <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/70 border-2 border-rose-200 flex flex-col justify-between space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-rose-900 tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{isHindi ? 'Emergency' : 'Emergency'}</span>
                </span>
                <span className="text-xl font-black text-rose-700">112</span>
              </div>
              <h4 className="text-base font-black text-slate-900 leading-snug">
                {isHindi ? '112 – आपातकालीन सहायता' : '112 – Emergency Response'}
              </h4>
              <p className="text-xs sm:text-sm font-semibold text-slate-700 leading-relaxed">
                {isHindi
                  ? 'अगर अभी कोई शारीरिक खतरा, बीमारी या तत्काल पुलिस/एम्बुलेंस की जरूरत है, तो 112 पर तुरंत सहायता लें।'
                  : 'If you are in immediate danger or need police/ambulance assistance, call 112 immediately.'}
              </p>
            </div>

            <a
              id="emergency-call-112"
              href="tel:112"
              aria-label={isHindi ? '112 पर आपातकालीन कॉल करें' : 'Call 112 Emergency Helpline'}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-sm shadow-xs transition-colors min-h-[44px] focus-visible:ring-4 focus-visible:ring-rose-400"
            >
              <PhoneCall className="w-4 h-4 shrink-0" />
              <span>{isHindi ? '📞 112 पर कॉल करें' : '📞 Call 112'}</span>
            </a>
          </div>

          {/* 2. Cyber Fraud 1930 */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border-2 border-amber-200 flex flex-col justify-between space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-amber-900 tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{isHindi ? 'Cyber Fraud' : 'Cyber Fraud'}</span>
                </span>
                <span className="text-xl font-black text-amber-800">1930</span>
              </div>
              <h4 className="text-base font-black text-slate-900 leading-snug">
                {isHindi ? '1930 – साइबर फ्रॉड हेल्पलाइन' : '1930 – Cyber Crime Helpline'}
              </h4>
              <p className="text-xs sm:text-sm font-semibold text-slate-700 leading-relaxed">
                {isHindi
                  ? 'अगर पैसे की धोखाधड़ी हुई है या बैंकिंग fraud का संदेह है, 1930 पर तुरंत संपर्क करें।'
                  : 'If money was deducted or banking fraud is suspected, contact 1930 immediately.'}
              </p>
            </div>

            <a
              id="emergency-call-1930"
              href="tel:1930"
              aria-label={isHindi ? '1930 राष्ट्रीय साइबर क्राइम हेल्पलाइन पर कॉल करें' : 'Call 1930 National Cyber Crime Helpline'}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-sm shadow-xs transition-colors min-h-[44px] focus-visible:ring-4 focus-visible:ring-amber-400"
            >
              <PhoneCall className="w-4 h-4 shrink-0" />
              <span>{isHindi ? '📞 1930 पर कॉल करें' : '📞 Call 1930'}</span>
            </a>
          </div>

          {/* 3. Senior Citizen Support 14567 */}
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 border-2 border-emerald-200 flex flex-col justify-between space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-emerald-900 tracking-wider flex items-center gap-1.5">
                  <HeartHandshake className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{isHindi ? 'Elderline' : 'Elderline'}</span>
                </span>
                <span className="text-xl font-black text-emerald-800">14567</span>
              </div>
              <h4 className="text-base font-black text-slate-900 leading-snug">
                {isHindi ? '14567 – Elderline (वरिष्ठ नागरिक)' : '14567 – Elderline Support'}
              </h4>
              <p className="text-xs sm:text-sm font-semibold text-slate-700 leading-relaxed">
                {isHindi
                  ? 'वरिष्ठ नागरिकों के लिए सरकारी सहायता, कानूनी परामर्श, देखभाल और भावनात्मक संबल।'
                  : 'National government helpline for senior citizens: care, legal guidance, and emotional support.'}
              </p>
            </div>

            <a
              id="emergency-call-14567"
              href="tel:14567"
              aria-label={isHindi ? '14567 एल्डरलाइन राष्ट्रीय हेल्पलाइन पर कॉल करें' : 'Call 14567 National Elderline Helpline'}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-xs transition-colors min-h-[44px] focus-visible:ring-4 focus-visible:ring-emerald-400"
            >
              <PhoneCall className="w-4 h-4 shrink-0" />
              <span>{isHindi ? '📞 14567 पर कॉल करें' : '📞 Call 14567'}</span>
            </a>
          </div>
        </div>

        {/* Clear Notice: Saathi is not an emergency service */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
          <p className="text-xs text-slate-600 font-semibold leading-relaxed">
            {isHindi
              ? '💡 महत्वपूर्ण: साथी एक डिजिटल सहायक है, कोई आपातकालीन सेवा नहीं। किसी भी संकट में ऊपर दिए गए आधिकारिक राष्ट्रीय नंबरों पर संपर्क करें।'
              : '💡 Notice: Saathi is a digital assistant, not an emergency service. In any urgent crisis, please reach out to official helplines directly.'}
          </p>
        </div>
      </div>
    </section>
  );
};
