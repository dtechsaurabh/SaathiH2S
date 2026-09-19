import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Volume2,
  Mic,
  ArrowRight,
} from 'lucide-react';
import { ChatMessage, FontSize, Language } from '../types';
import { speakText } from '../utils/speech';

interface AssistantChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
  language: Language;
  fontSize: FontSize;
  soundEnabled: boolean;
  onOpenVoiceModal: () => void;
  externalInput?: string;
  onSelectFeature?: (feature: 'doctor' | 'medicine' | 'scam' | 'document') => void;
}

export const AssistantChat: React.FC<AssistantChatProps> = ({
  messages,
  onSendMessage,
  isLoading,
  language,
  fontSize,
  soundEnabled,
  onOpenVoiceModal,
  externalInput,
  onSelectFeature,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const isHindi = language === 'hi';

  useEffect(() => {
    if (externalInput) {
      setInputText(externalInput);
    }
  }, [externalInput]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const text = inputText.trim();
    setInputText('');
    await onSendMessage(text);
  };

  const handleSpeak = (msg: ChatMessage) => {
    let fullText = msg.text;
    if (msg.steps && msg.steps.length > 0) {
      fullText += '. ' + msg.steps.join('. ');
    }
    if (msg.precautions && msg.precautions.length > 0) {
      fullText += '. सावधानियां: ' + msg.precautions.join('. ');
    }
    speakText(fullText, language);
  };

  const textClass =
    fontSize === 'xlarge'
      ? 'text-lg sm:text-xl'
      : fontSize === 'large'
      ? 'text-base sm:text-lg'
      : 'text-sm sm:text-base';

  const suggestedPrompts = isHindi
    ? [
        'मुझे appointment बनानी है',
        'मेरी दवा का reminder दिखाओ',
        'यह message सुरक्षित है?',
        'इसे आसान भाषा में समझाओ',
      ]
    : [
        'I need to make a doctor appointment',
        'Show my medicine reminders',
        'Is this message safe?',
        'Explain this in simple words',
      ];

  return (
    <section
      id="saathi-assistant-section"
      aria-labelledby="assistant-chat-heading"
      className="max-w-4xl mx-auto px-4 py-6 sm:py-8"
    >
      <div className="bg-white rounded-3xl border-2 border-slate-300 shadow-sm overflow-hidden space-y-0">
        {/* Chat Header */}
        <div className="bg-amber-600 px-5 sm:px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white/20 flex items-center justify-center text-xl shrink-0">
              🤝
            </div>
            <div>
              <h3 id="assistant-chat-heading" className="text-lg sm:text-xl font-black">
                🤝 Saathi
              </h3>
              <p className="text-xs sm:text-sm text-amber-100 font-semibold">
                {isHindi
                  ? 'आपका धैर्यवान और सुरक्षित सहायक'
                  : 'Your patient and friendly digital companion'}
              </p>
            </div>
          </div>

          {/* Voice Input Trigger */}
          <button
            type="button"
            onClick={onOpenVoiceModal}
            aria-label={isHindi ? 'बोलकर पूछें (माइक खोलें)' : 'Speak to Saathi (Open microphone)'}
            className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer min-h-[44px] focus-visible:ring-4 focus-visible:ring-amber-300"
          >
            <Mic className="w-4 h-4" />
            <span>{isHindi ? 'बोलकर बताएं' : 'Voice'}</span>
          </button>
        </div>

        {/* Chat Messages */}
        <div
          role="log"
          aria-live="polite"
          aria-label={isHindi ? 'बातचीत के संदेश' : 'Conversation messages'}
          className="p-4 sm:p-6 space-y-4 max-h-[500px] overflow-y-auto bg-slate-50/60"
        >
          {/* Welcome Greeting from Saathi if only 0 or 1 message */}
          {messages.length === 0 && (
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center font-bold text-base shrink-0">
                🤝
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-900 shadow-2xs space-y-1 max-w-xl">
                <span className="text-xs font-black text-amber-800 block">
                  🤝 Saathi
                </span>
                <p className={`${textClass} font-semibold leading-relaxed`}>
                  {isHindi
                    ? 'नमस्ते! मैं Saathi हूँ। आप आज किस काम में मेरी मदद चाहते हैं?'
                    : 'Namaste! I am Saathi. How can I help you today?'}
                </p>
              </div>
            </div>
          )}

          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 sm:gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center font-bold text-base shrink-0 mt-0.5">
                    🤝
                  </div>
                )}

                <div
                  className={`max-w-xl rounded-2xl p-4 border space-y-2.5 ${
                    isUser
                      ? 'bg-amber-100/90 border-amber-300 text-slate-900 ml-auto'
                      : 'bg-white border-slate-200 text-slate-900 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black tracking-wide text-slate-600">
                      {isUser ? (isHindi ? 'आप (You)' : 'You') : '🤝 Saathi'}
                    </span>
                    {!isUser && (
                      <button
                        type="button"
                        onClick={() => handleSpeak(msg)}
                        aria-label={isHindi ? 'यह संदेश बोलकर सुनें' : 'Read this message aloud'}
                        className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-amber-700 min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-4 focus-visible:ring-amber-400"
                        title={isHindi ? 'आवाज़ में सुनें' : 'Listen'}
                      >
                        <Volume2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <p className={`${textClass} font-semibold leading-relaxed whitespace-pre-line`}>
                    {msg.text}
                  </p>

                  {/* Numbered guidance steps */}
                  {msg.steps && msg.steps.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 space-y-1.5">
                      <span className="text-xs font-black uppercase tracking-wide text-slate-700 block">
                        {isHindi ? 'आसान कदम:' : 'Simple steps:'}
                      </span>
                      <ol className="space-y-1 list-decimal list-inside text-xs sm:text-sm font-semibold text-slate-800">
                        {msg.steps.map((step, idx) => (
                          <li key={idx} className="leading-normal">
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Connected tool action button */}
                  {msg.actionLink && onSelectFeature && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => onSelectFeature(msg.actionLink!.feature)}
                        className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 min-h-[44px]"
                      >
                        <span>{isHindi ? msg.actionLink.labelHi : msg.actionLink.label}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Calm Loading State: "Saathi सोच रहा है..." */}
          {isLoading && (
            <div
              role="status"
              aria-live="polite"
              className="flex gap-2.5 items-start"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center font-bold text-base shrink-0">
                🤝
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-2xs flex items-center gap-2.5 text-slate-700">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
                <span className="text-sm font-bold text-slate-800">
                  {isHindi ? 'Saathi सोच रहा है...' : 'Saathi is thinking...'}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form & Suggested Prompts */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 space-y-3">
          {/* Suggested prompts above the input */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-bold text-slate-500 shrink-0 mr-1">
              💡 {isHindi ? 'सुझाव:' : 'Tips:'}
            </span>
            {suggestedPrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setInputText(prompt)}
                className="px-3.5 py-2.5 rounded-full bg-slate-100 hover:bg-amber-100 text-slate-800 hover:text-amber-950 font-bold text-xs sm:text-sm border border-slate-200 shrink-0 transition-colors whitespace-nowrap cursor-pointer min-h-[44px] flex items-center"
              >
                "{prompt}"
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex items-center gap-2 sm:gap-3">
            <input
              id="senior-chat-input"
              type="text"
              value={inputText}
              aria-label={isHindi ? 'Saathi से बात करने के लिए संदेश लिखें' : 'Type message to chat with Saathi'}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isHindi
                  ? 'यहाँ अपनी बात लिखें (जैसे: "मेरी दवा का reminder दिखाओ")...'
                  : 'Type your message or question here...'
              }
              className="flex-1 px-4 sm:px-5 py-3.5 rounded-2xl border-2 border-slate-300 text-slate-900 text-base focus:border-amber-600 focus:outline-hidden font-medium placeholder:text-slate-400 min-h-[52px]"
            />

            <button
              id="submit-chat-query"
              type="submit"
              aria-label={isHindi ? 'संदेश भेजें' : 'Send message'}
              disabled={!inputText.trim() || isLoading}
              className="px-6 sm:px-8 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black text-base shadow-xs flex items-center gap-2 transition-all min-h-[52px] cursor-pointer focus-visible:ring-4 focus-visible:ring-amber-400"
            >
              <span>{isHindi ? 'भेजें' : 'Send'}</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};
