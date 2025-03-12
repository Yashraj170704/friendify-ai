
import { useState, useEffect, useRef } from 'react';
import type { Emotion } from '../context/ChatContext';
import { toast } from 'sonner';

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
  
  // Check if speech synthesis is supported
  const isSpeechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  
  // Load available voices
  useEffect(() => {
    if (!isSpeechSupported) {
      console.error('Speech synthesis not supported in this browser');
      return;
    }
    
    const loadVoices = () => {
      try {
        const availableVoices = window.speechSynthesis.getVoices();
        if (availableVoices.length > 0) {
          console.log('Loaded voices:', availableVoices.length);
          setVoices(availableVoices);
          
          // Default to a female English voice if available
          const femaleEnglishVoice = availableVoices.findIndex(
            voice => voice.lang.includes('en') && voice.name.includes('Female')
          );
          
          if (femaleEnglishVoice !== -1) {
            setVoiceIndex(femaleEnglishVoice);
          }
        } else {
          console.warn('No voices available');
        }
      } catch (err) {
        console.error('Error loading voices:', err);
      }
    };
    
    loadVoices();
    
    // Chrome loads voices asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    return () => {
      if (isSpeechSupported) {
        try {
          window.speechSynthesis.cancel();
        } catch (e) {
          console.error('Error canceling speech synthesis:', e);
        }
      }
    };
  }, [isSpeechSupported]);
  
  // Fix for Chrome speech synthesis bug
  useEffect(() => {
    if (!isSpeechSupported) return;
    
    // Chrome has a bug where it stops speaking after ~15 seconds
    // This is a workaround that restarts the speech synthesis periodically
    const intervalId = setInterval(() => {
      if (isSpeaking && !isPaused && utteranceRef.current) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 10000);
    
    return () => clearInterval(intervalId);
  }, [isSpeaking, isPaused, isSpeechSupported]);
  
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
    // Check if speech synthesis is supported
    if (!isSpeechSupported) {
      console.error('Speech synthesis not supported');
      toast.error('Speech synthesis not supported in this browser');
      if (onError) onError(new Error('Speech synthesis not supported'));
      return;
    }
    
    // Cancel any ongoing speech
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      console.error('Error canceling previous speech:', e);
    }
    
    if (!text) return;
    
    try {
      console.log('Starting speech synthesis:', text);
      const newUtterance = new SpeechSynthesisUtterance(text);
      
      // Apply emotion-based settings
      const settings = getVoiceSettings(emotion);
      
      // Set voice properties
      if (voices.length > voiceIndex) {
        newUtterance.voice = voices[voiceIndex];
        console.log('Using voice:', voices[voiceIndex]?.name);
      }
      
      newUtterance.volume = volume;
      newUtterance.rate = settings.rate;
      newUtterance.pitch = settings.pitch;
      
      // Setup event handlers
      newUtterance.onstart = () => {
        console.log('Speech started');
        setIsSpeaking(true);
        if (onStart) onStart();
      };
      
      newUtterance.onend = () => {
        console.log('Speech ended');
        setIsSpeaking(false);
        setIsPaused(false);
        if (onEnd) onEnd();
      };
      
      newUtterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsSpeaking(false);
        setIsPaused(false);
        
        toast.error('Speech output failed', {
          description: 'There was an issue with the voice response. Trying fallback method...',
        });
        
        // Try fallback method - sometimes using a different voice works
        setTimeout(() => {
          try {
            const fallbackUtterance = new SpeechSynthesisUtterance(text);
            // Try a different voice if available
            if (voices.length > 0) {
              const fallbackVoiceIndex = (voiceIndex + 1) % voices.length;
              fallbackUtterance.voice = voices[fallbackVoiceIndex];
              fallbackUtterance.volume = volume;
              fallbackUtterance.rate = settings.rate;
              fallbackUtterance.pitch = settings.pitch;
              
              window.speechSynthesis.speak(fallbackUtterance);
            }
          } catch (err) {
            console.error('Fallback speech failed:', err);
            if (onError) onError(event);
          }
        }, 500);
      };
      
      // Store the utterance in ref and state
      utteranceRef.current = newUtterance;
      setUtterance(newUtterance);
      
      // Start speaking
      window.speechSynthesis.speak(newUtterance);
      
      // Chrome bug workaround: If speech doesn't start within 500ms, try again
      setTimeout(() => {
        if (utteranceRef.current === newUtterance && !isSpeaking) {
          console.log('Speech didn\'t start, retrying...');
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(newUtterance);
        }
      }, 500);
      
    } catch (error) {
      console.error('Failed to initialize speech synthesis:', error);
      toast.error('Speech synthesis failed', {
        description: 'Failed to start speaking. Please try again.',
      });
      if (onError) onError(error);
    }
  };
  
  // Control functions
  const pause = () => {
    if (isSpeaking && !isPaused && isSpeechSupported) {
      try {
        window.speechSynthesis.pause();
        setIsPaused(true);
      } catch (e) {
        console.error('Error pausing speech:', e);
      }
    }
  };
  
  const resume = () => {
    if (isSpeaking && isPaused && isSpeechSupported) {
      try {
        window.speechSynthesis.resume();
        setIsPaused(false);
      } catch (e) {
        console.error('Error resuming speech:', e);
      }
    }
  };
  
  const cancel = () => {
    if (isSpeechSupported) {
      try {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setIsPaused(false);
      } catch (e) {
        console.error('Error canceling speech:', e);
      }
    }
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
    supported: isSpeechSupported
  };
}
