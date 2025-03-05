
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

// Define emotion types
export type Emotion = 'neutral' | 'happy' | 'sad' | 'angry' | 'surprised';

// Define message interface
export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  emotion?: Emotion;
}

// Define context interface
interface ChatContextType {
  messages: Message[];
  userEmotion: Emotion;
  aiEmotion: Emotion;
  isListening: boolean;
  isProcessing: boolean;
  addMessage: (content: string, sender: 'user' | 'ai', emotion?: Emotion) => void;
  setUserEmotion: (emotion: Emotion) => void;
  setAiEmotion: (emotion: Emotion) => void;
  startListening: () => void;
  stopListening: () => void;
  clearMessages: () => void;
}

// Create context with default values
const ChatContext = createContext<ChatContextType>({
  messages: [],
  userEmotion: 'neutral',
  aiEmotion: 'neutral',
  isListening: false,
  isProcessing: false,
  addMessage: () => {},
  setUserEmotion: () => {},
  setAiEmotion: () => {},
  startListening: () => {},
  stopListening: () => {},
  clearMessages: () => {}
});

// Custom hook to use the chat context
export const useChat = () => useContext(ChatContext);

// Provider component
export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userEmotion, setUserEmotion] = useState<Emotion>('neutral');
  const [aiEmotion, setAiEmotion] = useState<Emotion>('neutral');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Add a message to the chat
  const addMessage = useCallback((content: string, sender: 'user' | 'ai', emotion: Emotion = 'neutral') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      sender,
      timestamp: new Date(),
      emotion
    };
    
    setMessages(prevMessages => [...prevMessages, newMessage]);
    
    // If AI message, update AI emotion
    if (sender === 'ai') {
      setAiEmotion(emotion);
    }
  }, []);

  // Start listening for voice input
  const startListening = useCallback(() => {
    setIsListening(true);
  }, []);

  // Stop listening for voice input
  const stopListening = useCallback(() => {
    setIsListening(false);
  }, []);

  // Clear all messages
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Value to be provided by the context
  const value = {
    messages,
    userEmotion,
    aiEmotion,
    isListening,
    isProcessing,
    addMessage,
    setUserEmotion,
    setAiEmotion,
    startListening,
    stopListening,
    clearMessages
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
