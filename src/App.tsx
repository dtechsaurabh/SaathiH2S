import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { TodayHelpDashboard } from './components/TodayHelpDashboard';
import { FeatureCards } from './components/FeatureCards';
import { TodayReminders } from './components/TodayReminders';
import { AssistantChat } from './components/AssistantChat';
import { TrustSafetySection } from './components/TrustSafetySection';
import { VoiceModal } from './components/VoiceModal';
import { AccessibilitySettingsModal } from './components/AccessibilitySettingsModal';
import { ScamCheckerModal } from './components/ScamCheckerModal';
import { DocumentExplainerModal } from './components/DocumentExplainerModal';
import { MedicineTrackerModal } from './components/MedicineTrackerModal';
import { AppointmentModal } from './components/AppointmentModal';

import {
  loadSeniorSettings,
  saveSeniorSettings,
  loadMedicines,
  saveMedicines,
  loadAppointments,
  saveAppointments,
  loadReminders,
  saveReminders,
  resetDemoData,
  DEFAULT_SETTINGS,
} from './utils/storage';
import {
  SeniorSettings,
  MedicineItem,
  AppointmentItem,
  ReminderItem,
  ChatMessage,
  FeatureCardInfo,
} from './types';
import { speakText, stopSpeaking } from './utils/speech';
import { aiService } from './services/aiService';
import { Heart, Shield, Phone, Sparkles, SlidersHorizontal, RotateCcw } from 'lucide-react';

export default function App() {
  // 1. Accessibility & Senior Settings (persisted)
  const [settings, setSettings] = useState<SeniorSettings>(loadSeniorSettings);

  // 2. Data State (persisted with demo fallbacks)
  const [medicines, setMedicines] = useState<MedicineItem[]>(loadMedicines);
  const [appointments, setAppointments] = useState<AppointmentItem[]>(loadAppointments);
  const [reminders, setReminders] = useState<ReminderItem[]>(loadReminders);

  // 3. Modal Dialogs State
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);
  const [isScamCheckerOpen, setIsScamCheckerOpen] = useState(false);
  const [isDocExplainerOpen, setIsDocExplainerOpen] = useState(false);
  const [isMedicineTrackerOpen, setIsMedicineTrackerOpen] = useState(false);
  const [isAppointmentOpen, setIsAppointmentOpen] = useState(false);

  // 4. Chat State
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const isHindi = settings.language === 'hi';
    return [
      {
        id: 'welcome-msg',
        sender: 'saathi',
        text: isHindi
          ? 'नमस्ते! 🙏 मैं Saathi हूँ — आपका Digital Companion। आप मुझसे किसी भी चीज़ के बारे में बिना किसी झिझक के पूछ सकते हैं।'
          : 'Namaste! 🙏 I am Saathi — your Digital Companion. You can ask me about anything without any hesitation.',
        steps: isHindi
          ? [
              'डॉक्टर से मिलने की तैयारी और जरूरी सवालों की सूची बनाना।',
              'दवाइयों का सही समय और नागा न होने का ध्यान रखना।',
              'बिजली बिल या बैंक वाले संदिग्ध मैसेज की सच्चाई पता लगाना।',
              'पेंशन का जीवन प्रमाण पत्र या कोई भारी कागज़ात समझना।',
            ]
          : [
              'Preparing for doctor visits and list of important questions to ask.',
              'Organizing daily medicine timings and reminder alerts.',
              'Checking suspicious SMS or WhatsApp messages for fraud or scams.',
              'Explaining pension life certificates and complicated documents in simple words.',
            ],
        precautions: [
          isHindi
            ? 'याद रखें: साथी आपका अपना मित्र है। हम कभी भी आपसे आपका बैंक पासवर्ड, एटीएम पिन या OTP नहीं मांगते।'
            : 'Remember: Saathi is your personal safe companion. We never ask for your bank passwords, ATM PINs, or OTPs.',
        ],
        timestamp: 'Just now',
      },
    ];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [externalInput, setExternalInput] = useState('');
  const isSendingRef = useRef(false);
  const isInitialMountLang = useRef(true);

  // Clean up any speaking speech synthesis when App unmounts
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  // Stop speech when voice modal opens to avoid feeding audio into microphone
  useEffect(() => {
    if (isVoiceModalOpen) {
      stopSpeaking();
    }
  }, [isVoiceModalOpen]);

  // Persist settings whenever changed
  useEffect(() => {
    saveSeniorSettings(settings);
  }, [settings]);

  // Persist medicines whenever changed
  useEffect(() => {
    saveMedicines(medicines);
  }, [medicines]);

  // Persist appointments whenever changed
  useEffect(() => {
    saveAppointments(appointments);
  }, [appointments]);

  // Persist reminders whenever changed
  useEffect(() => {
    saveReminders(reminders);
  }, [reminders]);

  // Update Welcome message when language changes (skip initial mount to prevent double render)
  useEffect(() => {
    if (isInitialMountLang.current) {
      isInitialMountLang.current = false;
      return;
    }
    const isHindi = settings.language === 'hi';
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'welcome-msg') {
        return [
          {
            id: 'welcome-msg',
            sender: 'saathi',
            text: isHindi
              ? 'नमस्ते! 🙏 मैं Saathi हूँ — आपका Digital Companion। आप मुझसे किसी भी चीज़ के बारे में बिना किसी झिझक के पूछ सकते हैं।'
              : 'Namaste! 🙏 I am Saathi — your Digital Companion. You can ask me about anything without any hesitation.',
            steps: isHindi
              ? [
                  'डॉक्टर से मिलने की तैयारी और जरूरी सवालों की सूची बनाना।',
                  'दवाइयों का सही समय और नागा न होने का ध्यान रखना।',
                  'बिजली बिल या बैंक वाले संदिग्ध मैसेज की सच्चाई पता लगाना।',
                  'पेंशन का जीवन प्रमाण पत्र या कोई भारी कागज़ात समझना।',
                ]
              : [
                  'Preparing for doctor visits and list of important questions to ask.',
                  'Organizing daily medicine timings and reminder alerts.',
                  'Checking suspicious SMS or WhatsApp messages for fraud or scams.',
                  'Explaining pension life certificates and complicated documents in simple words.',
                ],
            precautions: [
              isHindi
                ? 'याद रखें: साथी आपका अपना मित्र है। हम कभी भी आपसे आपका बैंक पासवर्ड, एटीएम पिन या OTP नहीं मांगते।'
                : 'Remember: Saathi is your personal safe companion. We never ask for your bank passwords, ATM PINs, or OTPs.',
            ],
            timestamp: 'Just now',
          },
        ];
      }
      return prev;
    });
  }, [settings.language]);

  // Settings update helpers
  const handleUpdateSettings = useCallback((newSettings: Partial<SeniorSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      if (newSettings.soundEnabled === false) {
        stopSpeaking();
      }
      return updated;
    });
  }, []);

  const handleToggleSound = useCallback((enabled: boolean) => {
    if (!enabled) stopSpeaking();
    setSettings((prev) => ({ ...prev, soundEnabled: enabled }));
  }, []);

  // Medicine quick actions
  const handleMarkMedicineTaken = useCallback((id: string) => {
    setMedicines((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: 'taken', statusTimestamp: new Date().toLocaleTimeString() } : m))
    );
    if (settings.soundEnabled) {
      speakText(
        settings.language === 'hi'
          ? 'दवाई दर्ज कर ली गई है। बहुत अच्छा!'
          : 'Pill recorded as taken. Very good!',
        settings.language,
        undefined,
        settings.voiceSpeed
      );
    }
  }, [settings.soundEnabled, settings.language, settings.voiceSpeed]);

  const handleMarkMedicineSkipped = useCallback((id: string) => {
    setMedicines((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: 'skipped' } : m))
    );
    if (settings.soundEnabled) {
      speakText(
        settings.language === 'hi'
          ? 'दवाई नागा दर्ज कर ली गई है। अगली बार दोहरी खुराक न लें।'
          : 'Medicine marked as skipped. Please do not take a double dose next time.',
        settings.language,
        undefined,
        settings.voiceSpeed
      );
    }
  }, [settings.soundEnabled, settings.language, settings.voiceSpeed]);

  // Reminder actions
  const handleToggleReminder = useCallback((id: string) => {
    setReminders((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  }, []);

  const handleAddReminder = useCallback((newReminder: ReminderItem) => {
    setReminders((prev) => [newReminder, ...prev]);
  }, []);

  // Feature card router
  const handleSelectFeature = useCallback((id: FeatureCardInfo['id']) => {
    switch (id) {
      case 'doctor':
        setIsAppointmentOpen(true);
        break;
      case 'medicine':
        setIsMedicineTrackerOpen(true);
        break;
      case 'scam':
        setIsScamCheckerOpen(true);
        break;
      case 'document':
        setIsDocExplainerOpen(true);
        break;
    }
  }, []);

  // Chat message sending with centralized aiService & automatic connected action detection
  const handleSendMessage = useCallback(async (userText: string) => {
    const trimmed = (userText || '').trim();
    if (!trimmed || isSendingRef.current || isLoading) return;

    isSendingRef.current = true;
    setIsLoading(true);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);

    // Contextual feature intent detection to link features directly for senior convenience
    const lower = trimmed.toLowerCase();
    let detectedAction: ChatMessage['actionLink'] = undefined;

    if (
      lower.includes('doctor') ||
      lower.includes('डॉक्टर') ||
      lower.includes('appointment') ||
      lower.includes('अस्पताल') ||
      lower.includes('hospital') ||
      lower.includes('अपॉइंटमेंट') ||
      lower.includes('clinic')
    ) {
      detectedAction = {
        label: 'Open Doctor Appointments & Prep',
        labelHi: 'डॉक्टर अपॉइंटमेंट व तैयारी खोलें',
        feature: 'doctor',
      };
    } else if (
      lower.includes('medicine') ||
      lower.includes('dawai') ||
      lower.includes('दवाई') ||
      lower.includes('दवा') ||
      lower.includes('pill') ||
      lower.includes('goli') ||
      lower.includes('tablet')
    ) {
      detectedAction = {
        label: 'Open Medicine Reminders',
        labelHi: 'दवाइयाँ रिमाइंडर्स खोलें',
        feature: 'medicine',
      };
    } else if (
      lower.includes('scam') ||
      lower.includes('धोखा') ||
      lower.includes('otp') ||
      lower.includes('bijli') ||
      lower.includes('बिजली') ||
      lower.includes('lottery') ||
      lower.includes('kbc') ||
      lower.includes('link') ||
      lower.includes('suspicious') ||
      lower.includes('arrest')
    ) {
      detectedAction = {
        label: 'Check in Scam Checker',
        labelHi: 'संदिग्ध संदेश स्कैम चेकर में जाँचें',
        feature: 'scam',
      };
    } else if (
      lower.includes('document') ||
      lower.includes('kaagaz') ||
      lower.includes('कागज़') ||
      lower.includes('pension') ||
      lower.includes('पेंशन') ||
      lower.includes('jeevan pramaan') ||
      lower.includes('certificate') ||
      lower.includes('bill')
    ) {
      detectedAction = {
        label: 'Explain Document in Simple Words',
        labelHi: 'कागज़ात समझने वाला टूल खोलें',
        feature: 'document',
      };
    }

    try {
      const data = await aiService.sendChatMessage(trimmed, settings.language, 'general', {
        medicines,
        appointments,
        currentSection: 'Dashboard',
      });

      const saathiMsg: ChatMessage = {
        id: `saathi-${Date.now()}`,
        sender: 'saathi',
        text: data.reply || (settings.language === 'hi' ? 'मैं आपकी सहायता के लिए प्रस्तुत हूँ:' : 'Here is how I can guide you:'),
        steps: data.steps,
        precautions: data.precautions,
        clarificationQuestion: data.clarificationQuestion,
        actionDisclaimer: data.actionDisclaimer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source,
        actionLink: detectedAction,
      };

      setMessages((prev) => [...prev, saathiMsg]);

      // Read aloud if sound enabled
      if (settings.soundEnabled) {
        let textToSpeak = saathiMsg.text;
        if (saathiMsg.steps && saathiMsg.steps.length > 0) {
          textToSpeak += '. ' + saathiMsg.steps.slice(0, 2).join('. ');
        }
        speakText(textToSpeak, settings.language, undefined, settings.voiceSpeed);
      }
    } catch (err) {
      console.warn('Chat request fallback:', err);
      const isHi = settings.language === 'hi';
      const fallbackMsg: ChatMessage = {
        id: `saathi-${Date.now()}`,
        sender: 'saathi',
        text: isHi
          ? 'बिल्कुल चिंता न करें। मैं आपके साथ हूँ। आइए इसे शांत मन से कदम-दर-कदम समझें:'
          : 'Do not worry at all. I am right here with you. Let us solve this step by step:',
        steps: isHi
          ? [
              'शांत मन से अपनी बात बताएं, कोई जल्दबाजी नहीं है।',
              'यदि यह डॉक्टर से मिलने के बारे में है, तो अपनी पुरानी पर्ची और टेस्ट रिपोर्ट तैयार रखें।',
              'यदि यह किसी फोन कॉल या मैसेज के बारे में है, तो किसी अनजान लिंक पर क्लिक बिल्कुल न करें।',
            ]
          : [
              'Take a deep breath and keep calm.',
              'If this is about a doctor visit, keep your previous file and medicines ready.',
              'If this is about an SMS or WhatsApp, never click links or share bank OTPs.',
            ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionLink: detectedAction,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      if (settings.soundEnabled) {
        speakText(fallbackMsg.text, settings.language, undefined, settings.voiceSpeed);
      }
    } finally {
      setIsLoading(false);
      isSendingRef.current = false;
    }
  }, [isLoading, settings.language, settings.soundEnabled, settings.voiceSpeed, medicines, appointments]);

  const handleSelectPrompt = useCallback((promptText: string) => {
    setExternalInput(promptText);
    const element = document.getElementById('saathi-assistant-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleResetAllDemo = () => {
    resetDemoData();
    setMedicines(loadMedicines());
    setAppointments(loadAppointments());
    setReminders(loadReminders());
    if (settings.soundEnabled) {
      speakText(
        settings.language === 'hi'
          ? 'डेमो डेटा फिर से रीसेट कर दिया गया है।'
          : 'Demo reminders and schedules have been reset.',
        settings.language,
        undefined,
        settings.voiceSpeed
      );
    }
  };

  // Keyboard accessibility: Close any open modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsVoiceModalOpen(false);
        setIsAccessibilityOpen(false);
        setIsScamCheckerOpen(false);
        setIsDocExplainerOpen(false);
        setIsMedicineTrackerOpen(false);
        setIsAppointmentOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Font size multiplier class for the root wrapper
  const rootSizeClass =
    settings.fontSize === 'xlarge'
      ? 'text-lg sm:text-xl'
      : settings.fontSize === 'large'
      ? 'text-base sm:text-lg'
      : 'text-sm sm:text-base';

  const isHindi = settings.language === 'hi';

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors ${
        settings.highContrast
          ? 'high-contrast bg-black text-white selection:bg-amber-400 selection:text-black'
          : 'bg-[#F8F9FA] text-slate-900 selection:bg-amber-200'
      } ${settings.reduceMotion ? 'motion-reduce' : ''} ${rootSizeClass}`}
    >
      {/* Skip Navigation Link for Keyboard & Screen Reader Users (WCAG 2.4.1) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-amber-600 focus:text-white focus:rounded-xl focus:font-black focus:shadow-xl focus:outline-hidden focus:ring-4 focus:ring-amber-300"
      >
        {isHindi ? 'सीधे मुख्य सामग्री पर जाएँ (Skip to main content)' : 'Skip to main content'}
      </a>

      {/* 1. Header with Font, Voice, Accessibility Dialog & Language controls */}
      <Header
        fontSize={settings.fontSize}
        setFontSize={(size) => setSettings((s) => ({ ...s, fontSize: size }))}
        language={settings.language}
        setLanguage={(lang) => setSettings((s) => ({ ...s, language: lang }))}
        soundEnabled={settings.soundEnabled}
        setSoundEnabled={handleToggleSound}
        highContrast={settings.highContrast}
        onOpenAccessibility={() => setIsAccessibilityOpen(true)}
      />

      {/* Main Content Area */}
      <main id="main-content" tabIndex={-1} className="flex-1 space-y-4 focus:outline-hidden">
        {/* 2. Homepage Hero Section with large "Talk to Saathi" primary button */}
        <HeroSection
          language={settings.language}
          fontSize={settings.fontSize}
          onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
          onSelectPrompt={handleSelectPrompt}
        />

        {/* 3. Proactive Care Dashboard ("Today's Help" / "आज की सहायता") */}
        <TodayHelpDashboard
          language={settings.language}
          medicines={medicines}
          appointments={appointments}
          onOpenMedicineTracker={() => setIsMedicineTrackerOpen(true)}
          onOpenAppointments={() => setIsAppointmentOpen(true)}
          onOpenScamChecker={() => setIsScamCheckerOpen(true)}
          onOpenDocExplainer={() => setIsDocExplainerOpen(true)}
          onMarkMedTaken={handleMarkMedicineTaken}
          onMarkMedSkipped={handleMarkMedicineSkipped}
          onSelectPrompt={handleSelectPrompt}
          onSetAppointmentReminder={(app) => {
            const reminder: ReminderItem = {
              id: `rem-app-${Date.now()}`,
              title: `Doctor Visit – ${app.doctorOrService}`,
              titleHi: `डॉक्टर अपॉइंटमेंट – ${app.doctorOrService}`,
              time: `${app.date} ${app.time}`,
              timeLabel: `${app.date} at ${app.time}`,
              timeLabelHi: `${app.date} ${app.time} बजे`,
              category: 'doctor',
              completed: false,
              notes: `${app.specialty} at ${app.location}`,
              notesHi: `${app.specialty}, स्थान: ${app.location}`,
              important: true,
            };
            handleAddReminder(reminder);
            if (settings.soundEnabled) {
              speakText(
                settings.language === 'hi'
                  ? 'डॉक्टर अपॉइंटमेंट का रिमाइंडर सुरक्षित कर लिया गया है।'
                  : 'Doctor appointment reminder saved successfully.',
                settings.language,
                undefined,
                settings.voiceSpeed
              );
            }
          }}
        />

        {/* 4. Large Core Service Feature Action Cards */}
        <FeatureCards
          language={settings.language}
          fontSize={settings.fontSize}
          onSelectFeature={handleSelectFeature}
          onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
        />

        {/* 5. Today's Reminders Section */}
        <TodayReminders
          reminders={reminders}
          onToggleReminder={handleToggleReminder}
          onAddReminder={handleAddReminder}
          language={settings.language}
          fontSize={settings.fontSize}
          soundEnabled={settings.soundEnabled}
        />

        {/* 6. Natural Language AI Assistant Section */}
        <AssistantChat
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          language={settings.language}
          fontSize={settings.fontSize}
          soundEnabled={settings.soundEnabled}
          onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
          externalInput={externalInput}
          onSelectFeature={handleSelectFeature}
        />

        {/* 7. Dedicated Trust, Safety & Privacy Section */}
        <TrustSafetySection language={settings.language} />
      </main>

      {/* Senior Safety & Care Footer */}
      <footer className="bg-slate-900 text-white mt-10 py-10 px-4 border-t-4 border-amber-500">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-800 text-center md:text-left">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold text-xl">
                <Heart className="w-6 h-6 fill-white" />
              </div>
              <div>
                <h4 className="text-xl font-bold">साथी Saathi – AI Companion for Seniors</h4>
                <p className="text-xs sm:text-sm text-slate-400 font-medium">
                  {isHindi
                    ? 'बुजुर्गों के लिए सरल, सुरक्षित, सुलभ और विश्वसनीय डिजिटल साथी'
                    : 'Simple, safe, accessible and compassionate AI companion for senior citizens'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm">
              <button
                type="button"
                onClick={handleResetAllDemo}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>{isHindi ? 'डेमो रीसेट करें' : 'Reset Demo Data'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAccessibilityOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                <span>{isHindi ? 'सुलभता सेटिंग्स' : 'Accessibility Settings'}</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-medium text-center sm:text-left">
            <p>
              {isHindi
                ? 'वरिष्ठ नागरिकों के लिए बड़े अक्षर, उच्च कंट्रास्ट, आवाज सहायता और सुरक्षित सर्वर-साइड AI।'
                : 'Built with senior accessibility, high contrast, voice assistance, and privacy-first local storage.'}
            </p>
            <p className="text-amber-400 font-semibold flex items-center gap-1 justify-center">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {isHindi
                  ? 'पूरी तरह सुरक्षित। हम कभी बैंक पासवर्ड, पिन या OTP नहीं मांगते।'
                  : '100% Safe & Private. Never share bank passwords, PINs or OTPs.'}
              </span>
            </p>
          </div>
        </div>
      </footer>

      {/* MODAL 1: Voice Interaction Modal ("Talk to Saathi") */}
      <VoiceModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onSubmitPrompt={(spoken) => {
          handleSendMessage(spoken);
          const element = document.getElementById('saathi-assistant-section');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        language={settings.language}
        fontSize={settings.fontSize}
      />

      {/* MODAL 2: Senior Accessibility Controls Modal */}
      <AccessibilitySettingsModal
        isOpen={isAccessibilityOpen}
        onClose={() => setIsAccessibilityOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onResetSettings={() => {
          setSettings(DEFAULT_SETTINGS);
          saveSeniorSettings(DEFAULT_SETTINGS);
        }}
      />

      {/* MODAL 3: Scam & Fraud Checker Modal */}
      <ScamCheckerModal
        isOpen={isScamCheckerOpen}
        onClose={() => setIsScamCheckerOpen(false)}
        language={settings.language}
        soundEnabled={settings.soundEnabled}
        onAskSaathi={(prompt) => {
          handleSendMessage(prompt);
          const element = document.getElementById('saathi-assistant-section');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      />

      {/* MODAL 4: Plain Language Document Explainer Modal */}
      <DocumentExplainerModal
        isOpen={isDocExplainerOpen}
        onClose={() => setIsDocExplainerOpen(false)}
        language={settings.language}
        soundEnabled={settings.soundEnabled}
        onAskSaathi={(prompt) => {
          handleSendMessage(prompt);
          const element = document.getElementById('saathi-assistant-section');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      />

      {/* MODAL 5: Medicine Schedule & Tracker Modal */}
      <MedicineTrackerModal
        isOpen={isMedicineTrackerOpen}
        onClose={() => setIsMedicineTrackerOpen(false)}
        language={settings.language}
        soundEnabled={settings.soundEnabled}
        medicines={medicines}
        onUpdateMedicines={setMedicines}
        onResetDemo={() => {
          resetDemoData();
          setMedicines(loadMedicines());
        }}
      />

      {/* MODAL 6: Doctor Appointment & Prep Checklist Modal */}
      <AppointmentModal
        isOpen={isAppointmentOpen}
        onClose={() => setIsAppointmentOpen(false)}
        language={settings.language}
        soundEnabled={settings.soundEnabled}
        appointments={appointments}
        onUpdateAppointments={setAppointments}
        onResetDemo={() => {
          resetDemoData();
          setAppointments(loadAppointments());
        }}
      />
    </div>
  );
}
