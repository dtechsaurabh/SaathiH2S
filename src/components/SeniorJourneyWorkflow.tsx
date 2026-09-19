import React from 'react';
import {
  ArrowRight,
  FileText,
  ShieldAlert,
  Stethoscope,
  Pill,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Play,
} from 'lucide-react';
import { Language, FontSize } from '../types';

interface SeniorJourneyWorkflowProps {
  language: Language;
  fontSize: FontSize;
  onOpenDocExplainer: (sampleKey?: string) => void;
  onOpenScamChecker: (sampleKey?: string) => void;
  onOpenAppointments: (openPrep?: boolean) => void;
  onOpenMedicineTracker: () => void;
}

export const SeniorJourneyWorkflow: React.FC<SeniorJourneyWorkflowProps> = ({
  language,
  fontSize,
  onOpenDocExplainer,
  onOpenScamChecker,
  onOpenAppointments,
  onOpenMedicineTracker,
}) => {
  const isHindi = language === 'hi';

  const journeys = [
    {
      id: 'doc-journey',
      titleHi: '1. कठिन कागजात या बिल समझना',
      titleEn: '1. Understand Documents & Bills',
      icon: <FileText className="w-6 h-6 text-purple-700" />,
      badge: isHindi ? 'AI सरलीकरण' : 'AI Simplification',
      badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
      borderColor: 'border-purple-200 hover:border-purple-400',
      bgColor: 'bg-purple-50/60',
      flowSteps: isHindi
        ? [
            'कठिन पेंशन, सरकारी नोटिस या अस्पताल बिल प्राप्त हुआ।',
            'Saathi जटिल भाषा को 2-3 सरल वाक्यों में समझाता है।',
            'ज़रूरी कदम, अंतिम तारीख व आवश्यक सावधानियां अलग से दिखती हैं।',
            'वरिष्ठ नागरिक बिना घबराए अपना काम आसानी से पूरा करते हैं।',
          ]
        : [
            'Complex pension, government notice, or hospital bill received.',
            'Saathi translates dense jargon into 2-3 crystal-clear sentences.',
            'Action required, deadlines, and precautions are highlighted.',
            'Senior citizen completes the step independently and calmly.',
          ],
      actionLabel: isHindi ? '⚡ टेस्ट करें: पेंशन/बिल समझें' : '⚡ Test: Explain Document',
      onAction: () => onOpenDocExplainer('pension'),
    },
    {
      id: 'scam-journey',
      titleHi: '2. फर्जी SMS व साइबर सुरक्षा',
      titleEn: '2. Scam Check & Cyber Safety',
      icon: <ShieldAlert className="w-6 h-6 text-rose-700" />,
      badge: isHindi ? 'AI फ्रॉड एनालिसिस' : 'AI Fraud Analysis',
      badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
      borderColor: 'border-rose-200 hover:border-rose-400',
      bgColor: 'bg-rose-50/60',
      flowSteps: isHindi
        ? [
            'बिजली कटने या बैंक खाता ब्लॉक होने की धमकी भरा SMS आया।',
            'Scam Checker तुरंत संदेश का विश्लेषण करता है।',
            'जोखिम स्तर (High/Medium), खतरे के संकेत व सुरक्षित कदम स्पष्ट दिखते हैं।',
            'OTP न देने की स्पष्ट चेतावनी और साइबर हेल्पलाइन 1930 का मार्गदर्शन।',
          ]
        : [
            'Threatening SMS received (e.g., power cutoff, bank KYC block).',
            'Scam Checker analyzes the pattern and language signals.',
            'Risk level (High/Medium), warning signs & safe steps displayed.',
            'Clear OTP protection warning & official 1930 helpline guidance.',
          ],
      actionLabel: isHindi ? '⚡ टेस्ट करें: फर्जी SMS जांचें' : '⚡ Test: Check Scam SMS',
      onAction: () => onOpenScamChecker('electricity'),
    },
    {
      id: 'doctor-journey',
      titleHi: '3. डॉक्टर विजिट तैयारी व सवाल',
      titleEn: '3. Doctor Visit Preparation',
      icon: <Stethoscope className="w-6 h-6 text-emerald-700" />,
      badge: isHindi ? 'विजिट चेकलिस्ट' : 'Visit Checklist',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      borderColor: 'border-emerald-200 hover:border-emerald-400',
      bgColor: 'bg-emerald-50/60',
      flowSteps: isHindi
        ? [
            'Upcoming appointment Today’s Help में स्वतः दिखाई देती है।',
            'वरिष्ठ नागरिक "तैयारी करें" पर टैप करते हैं।',
            '5-पॉइंट चेकलिस्ट (पुरानी पर्ची, टेस्ट रिपोर्ट, चश्मा, दवाइयाँ) तैयार।',
            'डॉक्टर से पूछने वाले 4 सहज व व्यावहारिक सवाल सामने आ जाते हैं।',
          ]
        : [
            'Upcoming appointment automatically surfaces in Today’s Help.',
            'Senior taps the "Prepare Visit" action button.',
            '5-point checklist (prescriptions, reports, glasses) organized.',
            '4 comfortable, practical questions ready to ask the physician.',
          ],
      actionLabel: isHindi ? '⚡ टेस्ट करें: डॉक्टर विजिट तैयारी' : '⚡ Test: Doctor Prep',
      onAction: () => onOpenAppointments(true),
    },
    {
      id: 'medicine-journey',
      titleHi: '4. दवाई समय-सारणी व ट्रैकिंग',
      titleEn: '4. Medicine Routine & Tracking',
      icon: <Pill className="w-6 h-6 text-amber-700" />,
      badge: isHindi ? 'स्थानीय व निजी' : 'Local & Private',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      borderColor: 'border-amber-200 hover:border-amber-400',
      bgColor: 'bg-amber-50/60',
      flowSteps: isHindi
        ? [
            'दवा का समय होने पर Today’s Help कार्ड में साफ अलर्ट दिखता है।',
            'खुराक और निर्देश (जैसे भोजन के बाद, गुनगुने पानी से) बड़े अक्षरों में।',
            'दवा लेने के बाद एक टैप में "ले ली (Taken)" या "नागा (Skip)" दबाएं।',
            'लोकल स्टोरेज में सुरक्षित सेव, कोई डेटा लीक नहीं।',
          ]
        : [
            'Clear alerts surface in Today’s Help at scheduled medicine time.',
            'Dosage and instructions (e.g. after meals, with water) in large text.',
            'One-tap "Taken" or "Skip" updates the record instantly.',
            'Securely stored in local device storage without tracking.',
          ],
      actionLabel: isHindi ? '⚡ टेस्ट करें: दवाई रूटीन' : '⚡ Test: Medicine Routine',
      onAction: onOpenMedicineTracker,
    },
  ];

  return (
    <section aria-labelledby="senior-journey-heading" className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="text-center space-y-2 mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black">
          <Sparkles className="w-3.5 h-3.5 text-amber-700" />
          <span>{isHindi ? 'वरिष्ठ नागरिक डिजिटल यात्रा' : 'Senior Citizen Care Journey'}</span>
        </div>
        <h2
          id="senior-journey-heading"
          className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight"
        >
          {isHindi
            ? 'समझें → निर्णय लें → कदम उठाएं → सुरक्षित रहें'
            : 'Understand → Decide → Act → Stay Safe'}
        </h2>
        <p className="text-xs sm:text-sm font-semibold text-slate-600 max-w-2xl mx-auto">
          {isHindi
            ? 'Saathi का हर फ़ीचर वरिष्ठ नागरिक की वास्तविक ज़रूरत से जुड़ा हुआ है। नीचे दिए गए 4 मुख्य वर्कफ़्लोज़ को आप सीधे एक क्लिक में टेस्ट कर सकते हैं:'
            : 'Every Saathi feature is directly connected to real senior needs. You can test each of the 4 complete workflows with one click below:'}
        </p>
      </div>

      {/* 4 Connected Journey Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {journeys.map((j) => (
          <div
            key={j.id}
            id={j.id}
            className={`p-4 sm:p-5 rounded-3xl border-2 ${j.borderColor} ${j.bgColor} flex flex-col justify-between shadow-2xs transition-all`}
          >
            <div>
              {/* Card Header */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-2xs border border-slate-200 flex items-center justify-center shrink-0">
                    {j.icon}
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    {isHindi ? j.titleHi : j.titleEn}
                  </h3>
                </div>
                <span className={`text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full border shrink-0 ${j.badgeColor}`}>
                  {j.badge}
                </span>
              </div>

              {/* Journey Steps */}
              <ol className="space-y-2 mb-4">
                {j.flowSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm font-medium text-slate-700">
                    <span className="w-4 h-4 rounded-full bg-white border border-slate-300 text-[10px] font-black text-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-snug">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Quick Test Action Button */}
            <div className="pt-3 border-t border-slate-200/80">
              <button
                type="button"
                id={`btn-${j.id}-test`}
                onClick={j.onAction}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white hover:bg-slate-900 hover:text-white text-slate-900 font-extrabold text-xs sm:text-sm border-2 border-slate-300 hover:border-slate-900 transition-all shadow-2xs focus-visible:ring-4 focus-visible:ring-amber-400 cursor-pointer min-h-[44px]"
              >
                <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                <span>{j.actionLabel}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
