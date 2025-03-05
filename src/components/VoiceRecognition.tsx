
import React, { useEffect } from 'react';
import { Mic, MicOff, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useChat } from '@/context/ChatContext';
import { generateAIResponse } from '@/lib/emotions';

const VoiceRecognition = () => {
  const { addMessage, userEmotion, isListening, startListening: contextStartListening, stopListening: contextStopListening } = useChat();
  
  const { 
    isListening: isSpeechListening, 
    transcript, 
    error, 
    startListening: speechStartListening, 
    stopListening: speechStopListening 
  } = useSpeechRecognition({
    onResult: (text, emotion) => {
      if (text.trim()) {
        addMessage(text, 'user', emotion);
        
        // Generate AI response with a small delay
        setTimeout(() => {
          const response = generateAIResponse(text, emotion);
          addMessage(response.text, 'ai', response.emotion);
        }, 1000);
        
        contextStopListening();
      }
    }
  });

  // Start/stop listening when context state changes
  useEffect(() => {
    if (isListening && !isSpeechListening) {
      speechStartListening();
    } else if (!isListening && isSpeechListening) {
      speechStopListening();
    }
  }, [isListening, isSpeechListening, speechStartListening, speechStopListening]);

  const handleMicToggle = () => {
    if (isListening) {
      contextStopListening();
    } else {
      contextStartListening();
    }
  };

  return (
    <div className="voice-input glass-panel p-4">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={handleMicToggle}
          className={`rounded-full w-12 h-12 transition-all ${isListening ? 'bg-primary text-white' : 'bg-secondary'}`}
        >
          {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
        </Button>
        
        <div className="flex-1 relative">
          <div className="h-12 flex items-center px-4 rounded-lg bg-white/50 text-foreground/80">
            {isListening ? (
              transcript ? transcript : "Listening..."
            ) : (
              "Press the microphone to speak"
            )}
          </div>
        </div>
        
        <Button
          variant="default"
          size="icon"
          className="rounded-full w-12 h-12 bg-friend hover:bg-friend-dark"
          onClick={() => {
            if (transcript.trim()) {
              addMessage(transcript, 'user', userEmotion);
              
              // Generate AI response with a small delay
              setTimeout(() => {
                const response = generateAIResponse(transcript, userEmotion);
                addMessage(response.text, 'ai', response.emotion);
              }, 1000);
            }
          }}
          disabled={!transcript.trim()}
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
      
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
    </div>
  );
};

export default VoiceRecognition;
