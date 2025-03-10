
import { useState, useEffect, useRef } from 'react';
import type { Emotion } from '@/context/ChatContext';

interface UseSpeechSynthesisOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: any) => void;
}

export function useSpeechSynthesis({
  rate = 1,
  pitch = 1,
  volume = 1,
  onStart,
  onEnd,
  onError
}: UseSpeechSynthesisOptions = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceIndex, setVoiceIndex] = useState(0);
  
  // Use a ref to track the current utterance
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
        
        // Default to a female English voice if available
        const femaleEnglishVoice = availableVoices.findIndex(
          voice => voice.lang.includes('en') && voice.name.includes('Female')
        );
        
        if (femaleEnglishVoice !== -1) {
          setVoiceIndex(femaleEnglishVoice);
        }
      }
    };
    
    loadVoices();
    
    // Chrome loads voices asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);
  
  // Adjust voice characteristics based on emotion
  const getVoiceSettings = (emotion: Emotion) => {
    switch (emotion) {
      case 'happy':
        return { rate: rate * 1.1, pitch: pitch * 1.2 };
      case 'sad':
        return { rate: rate * 0.9, pitch: pitch * 0.9 };
      case 'angry':
        return { rate: rate * 1.2, pitch: pitch * 0.8 };
      case 'surprised':
        return { rate: rate * 1.3, pitch: pitch * 1.3 };
      default:
        return { rate, pitch };
    }
  };
  
  // Speak function
  const speak = (text: string, emotion: Emotion = 'neutral') => {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    if (!text) return;
    
    try {
      const newUtterance = new SpeechSynthesisUtterance(text);
      
      // Apply emotion-based settings
      const settings = getVoiceSettings(emotion);
      
      // Set voice properties
      newUtterance.voice = voices[voiceIndex] || null;
      newUtterance.volume = volume;
      newUtterance.rate = settings.rate;
      newUtterance.pitch = settings.pitch;
      
      // Setup event handlers
      newUtterance.onstart = () => {
        setIsSpeaking(true);
        if (onStart) onStart();
      };
      
      newUtterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        if (onEnd) onEnd();
      };
      
      newUtterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsSpeaking(false);
        setIsPaused(false);
        if (onError) onError(event);
      };
      
      // Store the utterance in ref and state
      utteranceRef.current = newUtterance;
      setUtterance(newUtterance);
      
      // Start speaking
      window.speechSynthesis.speak(newUtterance);
    } catch (error) {
      console.error('Failed to initialize speech synthesis:', error);
      if (onError) onError(error);
    }
  };
  
  // Control functions
  const pause = () => {
    if (isSpeaking && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };
  
  const resume = () => {
    if (isSpeaking && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  };
  
  const cancel = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };
  
  // Change the voice
  const setVoice = (index: number) => {
    if (index >= 0 && index < voices.length) {
      setVoiceIndex(index);
    }
  };
  
  return {
    speak,
    pause,
    resume,
    cancel,
    isSpeaking,
    isPaused,
    voices,
    voiceIndex,
    setVoice,
  };
}
