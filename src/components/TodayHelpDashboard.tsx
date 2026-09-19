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
} from 'lucide-react';
import { MedicineItem, AppointmentItem, Language } from '../types';
import { formatSeniorMedicineTime } from '../utils/dateHelpers';

interface TodayHelpDashboardProps {
  language: Language;
  medicines: MedicineItem[];
  appointments: AppointmentItem[];
  onOpenMedicineTracker: () => void;
  onOpenAppointments: () => void;
  onOpenScamChecker: () => void;
  onOpenDocExplainer: () => void;
  onMarkMedTaken: (id: string) => void;
  onMarkMedSkipped?: (id: string) => void;
  onSelectPrompt: (prompt: string) => void;
  onSetAppointmentReminder?: (app: AppointmentItem) => void;
}

export const TodayHelpDashboard: React.FC<TodayHelpDashboardProps> = ({
  language,
  medicines,
  appointments,
  onOpenMedicineTracker,
  onOpenAppointments,
  onOpenScamChecker,
  onOpenDocExplainer,
  onMarkMedTaken,
  onMarkMedSkipped,
  onSelectPrompt,
  onSetAppointmentReminder,
}) => {
  const isHindi = language === 'hi';

  // Find next pending medicine
  const pendingMedicines = medicines.filter((m) => m.status === 'pending');
  const nextMedicine = pendingMedicines[0] || null;

  // Find next upcoming appointment
  const upcomingAppointment = appointments.find((a) => a.status === 'upcoming') || appointments[0] || null;

  const hasAnyReminders = Boolean(nextMedicine || upcomingAppointment);

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
            <h3
              id="today-help-heading"
              className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5"
            >
              <span>{isHindi ? 'आज की मदद' : "Today's Help"}</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
              {isHindi
                ? 'आज के सबसे जरूरी काम और रिमाइंडर्स'
                : 'Your most important reminders and tasks for today'}
            </p>
          </div>
          <span className="text-xs sm:text-sm font-bold text-amber-900 bg-amber-100/80 px-3.5 py-1.5 rounded-xl border border-amber-200 self-start sm:self-center">
            📅 {new Date().toLocaleDateString(isHindi ? 'hi-IN' : 'en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
        </div>

        {/* Empty State when no reminders exist */}
        {!hasAnyReminders && (
          <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
            <p className="text-base sm:text-lg font-bold text-slate-700">
              {isHindi
                ? 'आज के लिए कोई जरूरी reminder नहीं है।'
                : 'No pending reminders for today.'}
            </p>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {isHindi
                ? 'आप आराम से रहें। यदि किसी दवा या अपॉइंटमेंट की जरूरत हो तो नीचे बटन दबाएँ।'
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
                    <span>{isHindi ? '💊 दवा' : '💊 Medicine'}</span>
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
                    <h4 className="text-lg font-black text-slate-900 leading-snug">
                      {nextMedicine.name}
                    </h4>
                    <p className="text-xs sm:text-sm font-extrabold text-amber-900 mt-0.5">
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
                    {isHindi ? 'आज के लिए कोई दवा बाकी नहीं है।' : 'No medicines pending for today.'}
                  </p>
                )}
              </div>

              {nextMedicine ? (
                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onMarkMedTaken(nextMedicine.id)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs transition-all min-h-[44px] focus-visible:ring-4 focus-visible:ring-emerald-400 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isHindi ? 'ले ली' : 'Taken'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onMarkMedSkipped && onMarkMedSkipped(nextMedicine.id)}
                    className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-extrabold text-xs sm:text-sm border border-slate-300 transition-all min-h-[44px] focus-visible:ring-4 focus-visible:ring-slate-400 cursor-pointer"
                  >
                    <span>{isHindi ? 'छोड़ें' : 'Skip'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={onOpenMedicineTracker}
                    className="px-3 py-2.5 rounded-xl bg-white hover:bg-amber-100 text-amber-900 font-extrabold text-xs border border-amber-300 min-h-[44px] cursor-pointer"
                    title={isHindi ? 'दवाइयों की सूची देखें' : 'View full medicine list'}
                  >
                    <span>{isHindi ? 'सभी दवाइयाँ' : 'All'}</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onOpenMedicineTracker}
                  className="w-full py-2 px-3 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 text-center"
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
                    <span>{isHindi ? '🩺 अगली Appointment' : '🩺 Next Appointment'}</span>
                  </span>
                  {upcomingAppointment && (
                    <span className="text-xs font-bold text-sky-900 bg-sky-100 px-2.5 py-0.5 rounded-full border border-sky-200">
                      {upcomingAppointment.date}
                    </span>
                  )}
                </div>

                {upcomingAppointment ? (
                  <div>
                    <h4 className="text-lg font-black text-slate-900 leading-snug">
                      {upcomingAppointment.doctorOrService}
                    </h4>
                    <p className="text-xs sm:text-sm font-extrabold text-slate-700 mt-0.5">
                      {upcomingAppointment.date} • {upcomingAppointment.time}
                    </p>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      {upcomingAppointment.specialty} • {upcomingAppointment.location}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm font-bold text-slate-600 py-3">
                    {isHindi
                      ? 'अभी कोई upcoming appointment नहीं है।'
                      : 'No upcoming appointments scheduled.'}
                  </p>
                )}
              </div>

              {upcomingAppointment ? (
                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onOpenAppointments}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs transition-all min-h-[44px] focus-visible:ring-4 focus-visible:ring-sky-400 cursor-pointer"
                  >
                    <span>{isHindi ? 'विवरण देखें' : 'View Details'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {onSetAppointmentReminder && (
                    <button
                      type="button"
                      onClick={() => onSetAppointmentReminder(upcomingAppointment)}
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
                  onClick={onOpenAppointments}
                  className="w-full py-2 px-3 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 text-center"
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
              <p className="text-sm font-bold text-slate-900 mt-0.5 leading-relaxed">
                {upcomingAppointment
                  ? isHindi
                    ? `आपकी अगली appointment ${upcomingAppointment.date.toLowerCase()} है। क्या आप उसके लिए तैयारी करना चाहेंगे?`
                    : `Your next appointment is ${upcomingAppointment.date.toLowerCase()}. Would you like to prepare the visit checklist?`
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
                onClick={onOpenAppointments}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs sm:text-sm transition-all min-h-[44px] shadow-xs cursor-pointer"
              >
                {isHindi ? 'हाँ, मदद करें' : 'Yes, Help Me'}
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenScamChecker}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs sm:text-sm transition-all min-h-[44px] shadow-xs cursor-pointer"
              >
                {isHindi ? 'स्कैम चेकर खोलें' : 'Open Scam Checker'}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
