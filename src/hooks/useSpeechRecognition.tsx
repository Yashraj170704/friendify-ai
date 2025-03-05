
import { useState, useEffect, useCallback } from 'react';
import type { Emotion } from '../context/ChatContext';
import { detectEmotionFromText } from '../lib/emotions';

interface UseSpeechRecognitionOptions {
  onResult?: (text: string, emotion: Emotion) => void;
  onEnd?: () => void;
  continuous?: boolean;
}

export function useSpeechRecognition({
  onResult,
  onEnd,
  continuous = false
}: UseSpeechRecognitionOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Check if browser supports speech recognition
  const recognition = useCallback(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = continuous;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        return recognition;
      }
    }
    return null;
  }, [continuous]);

  // Start listening
  const startListening = useCallback(() => {
    const recognitionInstance = recognition();
    
    if (!recognitionInstance) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    // Clear previous transcript
    setTranscript('');
    
    try {
      recognitionInstance.start();
      setIsListening(true);
      setError(null);
      
      // Set up event listeners
      recognitionInstance.onresult = (event) => {
        let currentTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            currentTranscript += event.results[i][0].transcript;
          }
        }
        
        if (currentTranscript.trim()) {
          setTranscript(currentTranscript);
          
          if (onResult) {
            const detectedEmotion = detectEmotionFromText(currentTranscript);
            onResult(currentTranscript, detectedEmotion);
          }
        }
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setError(`Error: ${event.error}`);
        setIsListening(false);
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
        if (onEnd) onEnd();
      };
      
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setError('Failed to start speech recognition. Please check permissions.');
      setIsListening(false);
    }
    
    return recognitionInstance;
  }, [recognition, onResult, onEnd]);

  // Stop listening
  const stopListening = useCallback(() => {
    const recognitionInstance = recognition();
    if (recognitionInstance) {
      recognitionInstance.stop();
      setIsListening(false);
    }
  }, [recognition]);

  // Clean up
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening
  };
}
