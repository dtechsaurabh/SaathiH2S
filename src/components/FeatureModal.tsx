import React, { useState } from 'react';
import {
  X,
  Stethoscope,
  Pill,
  ShieldAlert,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  PhoneCall,
  Volume2,
} from 'lucide-react';
import { FeatureCardInfo, FontSize, Language, ReminderItem } from '../types';
import { speakText } from '../utils/speech';

interface FeatureModalProps {
  featureId: FeatureCardInfo['id'] | null;
  onClose: () => void;
  onAskSaathi: (prompt: string) => void;
  onAddReminder: (reminder: ReminderItem) => void;
  language: Language;
  fontSize: FontSize;
  soundEnabled: boolean;
}

export const FeatureModal: React.FC<FeatureModalProps> = ({
  featureId,
  onClose,
  onAskSaathi,
  onAddReminder,
  language,
  fontSize,
  soundEnabled,
}) => {
  if (!featureId) return null;

  // State for Scam Checker interactive tool
  const [scamInput, setScamInput] = useState(
    'Dear Customer, Your electricity power will be disconnected tonight at 9:30 PM because previous bill was not updated. Please immediately call Electricity Officer at 9876543210.'
  );
  const [scamResult, setScamResult] = useState<{
    status: 'dangerous' | 'safe' | 'caution';
    title: string;
    explanation: string;
    actionRules: string[];
  } | null>({
    status: 'dangerous',
    title: language === 'en' ? '🚨 100% FRAUD / SCAM DETECTED' : '🚨 100% फर्जी संदेश / स्कैम (धोखाधड़ी)',
    explanation:
      language === 'en'
        ? 'Official electricity departments NEVER threaten to disconnect power in private SMS with an ordinary mobile number. Cyber criminals send this to panic elders into calling their fake number or paying money.'
        : 'बिजली विभाग कभी भी किसी व्यक्तिगत मोबाइल नंबर से रात में अचानक बिजली काटने की धमकी नहीं देता। यह ठगों द्वारा बुजुर्गों को डराकर पैसे ऐंठने का आम फ्रॉड है।',
    actionRules:
      language === 'en'
        ? [
            'Do NOT call the phone number mentioned in this message.',
            'Do NOT click any link or send money on UPI.',
            'National Cyber Crime Helpline: Call 1930 if you ever shared OTP accidentally.',
          ]
        : [
            'इस मैसेज में दिए गए नंबर पर कभी फोन न करें।',
            'किसी भी अनजान लिंक या UPI पर पैसे बिल्कुल न भेजें।',
            'राष्ट्रीय साइबर हेल्पलाइन 1930 पर तुरंत शिकायत दर्ज कर सकते हैं।',
          ],
  });

  // State for Doctor Appointment Planner
  const [selectedDoctorType, setSelectedDoctorType] = useState('General Physician');
  const [appointmentDay, setAppointmentDay] = useState('कल सुबह 11:30 बजे');

  // State for Document Explainer
  const [selectedDocType, setSelectedDocType] = useState<'jeevan' | 'hospital' | 'bill'>('jeevan');

  const handleSpeak = (text: string) => {
    if (!soundEnabled) return;
    speakText(text, language);
  };

  const handleAnalyzeScam = () => {
    const text = scamInput.toLowerCase();
    const isSuspicious =
      text.includes('disconnected') ||
      text.includes('cut') ||
      text.includes('bill') ||
      text.includes('lottery') ||
      text.includes('kyc') ||
      text.includes('bank') ||
      text.includes('otp') ||
      text.includes('urgent') ||
      text.includes('kat') ||
      text.includes('कट');

    if (isSuspicious) {
      setScamResult({
        status: 'dangerous',
        title: language === 'en' ? '🚨 HIGH RISK: FAKE / SCAM MESSAGE' : '🚨 सावधान: यह फर्जी / स्कैम संदेश है!',
        explanation:
          language === 'en'
            ? 'This message creates fake urgency (threat of disconnection, account block, or lottery). Do NOT panic and do NOT follow the instructions.'
            : 'यह संदेश झूठा डर पैदा करके (बिजली कटना, बैंक बंद होना, या लॉटरी) आपको जल्दबाजी में फंसाने की कोशिश कर रहा है। घबराएं बिल्कुल नहीं।',
        actionRules:
          language === 'en'
            ? [
                'Rule 1: NEVER share OTP, ATM PIN or net banking password.',
                'Rule 2: Delete this message or block the sender.',
                'Rule 3: If in doubt, ask your children or visit the local official office.',
              ]
            : [
                'नियम 1: किसी को भी अपना OTP, एटीएम पिन या बैंक पासवर्ड न दें।',
                'नियम 2: इस संदेश को तुरंत डिलीट करें या ब्लॉक करें।',
                'नियम 3: कोई भी संशय हो तो घर के बच्चों से पूछें या सीधा दफ्तर जाएं।',
              ],
      });
    } else {
      setScamResult({
        status: 'safe',
        title: language === 'en' ? '✅ Looks Relatively Safe' : '✅ यह सामान्य संदेश प्रतीत होता है',
        explanation:
          language === 'en'
            ? 'No obvious threat words or suspicious urgent payment demands found.'
            : 'इसमें कोई धमकी या तुरंत पैसे भेजने की मांग नहीं दिखाई दी। फिर भी किसी अनजान लिंक पर क्लिक न करें।',
        actionRules: [
          language === 'en'
            ? 'Still, never disclose financial credentials to strangers.'
            : 'फिर भी किसी अनजान व्यक्ति को फोन पर बैंक विवरण कभी न बताएं।',
        ],
      });
    }
  };

  const handleAddDoctorReminder = () => {
    onAddReminder({
      id: `rem-${Date.now()}`,
      title: `Doctor Visit – ${selectedDoctorType}`,
      titleHi: `डॉक्टर से मुलाक़ात – ${selectedDoctorType}`,
      time: appointmentDay,
      timeLabel: appointmentDay,
      timeLabelHi: appointmentDay,
      category: 'doctor',
      completed: false,
      notes: 'Carry previous prescription & test reports. Wear comfortable shoes.',
      notesHi: 'पुरानी पर्ची और टेस्ट रिपोर्ट साथ ले जाएं। आरामदायक जूते पहनें।',
      important: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-8 border-2 border-slate-300 shadow-2xl space-y-6 my-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            {featureId === 'doctor' && (
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800">
                <Stethoscope className="w-6 h-6" />
              </div>
            )}
            {featureId === 'medicine' && (
              <div className="w-12 h-12 rounded-2xl bg-sky-100 border border-sky-300 flex items-center justify-center text-sky-800">
                <Pill className="w-6 h-6" />
              </div>
            )}
            {featureId === 'scam' && (
              <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
                <ShieldAlert className="w-6 h-6" />
              </div>
            )}
            {featureId === 'document' && (
              <div className="w-12 h-12 rounded-2xl bg-purple-100 border border-purple-300 flex items-center justify-center text-purple-800">
                <FileText className="w-6 h-6" />
              </div>
            )}
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                {featureId === 'doctor' &&
                  (language === 'en' ? 'Doctor Appointment Guide' : 'डॉक्टर अपॉइंटमेंट गाइड')}
                {featureId === 'medicine' &&
                  (language === 'en' ? 'Medicines & Schedule Guide' : 'दवाइयाँ और समय सारिणी')}
                {featureId === 'scam' &&
                  (language === 'en' ? 'Senior Scam & Fraud Checker' : 'धोखाधड़ी / स्कैम जाँच सुरक्षा')}
                {featureId === 'document' &&
                  (language === 'en' ? 'Explain Documents in Plain Words' : 'कागज़ात को सरल शब्दों में समझें')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                {language === 'en'
                  ? 'Specially designed for easy understanding for seniors'
                  : 'बुजुर्गों के लिए विशेष रूप से सरल और स्पष्ट'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 1. DOCTOR APPOINTMENT VIEW */}
        {featureId === 'doctor' && (
          <div className="space-y-5">
            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
              <h4 className="font-extrabold text-emerald-950 text-base mb-1">
                {language === 'en'
                  ? 'Plan your doctor visit comfortably:'
                  : 'डॉक्टर से मिलने की आरामदायक तैयारी:'}
              </h4>
              <p className="text-xs sm:text-sm text-emerald-800 font-medium">
                {language === 'en'
                  ? 'Select the doctor type to see the exact checklist of papers to carry and questions to ask.'
                  : 'डॉक्टर का प्रकार चुनें, ताकि कौन से पर्चे ले जाने हैं और क्या पूछना है, हम आपको समझा सकें।'}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { name: 'General Physician', hi: 'पारिवारिक डॉक्टर' },
                { name: 'Cardiologist', hi: 'हृदय रोग (Heart)' },
                { name: 'Eye Specialist', hi: 'आँखों के डॉक्टर' },
                { name: 'Orthopedic / Knee', hi: 'हड्डी / घुटने' },
              ].map((doc, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedDoctorType(doc.name)}
                  className={`p-3 rounded-2xl border-2 text-center text-xs sm:text-sm font-bold transition-all ${
                    selectedDoctorType === doc.name
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-emerald-50'
                  }`}
                >
                  {language === 'en' ? doc.name : doc.hi}
                </button>
              ))}
            </div>

            {/* Checklist */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3">
              <h5 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>
                  {language === 'en'
                    ? 'Important Checklist to Carry:'
                    : 'साथ ले जाने के लिए ज़रूरी चीजें:'}
                </span>
              </h5>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">1.</span>
                  <span>
                    {language === 'en'
                      ? 'Previous Prescription File & blood test reports'
                      : 'पुरानी डॉक्टर की पर्ची और हालिया ब्लड टेस्ट रिपोर्ट की फ़ाइल'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">2.</span>
                  <span>
                    {language === 'en'
                      ? 'Current ongoing medicines strip (so the doctor sees the exact brand & dose)'
                      : 'वर्तमान में चल रही दवाइयों का पत्ता (ताकि डॉक्टर बिल्कुल सही पावर देख सकें)'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">3.</span>
                  <span>
                    {language === 'en'
                      ? 'Water bottle, reading spectacles, and a light snack if needed'
                      : 'पानी की बोतल, पढ़ने का चश्मा और ज़रूरत पड़ने पर हल्का नाश्ता'}
                  </span>
                </li>
              </ul>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleAddDoctorReminder}
                className="flex-1 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm sm:text-base shadow-xs flex items-center justify-center gap-2"
              >
                <span>{language === 'en' ? 'Add to My Reminders' : 'रिमाइंडर में जोड़ें'}</span>
                <CheckCircle2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  onAskSaathi(
                    `Mujhe kal ${selectedDoctorType} ke paas jana hai. Mujhe kya saval puchne chahiye aur kya taiyari karni chahiye?`
                  );
                  onClose();
                }}
                className="flex-1 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm sm:text-base shadow-xs flex items-center justify-center gap-2"
              >
                <span>
                  {language === 'en'
                    ? 'Ask Saathi to Guide Me Step-by-Step'
                    : 'साथी से पूरा मार्गदर्शन पूछें'}
                </span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* 2. MEDICINES & REMINDERS VIEW */}
        {featureId === 'medicine' && (
          <div className="space-y-5">
            <div className="bg-sky-50 rounded-2xl p-4 border border-sky-200">
              <h4 className="font-extrabold text-sky-950 text-base mb-1">
                {language === 'en'
                  ? 'Daily Pill Schedule & Precautions'
                  : 'दवाइयों का समय और देखभाल'}
              </h4>
              <p className="text-xs sm:text-sm text-sky-800 font-medium">
                {language === 'en'
                  ? 'Taking pills at the exact same hour keeps blood pressure and sugar balanced.'
                  : 'सही समय पर दवाई लेने से बीपी और शुगर हमेशा नियंत्रण में रहते हैं।'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
                <span className="text-xs font-bold text-amber-800">
                  🌅 {language === 'en' ? 'Morning (सुबह)' : 'सुबह (Morning)'}
                </span>
                <p className="text-base font-extrabold text-slate-900">8:00 AM</p>
                <p className="text-xs text-slate-600">
                  {language === 'en' ? 'Thyroid / Empty stomach BP' : 'थायराइड या खाली पेट की गोली'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 space-y-1">
                <span className="text-xs font-bold text-orange-800">
                  ☀️ {language === 'en' ? 'Afternoon (दोपहर)' : 'दोपहर (Afternoon)'}
                </span>
                <p className="text-base font-extrabold text-slate-900">1:30 PM</p>
                <p className="text-xs text-slate-600">
                  {language === 'en' ? 'Multivitamin after lunch' : 'दोपहर के भोजन के बाद विटामिन'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-1">
                <span className="text-xs font-bold text-indigo-800">
                  🌙 {language === 'en' ? 'Night (रात)' : 'रात (Night)'}
                </span>
                <p className="text-base font-extrabold text-slate-900">8:00 PM</p>
                <p className="text-xs text-slate-600">
                  {language === 'en' ? 'BP & Sugar tablet' : 'बीपी और शुगर की गोली (खाने के बाद)'}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs sm:text-sm text-slate-700">
              <span className="font-bold text-slate-900 block">
                💡 {language === 'en' ? 'Saathi Golden Pill Advice:' : 'साथी की सलाह:'}
              </span>
              <p>
                • {language === 'en'
                  ? 'Always use a Weekly Pill Box (7-day organizer) so you never wonder whether you took today\'s tablet.'
                  : 'एक 7-दिन वाला गोली का डिब्बा (Weekly Pill Box) रखें, ताकि कभी भ्रम न हो कि आज की गोली खाई या नहीं।'}
              </p>
              <p>
                • {language === 'en'
                  ? 'Always swallow tablets with lukewarm water, never with hot tea or coffee.'
                  : 'गोलियां हमेशा हल्के गुनगुने पानी से ही निगलें, गरम चाय या कॉफी के साथ कभी न लें।'}
              </p>
            </div>

            <button
              onClick={() => {
                onAskSaathi('Yeh dawai khane se pehle leni hai ya baad mein? Mujhe dawai ke niyam samjhao.');
                onClose();
              }}
              className="w-full py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm sm:text-base shadow-xs flex items-center justify-center gap-2"
            >
              <span>{language === 'en' ? 'Ask Saathi about a Medicine' : 'दवाई के बारे में साथी से पूछें'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* 3. SCAM CHECKER VIEW */}
        {featureId === 'scam' && (
          <div className="space-y-5">
            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-300">
              <h4 className="font-extrabold text-amber-950 text-base mb-1 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-800" />
                <span>
                  {language === 'en'
                    ? 'Check Any Suspicious SMS or Call'
                    : 'संदिग्ध SMS, WhatsApp या कॉल की जाँच'}
                </span>
              </h4>
              <p className="text-xs sm:text-sm text-amber-900 font-medium">
                {language === 'en'
                  ? 'Paste any message below to find out if it is safe or a dangerous fraud.'
                  : 'आया हुआ कोई भी मैसेज नीचे लिखें या चिपकाएं, साथी तुरंत सच बता देगा।'}
              </p>
            </div>

            {/* Quick Sample Scam Buttons */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                {language === 'en' ? 'Try these common fraud examples:' : 'आम फ्रॉड के उदाहरण पर टैप करें:'}
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setScamInput(
                      'Dear Customer, Your electricity power will be disconnected tonight at 9:30 PM because previous bill was not updated. Please immediately call 9876543210.'
                    )
                  }
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-800 text-xs font-bold border border-slate-300"
                >
                  ⚡ {language === 'en' ? 'Electricity Disconnect Scam' : 'बिजली कटने का मैसेज'}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setScamInput(
                      'Dear SBI User, Your Bank KYC has been suspended today. Click http://bit.ly/sbi-update-now to prevent your account from being frozen.'
                    )
                  }
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-800 text-xs font-bold border border-slate-300"
                >
                  🏦 {language === 'en' ? 'Bank KYC Suspended Scam' : 'बैंक KYC बंद होने का मैसेज'}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setScamInput(
                      'Congratulations! You have won Rs 25,00,000 in KBC Lottery. Call Rana Pratap Singh on WhatsApp to claim prize.'
                    )
                  }
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-800 text-xs font-bold border border-slate-300"
                >
                  🎁 {language === 'en' ? 'Lottery Winner Scam' : '25 लाख की लॉटरी का फ्रॉड'}
                </button>
              </div>
            </div>

            {/* Input message box */}
            <div>
              <textarea
                rows={3}
                value={scamInput}
                onChange={(e) => setScamInput(e.target.value)}
                placeholder="मैसेज यहाँ लिखें या पेस्ट करें..."
                className="w-full p-4 rounded-2xl border-2 border-slate-300 text-slate-900 text-sm sm:text-base font-medium focus:border-amber-500 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleAnalyzeScam}
                className="mt-2 w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-sm sm:text-base shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-5 h-5" />
                <span>{language === 'en' ? 'Check this Message Now' : 'इस मैसेज की जाँच करें'}</span>
              </button>
            </div>

            {/* Analysis Result */}
            {scamResult && (
              <div
                className={`rounded-2xl p-5 border-2 space-y-3 ${
                  scamResult.status === 'dangerous'
                    ? 'bg-red-50 border-red-300 text-red-950'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-950'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-base sm:text-lg font-black">{scamResult.title}</span>
                  <button
                    onClick={() =>
                      handleSpeak(`${scamResult.title}. ${scamResult.explanation}`)
                    }
                    className="p-1.5 rounded-lg bg-white/70 hover:bg-white text-slate-700 shadow-2xs"
                    title="सुनें"
                  >
                    <Volume2 className="w-5 h-5 text-amber-700" />
                  </button>
                </div>

                <p className="text-xs sm:text-sm font-semibold leading-relaxed">
                  {scamResult.explanation}
                </p>

                <div className="space-y-1.5 pt-1">
                  <span className="text-xs font-black uppercase tracking-wider block">
                    {language === 'en' ? 'What you should do:' : 'आपको क्या करना चाहिए:'}
                  </span>
                  <ul className="space-y-1 text-xs sm:text-sm font-medium">
                    {scamResult.actionRules.map((r, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="font-bold">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Helpline button */}
                <div className="pt-2 border-t border-red-200/80 flex items-center justify-between text-xs sm:text-sm">
                  <span className="font-bold flex items-center gap-1.5 text-red-900">
                    <PhoneCall className="w-4 h-4" />
                    <span>Cyber Crime Helpline: 1930</span>
                  </span>
                  <span className="text-slate-500 font-medium">
                    {language === 'en' ? 'Toll Free Govt Helpline' : 'निशुल्क सरकारी नंबर'}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. EXPLAIN DOCUMENTS VIEW */}
        {featureId === 'document' && (
          <div className="space-y-5">
            <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200">
              <h4 className="font-extrabold text-purple-950 text-base mb-1">
                {language === 'en'
                  ? 'Understand Official Papers Simply'
                  : 'भारी भरकम कागज़ात को 3 आसान लाइनों में समझें'}
              </h4>
              <p className="text-xs sm:text-sm text-purple-800 font-medium">
                {language === 'en'
                  ? 'No legal jargon or small-print headaches. Saathi summarizes what matters.'
                  : 'न कोई कठिन अंग्रेजी शब्द, न कोई घबराहट। सीधा और साफ मतलब समझिए।'}
              </p>
            </div>

            {/* Document Type Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                onClick={() => setSelectedDocType('jeevan')}
                className={`p-3 rounded-2xl border-2 text-center text-xs sm:text-sm font-bold transition-all ${
                  selectedDocType === 'jeevan'
                    ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                📜 {language === 'en' ? 'Pension Life Certificate' : 'पेंशन जीवन प्रमाण पत्र'}
              </button>
              <button
                onClick={() => setSelectedDocType('hospital')}
                className={`p-3 rounded-2xl border-2 text-center text-xs sm:text-sm font-bold transition-all ${
                  selectedDocType === 'hospital'
                    ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                🏥 {language === 'en' ? 'Hospital Discharge Summary' : 'अस्पताल डिस्चार्ज बिल'}
              </button>
              <button
                onClick={() => setSelectedDocType('bill')}
                className={`p-3 rounded-2xl border-2 text-center text-xs sm:text-sm font-bold transition-all ${
                  selectedDocType === 'bill'
                    ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                💡 {language === 'en' ? 'Electricity / Tax Notice' : 'बिजली या नगर पालिका नोटिस'}
              </button>
            </div>

            {/* Plain explanation cards */}
            <div className="bg-white rounded-2xl p-5 border-2 border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-extrabold text-purple-900 uppercase">
                  {selectedDocType === 'jeevan' && (language === 'en' ? 'Jeevan Pramaan Guidance' : 'जीवन प्रमाण पत्र नियम')}
                  {selectedDocType === 'hospital' && (language === 'en' ? 'Discharge Bill Guidance' : 'डिस्चार्ज बिल नियम')}
                  {selectedDocType === 'bill' && (language === 'en' ? 'Notice Guidance' : 'नोटिस नियम')}
                </span>
                <button
                  onClick={() =>
                    handleSpeak(
                      selectedDocType === 'jeevan'
                        ? 'जीवन प्रमाण पत्र के लिए डाकिया घर आकर बायोमेट्रिक मशीन से डिजिटल प्रमाण पत्र बना देगा। इसके लिए सिर्फ आधार कार्ड और PPO नंबर चाहिए।'
                        : 'अस्पताल के बिल में डॉक्टर विजिट, रूम रेंट और दवाओं का विवरण अलग-अलग लिखा होता है।'
                    )
                  }
                  className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  <Volume2 className="w-5 h-5 text-purple-700" />
                </button>
              </div>

              {selectedDocType === 'jeevan' && (
                <div className="space-y-2 text-xs sm:text-sm text-slate-700">
                  <p className="font-semibold text-slate-900">
                    {language === 'en'
                      ? '1. No need to stand in long bank lines: The India Post Payments Bank postman can visit your home to generate your biometric Life Certificate.'
                      : '1. बैंक की लंबी लाइन में खड़े होने की ज़रूरत नहीं: डाकिया खुद घर आकर बायोमेट्रिक मशीन से आपका जीवन प्रमाण पत्र बना देता है।'}
                  </p>
                  <p>
                    {language === 'en'
                      ? '2. What is needed: Keep your Aadhaar Card, PPO (Pension Payment Order) Number, and Bank Passbook ready.'
                      : '2. ज़रूरी कागज़: बस आपका आधार कार्ड, PPO नंबर और बैंक पासबुक।'}
                  </p>
                  <p>
                    {language === 'en'
                      ? '3. Cost: Standard charge is only about ₹50-₹70, and confirmation SMS comes instantly on your mobile.'
                      : '3. लागत: इसका शुल्क सिर्फ ₹50-₹70 के लगभग होता है और तुरंत मोबाइल पर पक्की रसीद का SMS आ जाता है।'}
                  </p>
                </div>
              )}

              {selectedDocType === 'hospital' && (
                <div className="space-y-2 text-xs sm:text-sm text-slate-700">
                  <p className="font-semibold text-slate-900">
                    {language === 'en'
                      ? '1. Check the Pharmacy & Consumables itemization: Hospitals list medicine strips and syringes separately from room rent.'
                      : '1. दवाओं और सामान की सूची देखें: अस्पताल में कमरे के किराए के अलावा दवाइयों का बिल अलग से लिखा होता है।'}
                  </p>
                  <p>
                    {language === 'en'
                      ? '2. Next Review Date: Look at the last paragraph of the summary for the doctor\'s follow-up visit date.'
                      : '2. अगली बार कब दिखाना है: पर्ची के अंत में डॉक्टर से दोबारा मिलने की तारीख लिखी होती है।'}
                  </p>
                </div>
              )}

              {selectedDocType === 'bill' && (
                <div className="space-y-2 text-xs sm:text-sm text-slate-700">
                  <p className="font-semibold text-slate-900">
                    {language === 'en'
                      ? '1. Check Due Date & Net Payable: Only the Net Payable Amount before due date is required.'
                      : '1. अंतिम तारीख और कुल राशि: हमेशा "Net Payable Amount" ही देखें जो नियत तारीख से पहले भरना होता है।'}
                  </p>
                  <p>
                    {language === 'en'
                      ? '2. Security Deposit adjustments: Government electricity boards sometimes ask for a one-time refundable security deposit.'
                      : '2. सुरक्षा जमा (Security Deposit): कभी-कभी बिजली बोर्ड सालाना अतिरिक्त सिक्योरिटी जमा मांगता है जो वापस होने योग्य होती है।'}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                onAskSaathi('Pension life certificate (Jeevan Pramaan) kaise banega? Mujhe step-by-step samjhao.');
                onClose();
              }}
              className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm sm:text-base shadow-xs flex items-center justify-center gap-2"
            >
              <span>{language === 'en' ? 'Ask Saathi for Full Document Help' : 'साथी से कागज़ात का पूरा विवरण पूछें'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
