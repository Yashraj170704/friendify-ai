
import { useState, useEffect, useCallback, useRef } from 'react';
import type { Emotion } from '../context/ChatContext';
import { detectEmotionFromText } from '../lib/emotions';
import { toast } from 'sonner';

// We'll use the global type definitions instead of redefining them here
// This resolves the conflicts with the SpeechRecognition declarations

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
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  // Check if browser supports speech recognition
  const initRecognition = useCallback(() => {
    if (typeof window !== 'undefined') {
      // Use the globally defined SpeechRecognition interface
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognitionAPI) {
        try {
          console.log('Initializing speech recognition...');
          const recognition = new SpeechRecognitionAPI();
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
        console.error('Speech recognition not supported by this browser');
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
    console.log('Starting speech recognition...');
    // Cancel any existing recognition first
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        console.log('Stopped previous recognition instance');
      } catch (e) {
        console.log('Error stopping previous recognition instance:', e);
      }
    }
    
    const recognitionInstance = initRecognition();
    
    if (!recognitionInstance) {
      console.error('Failed to initialize recognition instance');
      return;
    }

    // Clear previous transcript
    setTranscript('');
    
    try {
      // Set up event listeners before starting
      // Using function assignment instead of property access for compatibility
      recognitionInstance.onstart = function() {
        console.log('Speech recognition started successfully');
        setIsListening(true);
        setError(null);
      };
      
      recognitionInstance.onresult = function(event: SpeechRecognitionEvent) {
        console.log('Speech recognition result received');
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
            console.log('Emotion detected from speech:', detectedEmotion);
            onResult(currentTranscript, detectedEmotion);
          }
        }
      };
      
      recognitionInstance.onerror = function(event: SpeechRecognitionErrorEvent) {
        console.error('Speech recognition error:', event.error);
        setError(`Error: ${event.error}`);
        
        // Show toast for user feedback
        toast.error('Speech recognition error', {
          description: `Error: ${event.error}. Please try again.`,
        });
        
        // Auto-retry for certain errors if we haven't exceeded max retries
        if (['network', 'service-not-allowed'].includes(event.error) && retryCountRef.current < maxRetries) {
          retryCountRef.current++;
          toast.info('Retrying speech recognition...', {
            description: `Attempt ${retryCountRef.current} of ${maxRetries}`,
          });
          
          setTimeout(() => {
            startListening();
          }, 1000);
        } else {
          setIsListening(false);
        }
      };
      
      recognitionInstance.onend = function() {
        console.log('Speech recognition ended');
        setIsListening(false);
        
        // If continuous is true and no error, restart
        if (continuous && !error && retryCountRef.current < maxRetries) {
          console.log('Continuous mode active, restarting speech recognition');
          startListening();
        } else {
          if (onEnd) onEnd();
        }
      };
      
      // Start recognition
      recognitionInstance.start();
      console.log('Speech recognition start command issued');
      
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
  }, [initRecognition, onResult, onEnd, error, continuous]);

  // Stop listening
  const stopListening = useCallback(() => {
    console.log('Stopping speech recognition...');
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        console.log('Speech recognition stopped successfully');
      } catch (err) {
        console.error('Error stopping speech recognition:', err);
      }
      setIsListening(false);
      // Reset retry counter
      retryCountRef.current = 0;
    }
  }, []);

  // Clean up
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          console.log('Cleaning up speech recognition');
        } catch (e) {
          console.error('Error during cleanup:', e);
        }
      }
    };
  }, []);

  // Auto-start on mount if needed
  useEffect(() => {
    const checkMicrophoneAccess = async () => {
      try {
        console.log('Checking microphone access...');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        console.log('Microphone access granted');
      } catch (err) {
        console.error('Microphone access error:', err);
        setError('Microphone access denied. Please check browser permissions.');
        toast.error('Microphone access required', {
          description: 'Please allow microphone access to use voice recognition.',
        });
      }
    };
    
    // Check microphone access on mount
    checkMicrophoneAccess();
  }, []);

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening
  };
}
