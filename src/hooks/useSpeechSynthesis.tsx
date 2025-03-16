
import { useState, useCallback, useEffect, useRef } from 'react';
import type { Emotion } from '@/context/ChatContext';

interface SpeechSynthesisOptions {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: any) => void;
  defaultVoice?: string;
}

export const useSpeechSynthesis = (options: SpeechSynthesisOptions = {}) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  
  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      
      // Load voices
      const loadVoices = () => {
        const availableVoices = synthRef.current?.getVoices() || [];
        setVoices(availableVoices);
      };
      
      // Some browsers load voices asynchronously
      if (synthRef.current.onvoiceschanged !== undefined) {
        synthRef.current.onvoiceschanged = loadVoices;
      }
      
      // Initial load
      loadVoices();
      
      // Ensure speech synthesis is canceled when component unmounts
      return () => {
        if (synthRef.current?.speaking) {
          console.log('Canceling speech on unmount');
          synthRef.current.cancel();
        }
      };
    }
  }, []);

  // Find best voice for the given emotion
  const getBestVoice = useCallback((emotion: Emotion = 'neutral'): SpeechSynthesisVoice | null => {
    if (!voices.length) return null;

    // Use voice preference if available
    const preferredVoice = options.defaultVoice;
    if (preferredVoice) {
      const foundVoice = voices.find(voice => 
        voice.name.toLowerCase().includes(preferredVoice.toLowerCase())
      );
      if (foundVoice) return foundVoice;
    }
    
    // Default voice preferences based on emotion
    let voicePreference: string;
    
    switch (emotion) {
      case 'happy':
        voicePreference = 'female';
        break;
      case 'sad':
        voicePreference = 'male';
        break;
      case 'angry':
        voicePreference = 'male';
        break;
      case 'surprised':
        voicePreference = 'female';
        break;
      default:
        voicePreference = 'uk'; // neutral - prefer UK voice
    }
    
    // Try to find a voice based on emotion
    let bestVoice = voices.find(voice => 
      voice.name.toLowerCase().includes(voicePreference) &&
      voice.name.toLowerCase().includes('english')
    );
    
    // Fallback to any English voice
    if (!bestVoice) {
      bestVoice = voices.find(voice => 
        voice.name.toLowerCase().includes('english')
      );
    }
    
    // Ultimate fallback to first voice
    return bestVoice || voices[0];
  }, [voices, options.defaultVoice]);

  // Configure utterance based on emotion
  const configureUtterance = useCallback((text: string, emotion: Emotion = 'neutral'): SpeechSynthesisUtterance => {
    const newUtterance = new SpeechSynthesisUtterance(text);
    
    // Set voice
    const voice = getBestVoice(emotion);
    if (voice) {
      console.log('Using voice:', voice.name);
      newUtterance.voice = voice;
    }
    
    // Configure speech parameters based on emotion
    switch (emotion) {
      case 'happy':
        newUtterance.rate = 1.1;    // Slightly faster
        newUtterance.pitch = 1.2;   // Higher pitch
        break;
      case 'sad':
        newUtterance.rate = 0.9;    // Slower
        newUtterance.pitch = 0.8;   // Lower pitch
        break;
      case 'angry':
        newUtterance.rate = 1.1;    // Slightly faster
        newUtterance.pitch = 1.0;   // Normal pitch
        newUtterance.volume = 1.0;  // Louder
        break;
      case 'surprised':
        newUtterance.rate = 1.2;    // Faster
        newUtterance.pitch = 1.4;   // Much higher pitch
        break;
      default: // neutral
        newUtterance.rate = 1.0;
        newUtterance.pitch = 1.0;
    }
    
    // Add event handlers
    newUtterance.onstart = () => {
      console.log('Speech started');
      setIsSpeaking(true);
      setIsPaused(false);
      if (options.onStart) options.onStart();
    };
    
    newUtterance.onend = () => {
      console.log('Speech ended');
      setIsSpeaking(false);
      setIsPaused(false);
      if (options.onEnd) options.onEnd();
    };
    
    newUtterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
      setIsPaused(false);
      if (options.onError) options.onError(event);
    };
    
    return newUtterance;
  }, [getBestVoice, options]);

  // Speak text with emotion
  const speak = useCallback((text: string, emotion: Emotion = 'neutral') => {
    if (!synthRef.current) {
      console.error('Speech synthesis not available');
      if (options.onError) options.onError(new Error('Speech synthesis not available'));
      return;
    }
    
    try {
      console.log('Starting speech synthesis:', text);
      
      // Create and configure utterance
      const newUtterance = configureUtterance(text, emotion);
      
      // Cancel any previous speech
      synthRef.current.cancel();
      
      // Store utterance reference
      setUtterance(newUtterance);
      
      // Start speaking
      synthRef.current.speak(newUtterance);
      
      // Some browsers need this hack to start speaking
      if (!synthRef.current.speaking) {
        setTimeout(() => {
          if (synthRef.current && !synthRef.current.speaking) {
            synthRef.current.speak(newUtterance);
          }
        }, 100);
      }
    } catch (error) {
      console.error('Error starting speech:', error);
      if (options.onError) options.onError(error);
    }
  }, [configureUtterance, options]);

  // Pause speaking
  const pause = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.pause();
      setIsPaused(true);
    }
  }, []);

  // Resume speaking
  const resume = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.resume();
      setIsPaused(false);
    }
  }, []);

  // Cancel speaking
  const cancel = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, []);

  return {
    speak,
    pause,
    resume,
    cancel,
    isSpeaking,
    isPaused,
    voices,
  };
};
