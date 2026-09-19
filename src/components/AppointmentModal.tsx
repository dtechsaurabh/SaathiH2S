import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Stethoscope,
  Plus,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  RefreshCw,
  Edit2,
  Trash2,
  BellRing,
  AlertTriangle,
  ArrowRight,
  FileText,
} from 'lucide-react';
import { AppointmentItem, Language, AppointmentPrepResult, ReminderItem } from '../types';
import { speakText } from '../utils/speech';
import { aiService } from '../services/aiService';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  soundEnabled: boolean;
  appointments: AppointmentItem[];
  onUpdateAppointments: (appointments: AppointmentItem[]) => void;
  onResetDemo: () => void;
  onSetReminder?: (reminder: ReminderItem) => void;
  initialPrepareAppId?: string | null;
}

const DEFAULT_DOCTOR_CHECKLIST = [
  { id: 'med_list', hi: 'अपनी दवाइयों की सूची साथ रखें', en: 'Keep your current medicine list ready' },
  { id: 'old_reports', hi: 'पुराने reports/documents साथ रखें', en: 'Keep previous medical reports & test documents ready' },
  { id: 'main_issue', hi: 'अपनी मुख्य समस्या/सवाल लिख लें', en: 'Write down your primary concern or symptoms' },
  { id: 'ask_meds', hi: 'डॉक्टर से अपनी दवाओं के बारे में पूछें', en: 'Ask the doctor about your current medications' },
  { id: 'next_visit', hi: 'अगली appointment/date पूछें', en: 'Clarify the follow-up appointment date & next steps' },
];

const DEFAULT_DOCTOR_QUESTIONS = [
  { hi: 'मेरी समस्या के बारे में आपकी क्या सलाह है?', en: 'What is your recommendation regarding my current concern?' },
  { hi: 'इस दवा का उद्देश्य क्या है?', en: 'What is the purpose and expected outcome of this medication?' },
  { hi: 'मुझे किन बातों पर ध्यान देना चाहिए?', en: 'Are there any precautions or warning signs I should watch out for?' },
  { hi: 'अगली बार कब मिलना चाहिए?', en: 'When should I schedule my next follow-up visit?' },
  { hi: 'कौन-सी जानकारी या report साथ लानी चाहिए?', en: 'Which tests or documents should I bring for the next visit?' },
];

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  language,
  soundEnabled,
  appointments,
  onUpdateAppointments,
  onResetDemo,
  onSetReminder,
  initialPrepareAppId,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAppId, setEditingAppId] = useState<string | null>(null);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [prepLoading, setPrepLoading] = useState(false);
  const [prepResult, setPrepResult] = useState<AppointmentPrepResult | null>(null);
  const [prepError, setPrepError] = useState<string | null>(null);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);
  const [deleteConfirmAppId, setDeleteConfirmAppId] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('saathi_doctor_checklist_items');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const notificationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSubmittingRef = useRef(false);

  // Toggle checklist item and persist in localStorage
  const toggleChecklistItem = (key: string) => {
    setCheckedItems((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem('saathi_doctor_checklist_items', JSON.stringify(updated));
      } catch {
        // ignore storage quota errors
      }
      return updated;
    });
  };

  // If initialPrepareAppId is provided, open that appointment's checklist automatically
  useEffect(() => {
    if (isOpen && initialPrepareAppId) {
      const target = appointments.find((a) => a.id === initialPrepareAppId);
      if (target) {
        setSelectedAppId(target.id);
      }
    }
  }, [isOpen, initialPrepareAppId, appointments]);

  // Keyboard Escape listener
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

  // Clean up any pending notification timeout on unmount
  useEffect(() => {
    return () => {
      if (notificationTimerRef.current) {
        clearTimeout(notificationTimerRef.current);
      }
    };
  }, []);

  const showNotification = (msg: string, durationMs = 3000) => {
    if (notificationTimerRef.current) {
      clearTimeout(notificationTimerRef.current);
    }
    setNotificationMsg(msg);
    notificationTimerRef.current = setTimeout(() => {
      setNotificationMsg(null);
      notificationTimerRef.current = null;
    }, durationMs);
  };

  // Form fields
  const [doctorName, setDoctorName] = useState('');
  const [specialty, setSpecialty] = useState('General Physician');
  const [date, setDate] = useState('कल (Tomorrow)');
  const [time, setTime] = useState('11:00 AM');
  const [location, setLocation] = useState('नजदीकी अस्पताल / डिस्पेंसरी');
  const [notes, setNotes] = useState('नियमित जांच व ब्लड प्रेशर चेक');
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;
  const isHindi = language === 'hi';

  const resetForm = () => {
    setDoctorName('');
    setSpecialty('General Physician');
    setDate('कल (Tomorrow)');
    setTime('11:00 AM');
    setLocation('नजदीकी अस्पताल / डिस्पेंसरी');
    setNotes('नियमित जांच व ब्लड प्रेशर चेक');
    setFormError(null);
    setEditingAppId(null);
    setShowAddForm(false);
  };

  const handleStartEdit = (app: AppointmentItem) => {
    setEditingAppId(app.id);
    setDoctorName(app.doctorOrService);
    setSpecialty(app.specialty);
    setDate(app.date);
    setTime(app.time);
    setLocation(app.location);
    setNotes(app.notes || '');
    setShowAddForm(true);
    setDeleteConfirmAppId(null);
  };

  const handleConfirmDelete = (id: string) => {
    const app = appointments.find((a) => a.id === id);
    const updated = appointments.filter((a) => a.id !== id);
    onUpdateAppointments(updated);
    setDeleteConfirmAppId(null);
    if (selectedAppId === id) {
      setSelectedAppId(null);
      setPrepResult(null);
    }
    const msg = isHindi
      ? `${app ? app.doctorOrService : 'Appointment'} हटा दी गई है।`
      : 'Appointment removed.';
    showNotification(msg, 3000);
  };

  const handleSetReminder = (app: AppointmentItem) => {
    const newReminder: ReminderItem = {
      id: `rem-app-${Date.now()}`,
      title: `Doctor: ${app.doctorOrService}`,
      titleHi: `डॉक्टर परामर्श: ${app.doctorOrService}`,
      time: app.time,
      timeLabel: `${app.date}, ${app.time}`,
      timeLabelHi: `${app.date}, ${app.time}`,
      category: 'doctor',
      completed: false,
      status: 'pending',
      notes: `${app.specialty} - ${app.location}`,
      notesHi: `${app.specialty} - ${app.location}`,
      important: true,
      isDemo: false,
    };

    if (onSetReminder) {
      onSetReminder(newReminder);
    }

    const msg = isHindi
      ? `✅ ${app.doctorOrService} के लिए Reminder सेट कर दिया गया है!`
      : `✅ Reminder set for ${app.doctorOrService}!`;
    showNotification(msg, 4000);

    if (soundEnabled) {
      speakText(msg, language);
    }
  };

  const handlePrepareAppointment = async (app: AppointmentItem) => {
    if (selectedAppId === app.id) {
      // Toggle close
      setSelectedAppId(null);
      setPrepResult(null);
      return;
    }

    setSelectedAppId(app.id);
    setPrepLoading(true);
    setPrepError(null);
    setPrepResult(null);

    try {
      const data = await aiService.prepareAppointment(
        app.doctorOrService,
        {
          date: app.date,
          time: app.time,
          notes: `${app.specialty} ${app.notes || ''}`,
        },
        language
      );
      setPrepResult(data);

      if (soundEnabled) {
        const speechMsg = isHindi
          ? `डॉक्टर से मिलने की तैयारी सूची तैयार है। पिछली रिपोर्ट्स साथ रखें।`
          : `Visit preparation checklist ready. Remember to carry past prescriptions.`;
        speakText(speechMsg, language);
      }
    } catch (err) {
      console.error('Appointment prep error:', err);
      setPrepError(
        isHindi
          ? 'तैयारी सूची बनाने में तकनीकी कठिनाई आई। कृपया पुनः प्रयास करें।'
          : 'Unable to prepare checklist right now. Please try again.'
      );
    } finally {
      setPrepLoading(false);
    }
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current) return;
    if (!doctorName.trim()) {
      setFormError(isHindi ? 'कृपया डॉक्टर का नाम लिखें' : 'Please enter doctor or clinic name');
      return;
    }

    isSubmittingRef.current = true;
    try {
      if (editingAppId) {
        const updated = appointments.map((a) => {
          if (a.id === editingAppId) {
            return {
              ...a,
              doctorOrService: doctorName.trim(),
              specialty: specialty.trim() || 'General Physician',
              date: date.trim() || 'Upcoming',
              time: time.trim() || '10:00 AM',
              location: location.trim() || 'Clinic OPD',
              notes: notes.trim(),
            };
          }
          return a;
        });
        onUpdateAppointments(updated);
        const msg = isHindi ? 'अपॉइंटमेंट अपडेट कर दी गई है।' : 'Appointment updated.';
        showNotification(msg, 3000);
        if (soundEnabled) speakText(msg, language);
      } else {
        const newApp: AppointmentItem = {
          id: `app-${Date.now()}`,
          doctorOrService: doctorName.trim(),
          specialty: specialty.trim() || 'General Physician',
          date: date.trim() || 'कल',
          time: time.trim() || '11:00 AM',
          location: location.trim() || 'Clinic OPD',
          notes: notes.trim(),
          status: 'upcoming',
          isDemo: false,
        };

        onUpdateAppointments([...appointments, newApp]);
        const msg = isHindi
          ? `${newApp.doctorOrService} के लिए अपॉइंटमेंट जोड़ दी गई है।`
          : `Appointment with ${newApp.doctorOrService} added.`;
        showNotification(msg, 3000);
        if (soundEnabled) speakText(msg, language);
      }

      resetForm();
    } finally {
      isSubmittingRef.current = false;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="appointment-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border-2 border-slate-300 shadow-xl space-y-5 my-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 border border-sky-300 flex items-center justify-center text-2xl shrink-0">
              🩺
            </div>
            <div>
              <h2 id="appointment-title" className="text-xl sm:text-2xl font-black text-slate-900">
                {isHindi ? '🩺 मेरी Appointments' : '🩺 My Appointments'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-semibold mt-0.5">
                {isHindi
                  ? 'डॉक्टर से मुलाकात, तारीख, समय व तैयारी'
                  : 'Doctor visits, schedule, and preparation checklist'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label={isHindi ? 'अपॉइंटमेंट बंद करें' : 'Close appointments'}
            className="p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors focus-visible:ring-4 focus-visible:ring-sky-400 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Notification message toast */}
        {notificationMsg && (
          <div
            role="status"
            aria-live="polite"
            className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs sm:text-sm font-bold flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notificationMsg}</span>
          </div>
        )}

        {/* Primary Action Button: + नई Appointment */}
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              resetForm();
              setShowAddForm(!showAddForm);
            }}
            className="px-5 py-3 rounded-2xl bg-sky-700 hover:bg-sky-800 text-white font-black text-sm sm:text-base flex items-center gap-2 shadow-xs transition-all focus-visible:ring-4 focus-visible:ring-sky-400 min-h-[48px] cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            <span>{isHindi ? '+ नई Appointment' : '+ Add Appointment'}</span>
          </button>

          <button
            type="button"
            onClick={onResetDemo}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 min-h-[44px]"
            title={isHindi ? 'डेमो अपॉइंटमेंट वापस लाएं' : 'Reset sample visits'}
            aria-label={isHindi ? 'डेमो अपॉइंटमेंट रीसेट करें' : 'Reset demo appointments'}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isHindi ? 'डेमो रीसेट' : 'Reset Demo'}</span>
          </button>
        </div>

        {/* Add / Edit Form */}
        {showAddForm && (
          <form
            onSubmit={handleSubmitForm}
            className="p-5 rounded-2xl bg-slate-50 border-2 border-sky-300 space-y-3.5 text-slate-900"
          >
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-sky-700" />
              <span>
                {editingAppId
                  ? isHindi ? 'अपॉइंटमेंट संपादित करें' : 'Edit Appointment'
                  : isHindi ? 'नई अपॉइंटमेंट जोड़ें' : 'Add New Appointment'}
              </span>
            </h3>

            {formError && (
              <div
                id="app-form-error"
                role="alert"
                aria-live="polite"
                className="p-2.5 rounded-xl bg-rose-100 text-rose-900 font-bold text-xs"
              >
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="app-doctor-name" className="text-xs font-bold text-slate-700 block mb-1">
                  {isHindi ? 'डॉक्टर या अस्पताल का नाम*' : 'Doctor / Hospital Name*'}
                </label>
                <input
                  id="app-doctor-name"
                  type="text"
                  value={doctorName}
                  aria-invalid={Boolean(formError)}
                  aria-describedby={formError ? 'app-form-error' : undefined}
                  onChange={(e) => {
                    setDoctorName(e.target.value);
                    if (formError) setFormError(null);
                  }}
                  placeholder={isHindi ? 'उदा: Dr. Sharma' : 'E.g., Dr. Sharma'}
                  className="w-full p-3 rounded-xl border border-slate-300 bg-white font-semibold text-sm text-slate-900 focus:border-sky-600 min-h-[44px]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {isHindi ? 'विशेषज्ञता (Specialty)' : 'Specialty'}
                </label>
                <input
                  type="text"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  placeholder={isHindi ? 'उदा: हृदय रोग विशेषज्ञ (Cardiologist)' : 'E.g., Cardiologist'}
                  className="w-full p-3 rounded-xl border border-slate-300 bg-white font-semibold text-sm text-slate-900 focus:border-sky-600 min-h-[44px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {isHindi ? 'तारीख (Date)' : 'Date'}
                </label>
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder={isHindi ? 'उदा: कल सुबह, 24 Oct' : 'E.g., Tomorrow, 24 Oct'}
                  className="w-full p-3 rounded-xl border border-slate-300 bg-white font-semibold text-sm text-slate-900 focus:border-sky-600 min-h-[44px]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {isHindi ? 'समय (Time)' : 'Time'}
                </label>
                <input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="11:30 AM"
                  className="w-full p-3 rounded-xl border border-slate-300 bg-white font-semibold text-sm text-slate-900 focus:border-sky-600 min-h-[44px]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {isHindi ? 'स्थान / अस्पताल का पता' : 'Location'}
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={isHindi ? 'उदा: मैक्स हॉस्पिटल OPD, कमरा 12' : 'E.g., City Clinic, Room 12'}
                className="w-full p-3 rounded-xl border border-slate-300 bg-white font-semibold text-sm text-slate-900 focus:border-sky-600 min-h-[44px]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {isHindi ? 'नोट्स (समस्या या कारण)' : 'Notes'}
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={isHindi ? 'उदा: बीपी चेक और पुरानी रिपोर्ट दिखाना' : 'E.g., Routine BP check'}
                className="w-full p-3 rounded-xl border border-slate-300 bg-white font-semibold text-sm text-slate-900 focus:border-sky-600 min-h-[44px]"
              />
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-black text-sm min-h-[44px]"
              >
                {editingAppId
                  ? isHindi ? 'अपडेट सहेजें' : 'Save Changes'
                  : isHindi ? 'अपॉइंटमेंट सहेजें' : 'Save Appointment'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-sm min-h-[44px]"
              >
                {isHindi ? 'रद्द करें' : 'Cancel'}
              </button>
            </div>
          </form>
        )}

        {/* Friendly Empty State */}
        {appointments.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
            <p className="text-base sm:text-lg font-bold text-slate-700">
              {isHindi
                ? 'अभी कोई upcoming appointment नहीं है।'
                : 'No upcoming appointments scheduled.'}
            </p>
            <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-sm mx-auto">
              {isHindi
                ? 'जब भी डॉक्टर के पास जाना हो, यहाँ तारीख और समय सुरक्षित कर सकते हैं।'
                : 'Whenever you plan a doctor visit, you can add it here with reminders.'}
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="px-6 py-3 rounded-2xl bg-sky-700 hover:bg-sky-800 text-white font-black text-sm inline-flex items-center gap-2 shadow-xs min-h-[44px]"
              >
                <Plus className="w-4 h-4" />
                <span>{isHindi ? '+ Appointment जोड़ें' : '+ Add Appointment'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Clean Appointment Timeline */
          <div className="space-y-4">
            {appointments.map((app) => {
              const isSelected = selectedAppId === app.id;
              const isDeleting = deleteConfirmAppId === app.id;

              return (
                <div
                  key={app.id}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border-2 border-slate-200 hover:border-sky-300 transition-all space-y-3"
                >
                  {/* Doctor & Date Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-black uppercase text-sky-800 tracking-wider">
                        🩺 {app.specialty}
                      </span>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                          {app.doctorOrService}
                        </h3>
                        {app.isDemo && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-300">
                            Demo Data
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-sky-100 text-sky-900 border border-sky-300">
                        📅 {app.date} • ⏰ {app.time}
                      </span>
                    </div>
                  </div>

                  {/* Notes & Location */}
                  <div className="text-xs sm:text-sm text-slate-700 space-y-1">
                    <p className="flex items-center gap-1.5 font-medium">
                      <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                      <span>{app.location}</span>
                    </p>
                    {app.notes && (
                      <p className="flex items-center gap-1.5 font-medium text-slate-600">
                        <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{app.notes}</span>
                      </p>
                    )}
                  </div>

                  {/* Inline Delete Confirmation Dialog (Safe in Iframes!) */}
                  {isDeleting && (
                    <div className="p-3.5 rounded-xl bg-rose-50 border-2 border-rose-300 space-y-2">
                      <p className="text-xs sm:text-sm font-bold text-rose-950">
                        {isHindi
                          ? `क्या आप सचमुच ${app.doctorOrService} की अपॉइंटमेंट हटाना चाहते हैं?`
                          : `Are you sure you want to delete this appointment with ${app.doctorOrService}?`}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleConfirmDelete(app.id)}
                          aria-label={isHindi ? `${app.doctorOrService} अपॉइंटमेंट हटाना सुनिश्चित करें` : `Confirm delete appointment with ${app.doctorOrService}`}
                          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs sm:text-sm min-h-[44px]"
                        >
                          {isHindi ? 'हाँ, हटाएँ' : 'Yes, Delete'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmAppId(null)}
                          aria-label={isHindi ? 'हटाना रद्द करें' : 'Cancel deletion'}
                          className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold text-xs sm:text-sm min-h-[44px]"
                        >
                          {isHindi ? 'रद्द करें' : 'Cancel'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Actions: विवरण, Reminder, Edit, Delete */}
                  {!isDeleting && (
                    <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* 1. डॉक्टर के लिए तैयारी करें (Prepare for Doctor Visit) */}
                        <button
                          type="button"
                          onClick={() => handlePrepareAppointment(app)}
                          aria-label={isSelected ? (isHindi ? `${app.doctorOrService} तैयारी विवरण बंद करें` : `Hide checklist for ${app.doctorOrService}`) : (isHindi ? `${app.doctorOrService} डॉक्टर के लिए तैयारी करें` : `Prepare checklist for ${app.doctorOrService}`)}
                          className="px-3.5 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-xs min-h-[44px] cursor-pointer focus-visible:ring-4 focus-visible:ring-sky-400"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{isSelected ? (isHindi ? 'तैयारी सूची बंद करें' : 'Hide Checklist') : (isHindi ? '📋 डॉक्टर के लिए तैयारी करें' : '📋 Prepare for Doctor Visit')}</span>
                        </button>

                        {/* 2. Reminder */}
                        <button
                          type="button"
                          onClick={() => handleSetReminder(app)}
                          aria-label={isHindi ? `${app.doctorOrService} अपॉइंटमेंट का रिमाइंडर सेट करें` : `Set reminder for ${app.doctorOrService}`}
                          className="px-3 py-2.5 rounded-xl bg-white hover:bg-sky-50 text-sky-900 border border-sky-300 font-bold text-xs sm:text-sm flex items-center gap-1 min-h-[44px] cursor-pointer focus-visible:ring-4 focus-visible:ring-sky-400"
                        >
                          <BellRing className="w-3.5 h-3.5 text-sky-700" />
                          <span>{isHindi ? 'Reminder' : 'Reminder'}</span>
                        </button>

                        {/* 3. Edit */}
                        <button
                          type="button"
                          onClick={() => handleStartEdit(app)}
                          aria-label={isHindi ? `${app.doctorOrService} अपॉइंटमेंट संपादित करें` : `Edit appointment with ${app.doctorOrService}`}
                          className="px-3 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs sm:text-sm flex items-center gap-1 min-h-[44px] cursor-pointer focus-visible:ring-4 focus-visible:ring-slate-400"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>{isHindi ? 'Edit' : 'Edit'}</span>
                        </button>
                      </div>

                      {/* 4. Delete (Visually separated with confirmation) */}
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmAppId(app.id)}
                        aria-label={isHindi ? `${app.doctorOrService} अपॉइंटमेंट हटाएं` : `Delete appointment with ${app.doctorOrService}`}
                        className="px-3 py-2.5 rounded-xl bg-white hover:bg-rose-50 text-rose-700 hover:text-rose-800 border border-rose-200 font-bold text-xs sm:text-sm flex items-center gap-1 min-h-[44px] cursor-pointer ml-auto focus-visible:ring-4 focus-visible:ring-rose-400"
                        title={isHindi ? 'हटाएँ' : 'Delete'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{isHindi ? 'Delete' : 'Delete'}</span>
                      </button>
                    </div>
                  )}

                  {/* FEATURE 2: Expanded Interactive Doctor Visit Checklist */}
                  {isSelected && (
                    <div className="mt-3 p-4 sm:p-5 rounded-2xl bg-white border-2 border-sky-300 space-y-4 shadow-2xs">
                      {/* Section Title */}
                      <div className="flex items-center justify-between pb-2 border-b border-sky-100">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">🩺</span>
                          <h5 className="text-base sm:text-lg font-black text-slate-900">
                            {isHindi ? 'डॉक्टर विजिट चेकलिस्ट व तैयारी' : 'Doctor Visit Checklist & Preparation'}
                          </h5>
                        </div>
                        <span className="text-xs font-bold text-sky-800 bg-sky-100 px-2.5 py-0.5 rounded-full">
                          {app.doctorOrService}
                        </span>
                      </div>

                      {/* Part 1: डॉक्टर से मिलने से पहले (Interactive Checkboxes) */}
                      <div className="p-3.5 sm:p-4 rounded-xl bg-sky-50/70 border border-sky-200 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <h6 className="text-sm font-black text-sky-950 flex items-center gap-1.5">
                            <span>📋</span>
                            <span>{isHindi ? 'डॉक्टर से मिलने से पहले' : 'Before Meeting the Doctor'}</span>
                          </h6>
                          <span className="text-[11px] font-bold text-slate-500">
                            {isHindi ? 'सामान पैक करते समय टिक करें' : 'Check off items as you pack'}
                          </span>
                        </div>

                        <div className="space-y-2">
                          {DEFAULT_DOCTOR_CHECKLIST.map((item) => {
                            const itemKey = `${app.id}_${item.id}`;
                            const isChecked = Boolean(checkedItems[itemKey]);
                            return (
                              <label
                                key={item.id}
                                className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                                  isChecked
                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                                    : 'bg-white border-slate-200 text-slate-800 hover:border-sky-300'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleChecklistItem(itemKey)}
                                  className="mt-0.5 w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 shrink-0 cursor-pointer"
                                />
                                <span className={`text-xs sm:text-sm font-bold leading-normal ${isChecked ? 'line-through text-slate-500' : ''}`}>
                                  {isHindi ? item.hi : item.en}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {/* Part 2: डॉक्टर से पूछने वाले सवाल (Neutral Communication Questions) */}
                      <div className="p-3.5 sm:p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2.5">
                        <h6 className="text-sm font-black text-amber-950 flex items-center gap-1.5">
                          <span>❓</span>
                          <span>{isHindi ? 'डॉक्टर से पूछने वाले सवाल' : 'Questions to Ask Your Doctor'}</span>
                        </h6>
                        <p className="text-xs text-slate-600 font-semibold">
                          {isHindi
                            ? 'अपनी बातचीत को आसान और स्पष्ट रखने के लिए आप ये सवाल पूछ सकते हैं:'
                            : 'Simple questions to help you understand your health clearly:'}
                        </p>
                        <ul className="space-y-1.5">
                          {DEFAULT_DOCTOR_QUESTIONS.map((q, idx) => (
                            <li
                              key={idx}
                              className="text-xs sm:text-sm font-bold text-slate-800 flex items-start gap-2 bg-white/80 p-2 rounded-lg border border-amber-200/80"
                            >
                              <span className="text-amber-700 font-black shrink-0">•</span>
                              <span>{isHindi ? q.hi : q.en}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Part 3: Supplemental AI generated suggestions (if any) */}
                      {prepLoading && (
                        <div className="flex items-center gap-2 text-sky-900 font-bold text-xs sm:text-sm py-2">
                          <RefreshCw className="w-4 h-4 animate-spin text-sky-600" />
                          <span>{isHindi ? 'अतिरिक्त सुझाव जाँचे जा रहे हैं...' : 'Checking additional suggestions...'}</span>
                        </div>
                      )}

                      {prepResult && prepResult.questionsToAsk.length > 0 && (
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                          <span className="text-xs font-black text-slate-800 block">
                            💡 {isHindi ? 'विशेष परामर्श नोट्स:' : 'Specific notes for this visit:'}
                          </span>
                          <ul className="space-y-1">
                            {prepResult.questionsToAsk.slice(0, 3).map((q: string, idx: number) => (
                              <li key={idx} className="text-xs font-semibold text-slate-700 flex items-start gap-2">
                                <span className="text-sky-600 font-bold">✓</span>
                                <span>{q}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Part 4: Strict Medical Safety Notice */}
                      <div className="p-3 rounded-xl bg-slate-100/90 border border-slate-300 text-slate-700 text-xs font-semibold leading-relaxed">
                        <p>
                          {isHindi
                            ? '⚠️ महत्वपूर्ण: यह तैयारी सूची केवल सहायता और संगठन के लिए है। साथी कोई चिकित्सीय सलाह (medical advice), निदान (diagnosis) या दवा में बदलाव का सुझाव नहीं देता। हमेशा अपने डॉक्टर के निर्देशों का पालन करें।'
                            : '⚠️ Medical Safety Notice: This checklist is for organizational support only. Saathi never provides medical diagnoses or suggests changing medication. Always follow the advice of your qualified healthcare provider.'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
