import React, { useState } from 'react';
import {
  X,
  Pill,
  Plus,
  Clock,
  RotateCcw,
  Check,
  Calendar,
  Sun,
  Sunset,
  Moon,
} from 'lucide-react';
import { MedicineItem, Language } from '../types';
import { speakText } from '../utils/speech';
import { convert24To12Hour, deriveTimeSlot, formatSeniorMedicineTime } from '../utils/dateHelpers';

interface MedicineTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  soundEnabled: boolean;
  medicines: MedicineItem[];
  onUpdateMedicines: (medicines: MedicineItem[]) => void;
  onResetDemo: () => void;
}

export const MedicineTrackerModal: React.FC<MedicineTrackerModalProps> = ({
  isOpen,
  onClose,
  language,
  soundEnabled,
  medicines,
  onUpdateMedicines,
  onResetDemo,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state with native inputs
  const todayDefault = new Date().toISOString().split('T')[0];
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('1 गोली (1 Tablet)');
  const [startDate, setStartDate] = useState(todayDefault);
  const [rawTime, setRawTime] = useState('08:00');
  const [time, setTime] = useState('08:00 AM');
  const [timeSlot, setTimeSlot] = useState<'morning' | 'afternoon' | 'night'>('morning');
  const [frequency, setFrequency] = useState('रोज़ाना नाश्ते के बाद (Daily after breakfast)');
  const [instructions, setInstructions] = useState('गुनगुने पानी के साथ लें (Take with water)');
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;
  const isHindi = language === 'hi';

  const handleTimeChange = (newTime: string) => {
    setRawTime(newTime);
    const formatted = convert24To12Hour(newTime);
    setTime(formatted);
    setTimeSlot(deriveTimeSlot(newTime));
  };

  const handleMarkTaken = (id: string) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updated = medicines.map((m) =>
      m.id === id ? { ...m, status: 'taken' as const, statusTimestamp: nowTime } : m
    );
    onUpdateMedicines(updated);

    const med = medicines.find((m) => m.id === id);
    if (soundEnabled && med) {
      speakText(
        isHindi ? `${med.name} दवाई ली गई। बहुत अच्छा!` : `${med.name} marked as taken. Well done!`,
        language
      );
    }
  };

  const handleMarkSkipped = (id: string) => {
    const updated = medicines.map((m) =>
      m.id === id ? { ...m, status: 'skipped' as const } : m
    );
    onUpdateMedicines(updated);

    const med = medicines.find((m) => m.id === id);
    if (soundEnabled && med) {
      speakText(
        isHindi
          ? `${med.name} नागा हुआ। अगली बार दोहरी खुराक न लें।`
          : `${med.name} marked as skipped. Never take a double dose.`,
        language
      );
    }
  };

  const handleAddMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError(isHindi ? 'कृपया दवाई का नाम लिखें' : 'Please enter medicine name');
      return;
    }

    const formatted12 = convert24To12Hour(rawTime);
    const calculatedSlot = deriveTimeSlot(rawTime);

    const newMed: MedicineItem = {
      id: `med-${Date.now()}`,
      name: name.trim(),
      dosage: dosage.trim() || (isHindi ? '1 गोली' : '1 Tablet'),
      time: formatted12,
      rawTime: rawTime,
      startDate: startDate,
      timeSlot: timeSlot || calculatedSlot,
      frequency,
      frequencyHi: frequency,
      status: 'pending',
      instructions,
      instructionsHi: instructions,
      isDemo: false,
    };

    onUpdateMedicines([...medicines, newMed]);
    setName('');
    setShowAddForm(false);
    setFormError(null);

    if (soundEnabled) {
      speakText(
        isHindi ? `नई दवाई ${newMed.name} जोड़ दी गई है।` : `New medicine ${newMed.name} added.`,
        language
      );
    }
  };

  const slotSections = [
    {
      id: 'morning' as const,
      labelHi: 'सुबह (Morning)',
      labelEn: 'Morning',
      icon: <Sun className="w-5 h-5 text-amber-600" />,
      bg: 'bg-amber-50/60 border-amber-200',
    },
    {
      id: 'afternoon' as const,
      labelHi: 'दोपहर (Afternoon)',
      labelEn: 'Afternoon',
      icon: <Sunset className="w-5 h-5 text-orange-600" />,
      bg: 'bg-orange-50/60 border-orange-200',
    },
    {
      id: 'night' as const,
      labelHi: 'रात (Night)',
      labelEn: 'Night',
      icon: <Moon className="w-5 h-5 text-indigo-600" />,
      bg: 'bg-indigo-50/60 border-indigo-200',
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="med-tracker-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border-2 border-slate-300 shadow-xl space-y-5 my-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-2xl shrink-0">
              💊
            </div>
            <div>
              <h2 id="med-tracker-title" className="text-xl sm:text-2xl font-black text-slate-900">
                {isHindi ? '💊 मेरी दवाइयाँ' : '💊 My Medicines'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-semibold mt-0.5">
                {isHindi ? 'दवाइयों का दैनिक समय और खुराक' : 'Daily pill schedule and reminders'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label={isHindi ? 'बंद करें' : 'Close'}
            className="p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors focus-visible:ring-4 focus-visible:ring-amber-400"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Primary Action Button: + नई दवा जोड़ें */}
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-5 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black text-sm sm:text-base flex items-center gap-2 shadow-xs transition-all focus-visible:ring-4 focus-visible:ring-amber-400 min-h-[48px] cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            <span>{isHindi ? '+ नई दवा जोड़ें' : '+ Add New Medicine'}</span>
          </button>

          <button
            type="button"
            onClick={onResetDemo}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5"
            title={isHindi ? 'डेमो दवाइयां वापस लाएं' : 'Reset sample pills'}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isHindi ? 'डेमो रीसेट' : 'Reset Demo'}</span>
          </button>
        </div>

        {/* Add Medicine Form (with native date & time inputs) */}
        {showAddForm && (
          <form
            onSubmit={handleAddMedicine}
            className="p-5 rounded-2xl bg-slate-50 border-2 border-amber-300 space-y-3.5 text-slate-900"
          >
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-600" />
              <span>{isHindi ? 'नई दवा की जानकारी जोड़ें' : 'Add New Medicine Schedule'}</span>
            </h3>

            {formError && (
              <div className="p-2.5 rounded-xl bg-rose-100 text-rose-900 font-bold text-xs">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="med-name-input" className="text-xs font-bold text-slate-700 block mb-1">
                  {isHindi ? 'दवा का नाम*' : 'Medicine Name*'}
                </label>
                <input
                  id="med-name-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isHindi ? 'उदा: Amlodipine 5mg' : 'E.g., Blood Pressure Medicine'}
                  className="w-full p-3 rounded-xl border border-slate-300 bg-white font-semibold text-sm text-slate-900 focus:border-amber-600 min-h-[44px]"
                />
              </div>

              <div>
                <label htmlFor="med-dosage-input" className="text-xs font-bold text-slate-700 block mb-1">
                  {isHindi ? 'मात्रा (खुराक)' : 'Dosage'}
                </label>
                <input
                  id="med-dosage-input"
                  type="text"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  placeholder={isHindi ? '1 गोली' : '1 Tablet'}
                  className="w-full p-3 rounded-xl border border-slate-300 bg-white font-semibold text-sm text-slate-900 focus:border-amber-600 min-h-[44px]"
                />
              </div>
            </div>

            {/* Native Date and Time Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="med-date-input" className="text-xs font-bold text-slate-700 block mb-1">
                  {isHindi ? 'तारीख (Start Date)' : 'Start Date'}
                </label>
                <input
                  id="med-date-input"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 bg-white font-semibold text-sm text-slate-900 focus:border-amber-600 min-h-[44px]"
                />
              </div>

              <div>
                <label htmlFor="med-time-input" className="text-xs font-bold text-slate-700 block mb-1">
                  {isHindi ? 'दवा का समय (Time)*' : 'Time*'}
                </label>
                <input
                  id="med-time-input"
                  type="time"
                  value={rawTime}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 bg-white font-semibold text-sm text-slate-900 focus:border-amber-600 min-h-[44px]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="med-notes-input" className="text-xs font-bold text-slate-700 block mb-1">
                {isHindi ? 'नियम / निर्देश' : 'Instructions'}
              </label>
              <input
                id="med-notes-input"
                type="text"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder={isHindi ? 'उदा: नाश्ते के बाद गुनगुने पानी से' : 'E.g., After breakfast with water'}
                className="w-full p-3 rounded-xl border border-slate-300 bg-white font-semibold text-sm text-slate-900 focus:border-amber-600 min-h-[44px]"
              />
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-sm min-h-[44px]"
              >
                {isHindi ? 'दवा सहेजें' : 'Save Medicine'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-sm min-h-[44px]"
              >
                {isHindi ? 'रद्द करें' : 'Cancel'}
              </button>
            </div>
          </form>
        )}

        {/* Clear Daily Schedule / Timeline: सुबह, दोपहर, रात */}
        <div className="space-y-4">
          {slotSections.map((section) => {
            const slotMeds = medicines.filter((m) => m.timeSlot === section.id);

            return (
              <div
                key={section.id}
                className={`p-4 sm:p-5 rounded-2xl border ${section.bg} space-y-3`}
              >
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200/80">
                  {section.icon}
                  <h3 className="text-base font-black text-slate-900">
                    {isHindi ? section.labelHi : section.labelEn}
                  </h3>
                  <span className="text-xs font-bold text-slate-500 ml-auto">
                    {slotMeds.length} {isHindi ? 'दवा' : 'med(s)'}
                  </span>
                </div>

                {slotMeds.length === 0 ? (
                  <p className="text-xs sm:text-sm font-semibold text-slate-500 italic py-1">
                    {isHindi ? 'इस समय कोई दवा निर्धारित नहीं है।' : 'No medicines scheduled for this time.'}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {slotMeds.map((med) => {
                      const isTaken = med.status === 'taken';
                      const isSkipped = med.status === 'skipped';

                      return (
                        <div
                          key={med.id}
                          className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-black px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                                ⏰ {med.time}
                              </span>
                              <h4 className="text-base sm:text-lg font-black text-slate-900">
                                {med.name}
                              </h4>
                              {med.isDemo && (
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-300">
                                  Demo Data
                                </span>
                              )}
                              {isTaken && (
                                <span className="text-xs font-black px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  ✓ {isHindi ? 'ली गई' : 'Taken'}
                                </span>
                              )}
                              {isSkipped && (
                                <span className="text-xs font-black px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-300">
                                  {isHindi ? 'नागा' : 'Skipped'}
                                </span>
                              )}
                            </div>
                            <p className="text-xs sm:text-sm font-bold text-slate-600">
                              {formatSeniorMedicineTime(med.time, med.startDate, med.rawTime, language)} • {med.dosage}
                            </p>
                            <p className="text-xs text-slate-500 font-medium">
                              {isHindi ? med.instructionsHi || med.instructions : med.instructions}
                            </p>
                          </div>

                          {/* Large Actions: [✓ ले ली] [छोड़ें / Skip] */}
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleMarkTaken(med.id)}
                              className={`px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all min-h-[44px] cursor-pointer ${
                                isTaken
                                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                              }`}
                            >
                              <Check className="w-4 h-4" />
                              <span>{isHindi ? '✓ ले ली' : '✓ Taken'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleMarkSkipped(med.id)}
                              className={`px-3 py-2.5 rounded-xl font-bold text-xs sm:text-sm border transition-all min-h-[44px] cursor-pointer ${
                                isSkipped
                                  ? 'bg-slate-200 text-slate-700 border-slate-300'
                                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                              }`}
                            >
                              <span>{isHindi ? 'छोड़ें' : 'Skip'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
