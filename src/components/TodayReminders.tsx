import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  Circle,
  Plus,
  Clock,
  Volume2,
  CalendarCheck,
} from 'lucide-react';
import { ReminderItem, FontSize, Language } from '../types';
import { speakText } from '../utils/speech';

interface TodayRemindersProps {
  reminders: ReminderItem[];
  onToggleReminder: (id: string) => void;
  onAddReminder: (reminder: ReminderItem) => void;
  language: Language;
  fontSize: FontSize;
  soundEnabled: boolean;
}

export const TodayReminders: React.FC<TodayRemindersProps> = ({
  reminders,
  onToggleReminder,
  onAddReminder,
  language,
  fontSize,
  soundEnabled,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('09:00 PM');
  const [newCategory, setNewCategory] = useState<'medicine' | 'doctor' | 'family' | 'task'>('medicine');
  const [newNotes, setNewNotes] = useState('');

  const handleSpeakReminder = (rem: ReminderItem) => {
    if (!soundEnabled) return;
    const textToSpeak =
      language === 'en'
        ? `Reminder: ${rem.title}. Scheduled for ${rem.time}. ${rem.notes || ''}`
        : `रिमाइंडर: ${rem.titleHi || rem.title}. समय: ${rem.timeLabelHi || rem.time}. ${rem.notesHi || rem.notes || ''}`;
    speakText(textToSpeak, language);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newReminder: ReminderItem = {
      id: `rem-${Date.now()}`,
      title: newTitle,
      titleHi: newTitle,
      time: newTime,
      timeLabel: newTime,
      timeLabelHi: newTime,
      category: newCategory,
      completed: false,
      notes: newNotes,
      notesHi: newNotes,
      important: true,
    };

    onAddReminder(newReminder);
    setNewTitle('');
    setNewNotes('');
    setShowAddModal(false);

    if (soundEnabled) {
      speakText(
        language === 'en'
          ? `New reminder added: ${newTitle} at ${newTime}`
          : `नया रिमाइंडर जुड़ गया है: ${newTitle}, समय: ${newTime}`,
        language
      );
    }
  };

  const getEmoji = (cat: ReminderItem['category']) => {
    switch (cat) {
      case 'medicine':
        return '💊';
      case 'doctor':
        return '🩺';
      case 'family':
        return '👨‍👩‍👧';
      default:
        return '🔔';
    }
  };

  const itemTitleSize =
    fontSize === 'xlarge'
      ? 'text-xl sm:text-2xl'
      : fontSize === 'large'
      ? 'text-lg sm:text-xl'
      : 'text-base sm:text-lg';

  const itemSubSize =
    fontSize === 'xlarge'
      ? 'text-base sm:text-lg'
      : fontSize === 'large'
      ? 'text-sm sm:text-base'
      : 'text-xs sm:text-sm';

  return (
    <section className="max-w-5xl mx-auto px-4 py-6">
      <div className="bg-white rounded-3xl p-5 sm:p-8 border-2 border-slate-200 shadow-sm">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <span>{language === 'en' ? "Today's Reminders" : 'आज के मुख्य रिमाइंडर्स'}</span>
                <span className="text-xs sm:text-sm bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full font-bold border border-slate-300">
                  {reminders.filter(r => !r.completed).length} {language === 'en' ? 'pending' : 'बाकी'}
                </span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                {language === 'en'
                  ? 'Tap the circle to mark as done, or the speaker to hear reminder'
                  : 'काम पूरा होने पर सही (✓) का निशान लगाएं या स्पीकर से सुनें'}
              </p>
            </div>
          </div>

          <button
            id="add-new-reminder-btn"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold shadow-xs cursor-pointer transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>{language === 'en' ? '+ Add Reminder' : '+ नया रिमाइंडर जोड़ें'}</span>
          </button>
        </div>

        {/* Reminders List */}
        <div className="divide-y divide-slate-100 mt-2">
          {reminders.map((rem) => {
            const emoji = getEmoji(rem.category);
            const isCompleted = rem.completed;

            return (
              <div
                key={rem.id}
                id={`reminder-item-${rem.id}`}
                className={`py-4 sm:py-5 flex items-start justify-between gap-3 sm:gap-4 transition-all ${
                  isCompleted ? 'opacity-60 bg-slate-50/60 rounded-2xl px-3 my-1' : ''
                }`}
              >
                <div className="flex items-start gap-3 sm:gap-4 flex-1">
                  {/* Completion Toggle Button */}
                  <button
                    id={`toggle-done-${rem.id}`}
                    onClick={() => onToggleReminder(rem.id)}
                    className="mt-1 p-1 rounded-full text-slate-400 hover:text-emerald-600 focus:text-emerald-600 transition-colors cursor-pointer"
                    title={isCompleted ? 'वापस बाकी करें' : 'पूरा हो गया'}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-8 h-8 sm:w-9 sm:h-9 text-emerald-600 fill-emerald-100" />
                    ) : (
                      <Circle className="w-8 h-8 sm:w-9 sm:h-9 text-slate-300 hover:text-emerald-500 hover:border-emerald-500" />
                    )}
                  </button>

                  {/* Reminder Content */}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xl" role="img" aria-label="category">
                        {emoji}
                      </span>
                      <h4
                        className={`${itemTitleSize} font-bold text-slate-900 ${
                          isCompleted ? 'line-through text-slate-500' : ''
                        }`}
                      >
                        {language === 'en' ? rem.title : rem.titleHi || rem.title}
                      </h4>
                      {isCompleted && (
                        <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
                          {language === 'en' ? 'Done' : 'पूर्ण हुआ'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="text-sm font-semibold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        {language === 'en' ? rem.timeLabel : rem.timeLabelHi}
                      </span>
                    </div>

                    {(rem.notes || rem.notesHi) && (
                      <p className={`${itemSubSize} text-slate-600 font-medium pl-0.5 pt-0.5`}>
                        {language === 'en' ? rem.notes : rem.notesHi || rem.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Listen button */}
                <div className="shrink-0 flex items-center gap-2">
                  <button
                    id={`speak-reminder-${rem.id}`}
                    onClick={() => handleSpeakReminder(rem)}
                    className="p-2 sm:p-2.5 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50 text-slate-700 hover:text-amber-800 transition-colors"
                    title={language === 'en' ? 'Listen to reminder' : 'बोलकर सुनें'}
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Reminder Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border-2 border-slate-300 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h4 className="text-xl font-black text-slate-900">
                {language === 'en' ? 'Add New Reminder' : 'नया रिमाइंडर जोड़ें'}
              </h4>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 text-2xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  {language === 'en' ? 'Category' : 'श्रेणी (Category)'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewCategory('medicine')}
                    className={`p-2.5 rounded-xl border text-sm font-bold flex items-center justify-center gap-1.5 ${
                      newCategory === 'medicine'
                        ? 'bg-sky-100 border-sky-400 text-sky-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span>💊</span>
                    <span>{language === 'en' ? 'Medicine' : 'दवाई'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewCategory('doctor')}
                    className={`p-2.5 rounded-xl border text-sm font-bold flex items-center justify-center gap-1.5 ${
                      newCategory === 'doctor'
                        ? 'bg-emerald-100 border-emerald-400 text-emerald-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span>🩺</span>
                    <span>{language === 'en' ? 'Doctor' : 'डॉक्टर'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewCategory('family')}
                    className={`p-2.5 rounded-xl border text-sm font-bold flex items-center justify-center gap-1.5 ${
                      newCategory === 'family'
                        ? 'bg-purple-100 border-purple-400 text-purple-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span>👨‍👩‍👧</span>
                    <span>{language === 'en' ? 'Family' : 'परिवार'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  {language === 'en' ? 'Reminder Title' : 'रिमाइंडर का नाम'}
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={
                    language === 'en'
                      ? 'e.g. Eye drops before sleeping'
                      : 'जैसे: सोने से पहले आँखों की दवाई'
                  }
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 text-slate-900 text-base focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  {language === 'en' ? 'Time' : 'समय'}
                </label>
                <input
                  type="text"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  placeholder="e.g. 8:30 PM"
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 text-slate-900 text-base focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  {language === 'en' ? 'Notes (Optional)' : 'खास बात / निर्देश (वैकल्पिक)'}
                </label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder={
                    language === 'en' ? 'e.g. Take with warm water' : 'जैसे: गुनगुने पानी के साथ'
                  }
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 text-slate-900 text-base focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 text-base"
                >
                  {language === 'en' ? 'Cancel' : 'रद्द करें'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-base shadow-sm"
                >
                  {language === 'en' ? 'Save Reminder' : 'रिमाइंडर जोड़ें'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
