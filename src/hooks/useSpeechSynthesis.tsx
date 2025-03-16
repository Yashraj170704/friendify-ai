
import { useState, useCallback, useEffect, useRef } from 'react';
import type { Emotion } from '@/context/ChatContext';
import { toast } from 'sonner';

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
        console.log('Available voices:', availableVoices.map(v => v.name));
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
    } else {
      console.warn('Speech synthesis not available in this browser');
      toast.error('Speech synthesis not available', {
        description: 'Your browser doesn\'t support text-to-speech functionality.'
      });
    }
  }, []);

  // Find best voice for the given emotion
  const getBestVoice = useCallback((emotion: Emotion = 'neutral'): SpeechSynthesisVoice | null => {
    if (!voices.length) {
      console.warn('No voices available yet');
      return null;
    }

    // Use voice preference if available
    const preferredVoice = options.defaultVoice;
    if (preferredVoice) {
      const foundVoice = voices.find(voice => 
        voice.name.toLowerCase().includes(preferredVoice.toLowerCase())
      );
      if (foundVoice) return foundVoice;
    }
    
    // Default voice preferences based on emotion
    const voicePreferences = {
      'happy': ['female', 'english'],
      'sad': ['male', 'english'],
      'angry': ['male', 'english'],
      'surprised': ['female', 'english'],
      'neutral': ['uk', 'english']
    };
    
    const preferences = voicePreferences[emotion] || voicePreferences.neutral;
    
    // Try to find a voice based on emotion preferences
    for (const pref of preferences) {
      const matchingVoice = voices.find(voice => 
        voice.name.toLowerCase().includes(pref)
      );
      if (matchingVoice) return matchingVoice;
    }
    
    // Fallback to any English voice
    const englishVoice = voices.find(voice => 
      voice.lang.toLowerCase().includes('en')
    );
    
    // Ultimate fallback to first voice
    return englishVoice || voices[0];
  }, [voices, options.defaultVoice]);

  // Configure utterance based on emotion
  const configureUtterance = useCallback((text: string, emotion: Emotion = 'neutral'): SpeechSynthesisUtterance => {
    const newUtterance = new SpeechSynthesisUtterance(text);
    
    // Set voice
    const voice = getBestVoice(emotion);
    if (voice) {
      console.log('Using voice:', voice.name);
      newUtterance.voice = voice;
      // Ensure language is set to match the voice
      newUtterance.lang = voice.lang;
    } else {
      console.warn('No suitable voice found, using browser default');
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
      // Call onError callback with error event
      if (options.onError) options.onError(event);
      
      // Show toast notification
      toast.error('Speech synthesis error', {
        description: 'There was an issue with text-to-speech. Try again or check browser settings.'
      });
    };
    
    return newUtterance;
  }, [getBestVoice, options]);

  // Speak text with emotion
  const speak = useCallback((text: string, emotion: Emotion = 'neutral') => {
    if (!synthRef.current) {
      console.error('Speech synthesis not available');
      toast.error('Speech synthesis not available', {
        description: 'Your browser doesn\'t support text-to-speech functionality.'
      });
      if (options.onError) options.onError(new Error('Speech synthesis not available'));
      return;
    }
    
    try {
      console.log('Starting speech synthesis:', text);
      
      // Force cancel any previous speech first
      synthRef.current.cancel();
      
      // Wait a brief moment to ensure previous speech is fully canceled
      setTimeout(() => {
        try {
          // Create and configure utterance
          const newUtterance = configureUtterance(text, emotion);
          
          // Store utterance reference
          setUtterance(newUtterance);
          
          // Start speaking
          synthRef.current?.speak(newUtterance);
          
          // Chrome sometimes needs a "kick" to start speaking
          if (synthRef.current && !synthRef.current.speaking) {
            console.log('Speech not started, trying again...');
            setTimeout(() => {
              if (synthRef.current && !synthRef.current.speaking) {
                synthRef.current.speak(newUtterance);
              }
            }, 50);
          }
        } catch (innerError) {
          console.error('Error in delayed speech start:', innerError);
          if (options.onError) options.onError(innerError);
        }
      }, 50);
    } catch (error) {
      console.error('Error starting speech:', error);
      if (options.onError) options.onError(error);
      
      toast.error('Error starting speech', {
        description: 'Unable to use text-to-speech. Please try again.'
      });
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
