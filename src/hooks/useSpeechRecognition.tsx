
import { useState, useEffect, useCallback, useRef } from 'react';
import type { Emotion } from '../context/ChatContext';
import { detectEmotionFromText } from '../lib/emotions';
import { toast } from 'sonner';

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
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Check if browser supports speech recognition
  const initRecognition = useCallback(() => {
    if (typeof window !== 'undefined') {
      // Use the interface we defined
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = continuous;
          recognition.interimResults = true;
          recognition.lang = 'en-US';
          
          // Store in ref for cleanup
          recognitionRef.current = recognition;
          
          return recognition;
        } catch (err) {
          console.error('Failed to initialize speech recognition:', err);
          setError('Failed to initialize speech recognition. Please check browser permissions.');
          toast.error('Speech recognition failed to initialize', {
            description: 'Please ensure your browser supports this feature and microphone permissions are granted.',
          });
          return null;
        }
      } else {
        setError('Speech recognition is not supported in this browser.');
        toast.error('Speech recognition not supported', {
          description: 'Your browser does not support speech recognition. Please try Chrome or Edge.',
        });
        return null;
      }
    }
    return null;
  }, [continuous]);

  // Start listening
  const startListening = useCallback(() => {
    // Cancel any existing recognition first
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.log('Stopping previous recognition instance');
      }
    }
    
    const recognitionInstance = initRecognition();
    
    if (!recognitionInstance) {
      return;
    }

    // Clear previous transcript
    setTranscript('');
    
    try {
      // Set up event listeners before starting
      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        let currentTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            currentTranscript += event.results[i][0].transcript;
          }
        }
        
        if (currentTranscript.trim()) {
          console.log('Speech recognized:', currentTranscript);
          setTranscript(currentTranscript);
          
          if (onResult) {
            const detectedEmotion = detectEmotionFromText(currentTranscript);
            onResult(currentTranscript, detectedEmotion);
          }
        }
      };
      
      recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setError(`Error: ${event.error}`);
        setIsListening(false);
        
        // Show toast for user feedback
        toast.error('Speech recognition error', {
          description: `Error: ${event.error}. Please try again.`,
        });
      };
      
      recognitionInstance.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
        if (onEnd) onEnd();
      };
      
      // Start recognition
      recognitionInstance.start();
      setIsListening(true);
      setError(null);
      console.log('Speech recognition started');
      
      // Show toast for user feedback
      toast.info('Listening...', {
        description: 'Speak clearly into your microphone',
      });
      
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setError('Failed to start speech recognition. Please check permissions.');
      setIsListening(false);
      
      // Show toast for user feedback
      toast.error('Failed to start listening', {
        description: 'Please check microphone permissions and try again.',
      });
    }
  }, [initRecognition, onResult, onEnd]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        console.log('Speech recognition stopped');
      } catch (err) {
        console.error('Error stopping speech recognition:', err);
      }
      setIsListening(false);
    }
  }, []);

  // Clean up
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.log('Cleaning up speech recognition');
        }
      }
    };
  }, []);

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening
  };
}
