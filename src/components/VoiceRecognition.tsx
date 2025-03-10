
import React, { useEffect, useState } from 'react';
import { Mic, MicOff, Send, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useChat } from '@/context/ChatContext';
import { generateAIResponse } from '@/lib/emotions';
import { toast } from 'sonner';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';

const VoiceRecognition = () => {
  const { addMessage, userEmotion, isListening, startListening: contextStartListening, stopListening: contextStopListening } = useChat();
  const [lastProcessedText, setLastProcessedText] = useState('');
  const [microphoneStatus, setMicrophoneStatus] = useState<'ready' | 'checking' | 'error'>('ready');
  
  // Initialize speech synthesis
  const speech = useSpeechSynthesis({
    onError: (error) => {
      console.error('Speech synthesis error:', error);
      toast.error('Speech output failed', {
        description: 'There was an issue with the voice response.',
      });
    }
  });
  
  const { 
    isListening: isSpeechListening, 
    transcript, 
    error, 
    startListening: speechStartListening, 
    stopListening: speechStopListening 
  } = useSpeechRecognition({
    onResult: (text, emotion) => {
      console.log('Speech recognized, processing:', text);
      if (text.trim() && text !== lastProcessedText) {
        // Update last processed text to avoid duplicates
        setLastProcessedText(text);
        
        // Add user message
        addMessage(text, 'user', emotion);
        
        // Generate AI response
        setTimeout(() => {
          const response = generateAIResponse(text, emotion);
          addMessage(response.text, 'ai', response.emotion);
          
          // Speak the response using our speech hook
          speech.speak(response.text, response.emotion);
        }, 800);
        
        contextStopListening();
      }
    }
  });

  // Check microphone access on component mount
  useEffect(() => {
    const checkMicrophoneAccess = async () => {
      try {
        setMicrophoneStatus('checking');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        setMicrophoneStatus('ready');
      } catch (err) {
        console.error('Microphone access error:', err);
        setMicrophoneStatus('error');
        toast.error('Microphone access denied', {
          description: 'Please allow microphone access to use voice recognition.',
          duration: 5000,
        });
      }
    };
    
    checkMicrophoneAccess();
  }, []);

  // Start/stop listening when context state changes
  useEffect(() => {
    if (isListening && !isSpeechListening) {
      console.log('Starting speech recognition from context change');
      speechStartListening();
    } else if (!isListening && isSpeechListening) {
      console.log('Stopping speech recognition from context change');
      speechStopListening();
    }
  }, [isListening, isSpeechListening, speechStartListening, speechStopListening]);

  const handleMicToggle = () => {
    console.log('Mic button clicked, current state:', isListening);
    if (microphoneStatus === 'error') {
      toast.error('Microphone access required', {
        description: 'Please allow microphone access in your browser settings and reload the page.',
        duration: 5000,
      });
      return;
    }
    
    if (isListening) {
      contextStopListening();
    } else {
      contextStartListening();
    }
  };

  const handleSendMessage = () => {
    if (transcript.trim()) {
      const trimmedTranscript = transcript.trim();
      console.log('Sending message:', trimmedTranscript);
      setLastProcessedText(trimmedTranscript);
      
      // Add user message
      addMessage(trimmedTranscript, 'user', userEmotion);
      
      // Generate AI response
      setTimeout(() => {
        const response = generateAIResponse(trimmedTranscript, userEmotion);
        addMessage(response.text, 'ai', response.emotion);
        
        // Speak the response using our speech hook
        speech.speak(response.text, response.emotion);
      }, 800);
      
      contextStopListening();
    } else {
      toast.info('No message to send', {
        description: 'Please speak or type a message first.',
      });
    }
  };

  return (
    <div className="voice-input glass-panel p-4">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={handleMicToggle}
          className={`rounded-full w-12 h-12 transition-all ${
            microphoneStatus === 'error' 
              ? 'bg-destructive text-white' 
              : isListening 
                ? 'bg-primary text-white' 
                : 'bg-secondary'
          }`}
        >
          {microphoneStatus === 'error' ? (
            <AlertCircle className="h-6 w-6" />
          ) : isListening ? (
            <MicOff className="h-6 w-6" />
          ) : (
            <Mic className="h-6 w-6" />
          )}
        </Button>
        
        <div className="flex-1 relative">
          <div className="h-12 flex items-center px-4 rounded-lg bg-white/50 text-foreground/80">
            {isListening ? (
              transcript ? transcript : "Listening..."
            ) : (
              microphoneStatus === 'error' 
                ? "Microphone access required" 
                : "Press the microphone to speak"
            )}
          </div>
        </div>
        
        <Button
          variant="default"
          size="icon"
          className="rounded-full w-12 h-12 bg-friend hover:bg-friend-dark"
          onClick={handleSendMessage}
          disabled={!transcript.trim()}
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
      
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
      
      {speech.isSpeaking && (
        <div className="mt-2 text-sm flex items-center gap-2 text-blue-500">
          <span className="inline-block w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
          AI is speaking...
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={speech.cancel}
            className="text-xs h-6 px-2"
          >
            Stop
          </Button>
        </div>
      )}
    </div>
  );
};

export default VoiceRecognition;
