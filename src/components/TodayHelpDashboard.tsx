import React from 'react';
import {
  Pill,
  Stethoscope,
  Sparkles,
  Check,
  X,
  ArrowRight,
  BellRing,
  Calendar,
  ClipboardList,
  Shield,
  Sun,
} from 'lucide-react';
import { MedicineItem, AppointmentItem, Language, ReminderItem } from '../types';
import { formatSeniorMedicineTime } from '../utils/dateHelpers';

interface TodayHelpDashboardProps {
  language: Language;
  medicines: MedicineItem[];
  appointments: AppointmentItem[];
  reminders?: ReminderItem[];
  onOpenMedicineTracker: () => void;
  onOpenAppointments: (prepareAppId?: string) => void;
  onOpenScamChecker: () => void;
  onOpenDocExplainer: () => void;
  onMarkMedTaken: (id: string) => void;
  onMarkMedSkipped?: (id: string) => void;
  onSelectPrompt: (prompt: string) => void;
  onSetAppointmentReminder?: (app: AppointmentItem) => void;
  onPrepareAppointment?: (app: AppointmentItem) => void;
}

export const TodayHelpDashboard: React.FC<TodayHelpDashboardProps> = ({
  language,
  medicines,
  appointments,
  reminders = [],
  onOpenMedicineTracker,
  onOpenAppointments,
  onOpenScamChecker,
  onOpenDocExplainer,
  onMarkMedTaken,
  onMarkMedSkipped,
  onSelectPrompt,
  onSetAppointmentReminder,
  onPrepareAppointment,
}) => {
  const isHindi = language === 'hi';

  // Find pending medicines
  const pendingMedicines = medicines.filter((m) => m.status === 'pending');
  const nextMedicine = pendingMedicines[0] || null;
  const pendingMedsCount = pendingMedicines.length;

  // Find next upcoming appointment
  const upcomingAppointment = appointments.find((a) => a.status === 'upcoming') || appointments[0] || null;

  // Pending reminders
  const pendingReminders = reminders.filter((r) => !r.completed);

  const hasAnyReminders = Boolean(nextMedicine || upcomingAppointment);
  const hasAnyPending = pendingMedsCount > 0 || Boolean(upcomingAppointment) || pendingReminders.length > 0;

  const handlePrepareDoctorVisit = (app: AppointmentItem) => {
    if (onPrepareAppointment) {
      onPrepareAppointment(app);
    } else {
      onOpenAppointments(app.id);
    }
  };

  return (
    <section
      id="today-help-section"
      aria-labelledby="today-help-heading"
      className="w-full max-w-4xl mx-auto px-4 py-6 sm:py-8"
    >
      <div className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-amber-300 shadow-sm space-y-5">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h3
                id="today-help-heading"
                className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5"
              >
                <span>{isHindi ? "आज की मदद • Care Hub" : "Today's Help • Care Hub"}</span>
              </h3>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-300 text-[11px] font-bold">
                Demo Data
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
              {isHindi
                ? 'आज के सबसे जरूरी काम, दवाइयाँ और रिमाइंडर्स'
                : 'Your most important reminders, medicines, and schedule for today'}
            </p>
          </div>
          <span className="text-xs sm:text-sm font-bold text-amber-900 bg-amber-100/80 px-3.5 py-1.5 rounded-xl border border-amber-200 self-start sm:self-center">
            📅 {new Date().toLocaleDateString(isHindi ? 'hi-IN' : 'en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
        </div>

        {/* FEATURE 1: 🌞 आज का Saathi Summary */}
        <div
          id="saathi-daily-summary"
          className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border-2 border-amber-300 space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl" aria-hidden="true">🌞</span>
              <h4 className="text-base sm:text-lg font-black text-amber-950">
                {isHindi ? '🌞 आज का Saathi Summary' : "🌞 Today's Saathi Summary"}
              </h4>
            </div>
            <span className="text-xs font-bold text-amber-900 bg-amber-200/80 px-2.5 py-1 rounded-full border border-amber-300">
              {isHindi ? 'आज का दिन' : "Today's Overview"}
            </span>
          </div>

          {hasAnyPending ? (
            <div className="space-y-2 pt-1">
              {/* Medicines overview */}
              {pendingMedsCount > 0 ? (
                <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white border border-amber-200">
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800">
                    <span className="text-base">💊</span>
                    <span>
                      {isHindi
                        ? `${pendingMedsCount} दवाइयाँ बाकी हैं`
                        : `${pendingMedsCount} medicine(s) pending`}
                      {nextMedicine ? ` (${nextMedicine.name} • ${nextMedicine.time})` : ''}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenMedicineTracker}
                    className="text-xs font-black text-amber-800 hover:text-amber-950 underline shrink-0 px-2 py-1 min-h-[36px] flex items-center"
                  >
                    {isHindi ? 'दवा देखें' : 'View'}
                  </button>
                </div>
              ) : medicines.length > 0 ? (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-emerald-200 text-xs sm:text-sm font-bold text-emerald-800">
                  <span className="text-base">💊</span>
                  <span>{isHindi ? 'आज की सभी दवाइयाँ ली जा चुकी हैं।' : 'All medicines completed for today.'}</span>
                </div>
              ) : null}

              {/* Appointment overview */}
              {upcomingAppointment && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-white border border-amber-200">
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800">
                    <span className="text-base">📅</span>
                    <span>
                      {isHindi
                        ? `डॉक्टर से मुलाकात ${upcomingAppointment.time} पर है (${upcomingAppointment.doctorOrService})`
                        : `Doctor visit at ${upcomingAppointment.time} (${upcomingAppointment.doctorOrService})`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePrepareDoctorVisit(upcomingAppointment)}
                    aria-label={isHindi ? `${upcomingAppointment.doctorOrService} अपॉइंटमेंट की तैयारी करें` : `Prepare checklist for ${upcomingAppointment.doctorOrService}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-black text-xs shrink-0 self-start sm:self-center shadow-2xs min-h-[38px] cursor-pointer"
                  >
                    <ClipboardList className="w-3.5 h-3.5" />
                    <span>{isHindi ? '📋 Appointment की तैयारी करें' : '📋 Prepare Checklist'}</span>
                  </button>
                </div>
              )}

              {/* Tasks / Reminders overview */}
              {pendingReminders.length > 0 && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-amber-200 text-xs sm:text-sm font-bold text-slate-800">
                  <span className="text-base">📋</span>
                  <span>
                    {isHindi
                      ? `जरूरी काम: ${pendingReminders[0].titleHi || pendingReminders[0].title} (${pendingReminders[0].timeLabelHi || pendingReminders[0].time})`
                      : `Pending task: ${pendingReminders[0].title} (${pendingReminders[0].timeLabel || pendingReminders[0].time})`}
                  </span>
                </div>
              )}

              {/* Safety reminder */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-100/70 border border-amber-300 text-xs sm:text-sm font-black text-amber-950">
                <span className="text-base">🛡️</span>
                <span>
                  {isHindi
                    ? '🛡️ OTP/PIN किसी के साथ साझा न करें।'
                    : '🛡️ Safety Reminder: Never share your OTP or PIN with anyone.'}
                </span>
              </div>
            </div>
          ) : (
            /* Friendly empty state */
            <div className="p-4 rounded-xl bg-white border border-amber-200 text-center space-y-1.5">
              <p className="text-sm sm:text-base font-black text-slate-800">
                {isHindi
                  ? 'आज के लिए कोई जरूरी काम नहीं है। Saathi आपके साथ है।'
                  : 'No urgent tasks for today. Saathi is always with you.'}
              </p>
              <p className="text-xs font-bold text-amber-900">
                {isHindi
                  ? '🛡️ OTP/PIN किसी के साथ साझा न करें।'
                  : '🛡️ Safety Reminder: Never share your OTP or PIN.'}
              </p>
            </div>
          )}
        </div>

        {/* Empty State when no reminders exist */}
        {!hasAnyReminders && (
          <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
            <p className="text-base sm:text-lg font-bold text-slate-700">
              {isHindi
                ? 'आज आपके लिए कोई जरूरी काम pending नहीं है।'
                : 'No pending tasks for today.'}
            </p>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {isHindi
                ? 'आप निश्चिंत रहें। यदि किसी नई दवा या डॉक्टर अपॉइंटमेंट की जरूरत हो तो नीचे विकल्प चुनें।'
                : 'You are all caught up! You can add new medicines or appointments anytime.'}
            </p>
          </div>
        )}

        {/* Cards Grid: Medicine & Appointment */}
        {hasAnyReminders && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. 💊 दवा (Medicine Reminder) */}
            <div className="bg-amber-50/40 p-4 sm:p-5 rounded-2xl border-2 border-emerald-200 flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-800 uppercase tracking-wider">
                    <Pill className="w-4 h-4 text-emerald-600" />
                    <span>{isHindi ? '💊 दवा रिमाइंडर' : '💊 Medicine Reminder'}</span>
                  </span>
                  {nextMedicine ? (
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                      {isHindi ? 'बाकी है' : 'Pending'}
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      {isHindi ? 'सभी पूरी' : 'Completed'}
                    </span>
                  )}
                </div>

                {nextMedicine ? (
                  <div>
                    <p className="text-sm font-black text-amber-900">
                      {isHindi
                        ? `💊 आपकी अगली दवा ${nextMedicine.time} पर है।`
                        : `💊 Your next medicine is at ${nextMedicine.time}.`}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-lg font-black text-slate-900 leading-snug mt-1">
                        {nextMedicine.name}
                      </h4>
                      {nextMedicine.isDemo && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-600 border border-slate-300">
                          Demo Data
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm font-extrabold text-slate-700 mt-0.5">
                      {formatSeniorMedicineTime(
                        nextMedicine.time,
                        nextMedicine.startDate,
                        nextMedicine.rawTime,
                        language
                      )}
                    </p>
                    <p className="text-xs text-slate-600 font-medium mt-1">
                      {isHindi ? nextMedicine.instructionsHi || nextMedicine.dosage : nextMedicine.instructions || nextMedicine.dosage}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm font-bold text-slate-600 py-3">
                    {isHindi ? 'आज आपके लिए कोई जरूरी काम pending नहीं है।' : 'No medicines pending for today.'}
                  </p>
                )}
              </div>

              {nextMedicine ? (
                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onMarkMedTaken(nextMedicine.id)}
                    aria-label={isHindi ? `${nextMedicine.name} दवाई ले ली चिह्नित करें` : `Mark ${nextMedicine.name} as taken`}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs transition-all min-h-[44px] focus-visible:ring-4 focus-visible:ring-emerald-400 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isHindi ? 'ले ली' : 'Taken'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onMarkMedSkipped && onMarkMedSkipped(nextMedicine.id)}
                    aria-label={isHindi ? `${nextMedicine.name} दवाई छोड़ें चिह्नित करें` : `Mark ${nextMedicine.name} as skipped`}
                    className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-extrabold text-xs sm:text-sm border border-slate-300 transition-all min-h-[44px] focus-visible:ring-4 focus-visible:ring-slate-400 cursor-pointer"
                  >
                    <span>{isHindi ? 'छोड़ें' : 'Skip'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={onOpenMedicineTracker}
                    aria-label={isHindi ? 'दवाइयों का पूरा शेड्यूल देखें' : 'View full medicine schedule'}
                    className="px-3 py-2.5 rounded-xl bg-white hover:bg-amber-100 text-amber-900 font-extrabold text-xs sm:text-sm border border-amber-300 min-h-[44px] cursor-pointer focus-visible:ring-4 focus-visible:ring-amber-400"
                    title={isHindi ? 'दवाइयों की सूची देखें' : 'View full medicine list'}
                  >
                    <span>{isHindi ? 'दवा देखें' : 'View Med'}</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onOpenMedicineTracker}
                  className="w-full py-2.5 px-3 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 text-center min-h-[44px] flex items-center justify-center"
                >
                  {isHindi ? 'दवाइयों का शेड्यूल देखें →' : 'View Schedule →'}
                </button>
              )}
            </div>

            {/* 2. 🩺 अगली Appointment */}
            <div className="bg-amber-50/40 p-4 sm:p-5 rounded-2xl border-2 border-sky-200 flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-black text-sky-800 uppercase tracking-wider">
                    <Stethoscope className="w-4 h-4 text-sky-600" />
                    <span>{isHindi ? '🩺 डॉक्टर अपॉइंटमेंट' : '🩺 Doctor Appointment'}</span>
                  </span>
                  {upcomingAppointment && (
                    <span className="text-xs font-bold text-sky-900 bg-sky-100 px-2.5 py-0.5 rounded-full border border-sky-200">
                      {upcomingAppointment.date}
                    </span>
                  )}
                </div>

                {upcomingAppointment ? (
                  <div>
                    <p className="text-sm font-black text-sky-900">
                      {isHindi
                        ? `🩺 आपकी appointment ${upcomingAppointment.date.toLowerCase() === 'tomorrow' || upcomingAppointment.date.includes('कल') ? 'कल' : upcomingAppointment.date} ${upcomingAppointment.time} पर है।`
                        : `🩺 Your appointment is ${upcomingAppointment.date} at ${upcomingAppointment.time}.`}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-lg font-black text-slate-900 leading-snug mt-1">
                        {upcomingAppointment.doctorOrService}
                      </h4>
                      {upcomingAppointment.isDemo && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-600 border border-slate-300">
                          Demo Data
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 font-medium mt-1">
                      {upcomingAppointment.specialty} • {upcomingAppointment.location}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm font-bold text-slate-600 py-3">
                    {isHindi
                      ? 'आज आपके लिए कोई जरूरी काम pending नहीं है।'
                      : 'No upcoming appointments scheduled.'}
                  </p>
                )}
              </div>

              {upcomingAppointment ? (
                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePrepareDoctorVisit(upcomingAppointment)}
                    aria-label={isHindi ? `${upcomingAppointment.doctorOrService} डॉक्टर के लिए तैयारी करें` : `Prepare checklist for ${upcomingAppointment.doctorOrService}`}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs transition-all min-h-[44px] focus-visible:ring-4 focus-visible:ring-sky-400 cursor-pointer"
                  >
                    <ClipboardList className="w-4 h-4" />
                    <span>{isHindi ? '📋 डॉक्टर के लिए तैयारी करें' : '📋 Prepare for Doctor Visit'}</span>
                  </button>

                  {onSetAppointmentReminder && (
                    <button
                      type="button"
                      onClick={() => onSetAppointmentReminder(upcomingAppointment)}
                      aria-label={isHindi ? `${upcomingAppointment.doctorOrService} अपॉइंटमेंट का रिमाइंडर सेट करें` : `Set reminder for appointment with ${upcomingAppointment.doctorOrService}`}
                      className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-sky-50 text-sky-900 font-extrabold text-xs sm:text-sm border border-sky-300 flex items-center gap-1 transition-all min-h-[44px] focus-visible:ring-4 focus-visible:ring-sky-400 cursor-pointer"
                    >
                      <BellRing className="w-3.5 h-3.5 text-sky-700" />
                      <span>{isHindi ? 'Reminder लगाएँ' : 'Set Reminder'}</span>
                    </button>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onOpenAppointments()}
                  className="w-full py-2.5 px-3 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 text-center min-h-[44px] flex items-center justify-center"
                >
                  {isHindi ? '+ नई Appointment जोड़ें' : '+ Add Appointment'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* 3. 🤖 Saathi Suggestion */}
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border-2 border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0 font-bold text-base">
              🤖
            </div>
            <div>
              <span className="text-xs font-black text-amber-900 uppercase tracking-wide block">
                {isHindi ? '🤖 Saathi Suggestion' : '🤖 Saathi Suggestion'}
              </span>
              <p className="text-sm sm:text-base font-black text-slate-900 mt-0.5 leading-relaxed">
                {upcomingAppointment
                  ? isHindi
                    ? 'क्या आप appointment के लिए सवाल तैयार करना चाहेंगे?'
                    : 'Would you like to prepare questions and checklist for your appointment?'
                  : isHindi
                  ? 'क्या आपके पास कोई नया मैसेज आया है जिसकी सुरक्षा आप जांचना चाहते हैं?'
                  : 'Did you receive any message or bill you want to check for safety?'}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            {upcomingAppointment ? (
              <button
                type="button"
                onClick={() => handlePrepareDoctorVisit(upcomingAppointment)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs sm:text-sm transition-all min-h-[44px] shadow-xs cursor-pointer"
              >
                {isHindi ? 'तैयारी करें' : 'Prepare Checklist'}
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenScamChecker}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs sm:text-sm transition-all min-h-[44px] shadow-xs cursor-pointer"
              >
                {isHindi ? 'स्कैम चेकर खोलें' : 'Open Scam Checker'}
              </button>
            )}
          </div>
        </div>

        {/* 4. Natural Senior Queries Test Hub */}
        <div className="pt-2 border-t border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <span>💬</span>
              <span>{isHindi ? 'सीधे पूछें (Natural Senior Queries):' : 'Natural Senior Queries:'}</span>
            </span>
            <span className="text-[11px] font-extrabold text-slate-500">
              {isHindi ? 'स्थानीय व त्वरित उत्तर' : 'Instant Local Answers'}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { hi: 'आज मेरा क्या काम है?', en: "What's my schedule today?" },
              { hi: 'मेरी दवा कब है?', en: 'When is my medicine?' },
              { hi: 'कल डॉक्टर के पास जाना है', en: 'Doctor visit tomorrow' },
              { hi: 'डॉक्टर से क्या पूछूं?', en: 'What to ask doctor?' },
              { hi: 'यह मैसेज सुरक्षित है?', en: 'Is this message safe?' },
            ].map((q, idx) => (
              <button
                key={idx}
                type="button"
                id={`natural-query-btn-${idx}`}
                onClick={() => onSelectPrompt(isHindi ? q.hi : q.en)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-amber-100/80 active:bg-amber-200 text-slate-800 hover:text-amber-950 text-xs font-bold border border-slate-300 hover:border-amber-400 transition-all cursor-pointer min-h-[36px] flex items-center gap-1"
              >
                <span>“{isHindi ? q.hi : q.en}”</span>
                <span className="text-amber-700">→</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
