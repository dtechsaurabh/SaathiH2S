import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, Sparkles, Volume2, ArrowRight } from 'lucide-react';
import { FontSize, Language } from '../types';

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitPrompt: (spokenText: string) => void;
  language: Language;
  fontSize: FontSize;
}

export const VoiceModal: React.FC<VoiceModalProps> = ({
  isOpen,
  onClose,
  onSubmitPrompt,
  language,
  fontSize,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      setTranscript('');
      return;
    }

    // Check Speech Recognition support in browser
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    setSpeechSupported(true);
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language === 'en' ? 'en-IN' : 'hi-IN';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      let currentText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentText += event.results[i][0].transcript;
      }
      setTranscript(currentText);
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (e) {
      console.warn('Could not auto-start speech recognition:', e);
    }

    return () => {
      try {
        recognition.stop();
      } catch (_) {}
    };
  }, [isOpen, language]);

  if (!isOpen) return null;

  const toggleMic = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      try {
        recognitionRef.current.lang = language === 'en' ? 'en-IN' : 'hi-IN';
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.warn('Mic start failed:', e);
      }
    }
  };

  const handleSend = () => {
    if (!transcript.trim()) return;
    onSubmitPrompt(transcript);
    onClose();
  };

  const handlePresetSelect = (text: string) => {
    setTranscript(text);
    onSubmitPrompt(text);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 border-2 border-slate-300 shadow-xl space-y-6 text-center relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 text-2xl font-bold transition-colors focus-visible:ring-4 focus-visible:ring-amber-400"
          title="बंद करें"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Title */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>{language === 'en' ? 'Voice Companion' : 'आवाज़ साथी'}</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
            {language === 'en' ? 'Talk to Saathi' : 'साथी से बात करें'}
          </h3>
          <p className="text-sm sm:text-base text-slate-600 font-medium">
            {language === 'en'
              ? 'Speak naturally as if talking to a family member'
              : 'बिलकुल अपने घर के किसी सदस्य की तरह आराम से बोलें'}
          </p>
        </div>

        {/* Mic Visualizer Button */}
        <div className="py-2 flex flex-col items-center justify-center">
          <button
            onClick={toggleMic}
            className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg ${
              isListening
                ? 'bg-amber-600 ring-8 ring-amber-300 animate-pulse text-white'
                : 'bg-slate-100 border-4 border-amber-500 text-amber-700 hover:bg-amber-50'
            }`}
          >
            {isListening ? (
              <Mic className="w-14 h-14" />
            ) : (
              <MicOff className="w-14 h-14" />
            )}
          </button>

          <p className="mt-4 text-base font-bold text-slate-800 flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                isListening ? 'bg-red-500 animate-ping' : 'bg-slate-400'
              }`}
            />
            <span>
              {isListening
                ? language === 'en'
                  ? 'Listening to you... Speak now'
                  : 'साथी सुन रहा है... अब बोलिए'
                : language === 'en'
                ? 'Mic is paused. Tap mic to speak'
                : 'माइक बंद है। बोलने के लिए माइक दबाएं'}
            </span>
          </p>
        </div>

        {/* Transcript Area */}
        <div className="bg-amber-50/60 rounded-2xl p-4 border-2 border-amber-200 text-left min-h-[90px] flex flex-col justify-between">
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">
            {language === 'en' ? 'What you said:' : 'आपकी बात:'}
          </span>
          <p className="text-base sm:text-lg font-bold text-slate-900 mt-1 min-h-[36px]">
            {transcript || (
              <span className="text-slate-400 font-normal italic">
                {language === 'en'
                  ? 'Your spoken words will appear here...'
                  : 'आपके बोले हुए शब्द यहाँ दिखाई देंगे...'}
              </span>
            )}
          </p>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>
              {speechSupported
                ? language === 'en'
                  ? 'Microphone active'
                  : 'माइक चालू है'
                : language === 'en'
                ? 'Typing mode ready'
                : 'टाइपिंग मोड तैयार'}
            </span>
            {transcript && (
              <button
                onClick={() => setTranscript('')}
                className="text-amber-800 font-semibold underline"
              >
                {language === 'en' ? 'Clear' : 'मिटाएं'}
              </button>
            )}
          </div>
        </div>

        {/* Action Button: Send / Ask Saathi */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSend}
            disabled={!transcript.trim()}
            className="flex-1 py-4 rounded-2xl bg-amber-600 hover:bg-amber-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold text-lg shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{language === 'en' ? 'Ask Saathi' : 'साथी से पूछें'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Or pick a sample prompt */}
        <div className="pt-2 border-t border-slate-100">
          <p className="text-xs font-bold text-slate-500 mb-2">
            {language === 'en'
              ? 'Or tap one of these common senior questions:'
              : 'या सीधा इन सवालों पर टैप करें:'}
          </p>
          <div className="flex flex-col gap-2 text-left">
            <button
              onClick={() => handlePresetSelect('Mujhe kal doctor ke paas jana hai.')}
              className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-amber-100 border border-slate-200 text-slate-800 text-sm font-semibold transition-colors"
            >
              🩺 "Mujhe kal doctor ke paas jana hai."
            </button>
            <button
              onClick={() =>
                handlePresetSelect(
                  'WhatsApp pe bijli ka bill katne ka message aaya hai, kya yeh sach hai?'
                )
              }
              className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-amber-100 border border-slate-200 text-slate-800 text-sm font-semibold transition-colors"
            >
              🚨 "WhatsApp pe bijli bill cut hone ka message aaya hai, kya yeh scam hai?"
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
