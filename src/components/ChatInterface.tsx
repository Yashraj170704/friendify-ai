
import React, { useRef, useEffect } from 'react';
import { useChat } from '@/context/ChatContext';
import MessageBubble from './MessageBubble';
import AIAvatar from './AIAvatar';
import EmotionAnalyzer from './EmotionAnalyzer';
import VoiceRecognition from './VoiceRecognition';

const ChatInterface = () => {
  const { messages, aiEmotion, isListening } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="md:col-span-2 glass-panel p-4 rounded-2xl flex flex-col">
          <h2 className="text-xl font-medium mb-2 text-center">AI Friend</h2>
          <div className="flex-1 flex flex-col items-center justify-center">
            <AIAvatar 
              emotion={aiEmotion} 
              speaking={messages.length > 0 && messages[messages.length - 1].sender === 'ai'}
              size="lg"
              className="mb-4"
            />
            <p className="text-sm text-center text-foreground/70 max-w-md">
              I'm here to chat about anything! I can analyze your emotions and respond with empathy.
            </p>
          </div>
        </div>
        
        <div className="md:col-span-1">
          <EmotionAnalyzer />
        </div>
      </div>
      
      <div className="flex-1 glass-panel p-4 rounded-2xl mb-4 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto pr-2">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-foreground/50">
              <p className="text-center mb-2">No messages yet</p>
              <p className="text-sm text-center">
                Start speaking to begin a conversation with your AI friend
              </p>
            </div>
          ) : (
            <div className="flex flex-col space-y-4 py-4">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>
      
      <VoiceRecognition />
    </div>
  );
};

export default ChatInterface;
