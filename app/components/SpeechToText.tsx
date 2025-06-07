'use client';

import { useState, useEffect, useRef } from 'react';

// Add TypeScript interfaces for Web Speech API
interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  item(index: number): SpeechRecognitionAlternative;
  length: number;
  isFinal: boolean;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  item(index: number): SpeechRecognitionResult;
  length: number;
}

type SpeechRecognitionResults = SpeechRecognitionResultList;

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResults;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: 'aborted' | 'audio-capture' | 'bad-grammar' | 'language-not-supported' | 'network' | 'no-speech' | 'not-allowed' | 'service-not-allowed';
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

declare var webkitSpeechRecognition: {
  prototype: SpeechRecognition;
  new (): SpeechRecognition;
};

declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new (): SpeechRecognition;
};

export default function SpeechToText() {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef('');

  useEffect(() => {
    // Check if the browser supports the Web Speech API
    const isBrowserSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    setIsSupported(isBrowserSupported);
    
    if (!isBrowserSupported) {
      console.warn('Speech recognition is not supported in this browser');
      return;
    }

    // Initialize speech recognition
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;
        
        recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = finalTranscriptRef.current;
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += ' ' + transcript;
              finalTranscriptRef.current = finalTranscript;
            } else {
              interimTranscript += transcript;
            }
          }
          
          setTranscript(finalTranscript + ' ' + interimTranscript);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };
        
        recognitionRef.current = recognition;
        
        return () => {
          recognition.onresult = null;
          recognition.onerror = null;
          recognition.stop();
        };
      }
    } catch (error) {
      console.error('Error initializing speech recognition:', error);
      setIsSupported(false);
    }
  }, []);

  const toggleListening = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    if (!isListening) {
      // Reset the final transcript when starting new recognition
      finalTranscriptRef.current = '';
      setTranscript('');
      try {
        recognition.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setIsListening(false);
      }
    } else {
      try {
        recognition.stop();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
      setIsListening(false);
    }
  };

  const toggleOpen = () => {
    setIsOpen(prev => !prev);
  };

  if (!isSupported) {
    return null; // Don't render anything if speech recognition is not supported
  }

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {isOpen && (
        <div className="w-80 bg-white rounded-lg shadow-lg overflow-hidden mb-4">
          <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
            <h3 className="font-medium">Speech to Text</h3>
            <button 
              onClick={toggleOpen}
              className="text-white hover:text-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <div className="p-4 bg-gray-50 h-40 overflow-y-auto">
            {transcript ? (
              <p className="text-gray-800">{transcript}</p>
            ) : (
              <p className="text-gray-500 text-sm">
                {isListening 
                  ? 'Listening... Speak now.' 
                  : 'Click the microphone button to start speaking.'}
              </p>
            )}
          </div>
          <div className="p-3 bg-gray-100 flex justify-center">
            <button
              onClick={toggleListening}
              className={`flex items-center justify-center w-12 h-12 rounded-full ${
                isListening ? 'bg-red-500' : 'bg-blue-600'
              } text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              aria-label={isListening ? 'Stop listening' : 'Start listening'}
            >
              {isListening ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}
      <button
        onClick={toggleOpen}
        className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        aria-label="Open speech to text"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      </button>
    </div>
  );
}
