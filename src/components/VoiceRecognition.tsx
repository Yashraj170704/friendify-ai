
import React, { useEffect, useState, useCallback } from 'react';
import { Mic, MicOff, Send, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useChat } from '@/context/ChatContext';
import { toast } from 'sonner';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { getAIResponse, extractKeyInfo } from '@/services/aiService';
import type { Emotion } from '@/context/ChatContext';

const VoiceRecognition = () => {
  const { 
    addMessage, 
    userEmotion, 
    isListening, 
    startListening: contextStartListening, 
    stopListening: contextStopListening,
    conversationContext,
    updateConversationContext
  } = useChat();
  const [lastProcessedText, setLastProcessedText] = useState('');
  const [microphoneStatus, setMicrophoneStatus] = useState<'ready' | 'checking' | 'error'>('checking');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Initialize speech synthesis
  const speech = useSpeechSynthesis({
    onError: (error) => {
      console.error('Speech synthesis error in VoiceRecognition:', error);
      toast.error('Speech output failed', {
        description: 'There was an issue with the voice response. Please try again.',
      });
    }
  });
  
  // Process user input and get AI response
  const processUserInput = useCallback(async (text: string, emotion: Emotion) => {
    if (!text.trim() || text === lastProcessedText) return;
    
    setIsProcessing(true);
    // Update last processed text to avoid duplicates
    setLastProcessedText(text);
    
    // Add user message with combined emotion from face and voice
    // Prioritize facial emotion if available, otherwise use voice emotion
    const combinedEmotion = userEmotion !== 'neutral' ? userEmotion : emotion;
    console.log('Combined emotion (face + voice):', combinedEmotion);
    
    // Add user message
    addMessage(text, 'user', combinedEmotion);
    
    // Extract any key information from the message
    const keyInfo = extractKeyInfo(text);
    if (keyInfo.length > 0) {
      keyInfo.forEach(info => {
        updateConversationContext(info);
      });
    }
    
    try {
      // Get AI response using context awareness
      const aiResponse = await getAIResponse({
        message: text,
        userEmotion: combinedEmotion,
        conversationContext: conversationContext
      });
      
      // Add AI response to messages
      addMessage(aiResponse.text, 'ai', aiResponse.emotion);
      
      // No need to speak here as ChatInterface will handle this automatically
      // when the new message is added to the messages array
    } catch (error) {
      console.error('Error processing user input:', error);
      toast.error('Error processing your message', {
        description: 'There was a problem generating a response. Please try again.',
      });
      
      // Add fallback message
      addMessage(
        "I'm sorry, I encountered an issue processing your message. Could we try again?", 
        'ai', 
        'neutral'
      );
    } finally {
      setIsProcessing(false);
    }
  }, [addMessage, lastProcessedText, userEmotion, conversationContext, updateConversationContext]);
  
  // Handle speech recognition results
  const handleSpeechResult = useCallback((text: string, emotion: Emotion) => {
    console.log('Speech recognized, processing:', text);
    if (text.trim() && text !== lastProcessedText) {
      processUserInput(text, emotion);
      contextStopListening();
    }
  }, [processUserInput, lastProcessedText, contextStopListening]);
  
  const { 
    isListening: isSpeechListening, 
    transcript, 
    error, 
    startListening: speechStartListening, 
    stopListening: speechStopListening 
  } = useSpeechRecognition({
    onResult: handleSpeechResult,
    continuous: false
  });

  // Check microphone access on component mount
  useEffect(() => {
    const checkMicrophoneAccess = async () => {
      try {
        setMicrophoneStatus('checking');
        console.log('Checking microphone access...');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        setMicrophoneStatus('ready');
        console.log('Microphone access granted');
        
        // Auto-start listening on initial load
        setTimeout(() => {
          contextStartListening();
        }, 1000);
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
  }, [contextStartListening]);

  // Start/stop listening when context state changes
  useEffect(() => {
    if (isListening && !isSpeechListening && microphoneStatus === 'ready') {
      console.log('Starting speech recognition from context change');
      speechStartListening();
    } else if (!isListening && isSpeechListening) {
      console.log('Stopping speech recognition from context change');
      speechStopListening();
    }
  }, [isListening, isSpeechListening, speechStartListening, speechStopListening, microphoneStatus]);

  const handleMicToggle = useCallback(() => {
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
  }, [isListening, microphoneStatus, contextStartListening, contextStopListening]);

  const handleSendMessage = useCallback(() => {
    if (transcript.trim()) {
      const trimmedTranscript = transcript.trim();
      console.log('Sending message:', trimmedTranscript);
      
      // Process the message
      processUserInput(trimmedTranscript, userEmotion);
      contextStopListening();
    } else {
      toast.info('No message to send', {
        description: 'Please speak or type a message first.',
      });
    }
  }, [transcript, processUserInput, userEmotion, contextStopListening]);

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
                ? 'bg-primary text-white animate-pulse' 
                : 'bg-secondary'
          }`}
          disabled={isProcessing}
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
              <div className="flex items-center">
                <span className="animate-pulse mr-2">●</span>
                {transcript ? transcript : "Listening..."}
              </div>
            ) : isProcessing ? (
              <div className="flex items-center">
                <span className="animate-pulse mr-2 text-purple-500">●</span>
                Processing...
              </div>
            ) : (
              microphoneStatus === 'error' 
                ? "Microphone access required" 
                : transcript || "Press the microphone to speak"
            )}
          </div>
        </div>
        
        <Button
          variant="default"
          size="icon"
          className="rounded-full w-12 h-12 bg-friend hover:bg-friend-dark"
          onClick={handleSendMessage}
          disabled={!transcript.trim() || isProcessing}
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
