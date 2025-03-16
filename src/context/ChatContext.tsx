import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';

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
  isSpeaking: boolean;
  selectedAvatar: string;
  conversationContext: string[];
  addMessage: (content: string, sender: 'user' | 'ai', emotion?: Emotion) => void;
  setUserEmotion: (emotion: Emotion) => void;
  setAiEmotion: (emotion: Emotion) => void;
  startListening: () => void;
  stopListening: () => void;
  clearMessages: () => void;
  setIsSpeaking: (speaking: boolean) => void;
  setSelectedAvatar: (avatarId: string) => void;
  updateConversationContext: (newContext: string) => void;
}

// Create context with default values
const ChatContext = createContext<ChatContextType>({
  messages: [],
  userEmotion: 'neutral',
  aiEmotion: 'neutral',
  isListening: false,
  isProcessing: false,
  isSpeaking: false,
  selectedAvatar: 'robot',
  conversationContext: [],
  addMessage: () => {},
  setUserEmotion: () => {},
  setAiEmotion: () => {},
  startListening: () => {},
  stopListening: () => {},
  clearMessages: () => {},
  setIsSpeaking: () => {},
  setSelectedAvatar: () => {},
  updateConversationContext: () => {}
});

// Custom hook to use the chat context
export const useChat = () => useContext(ChatContext);

// Maximum number of context items to keep
const MAX_CONTEXT_ITEMS = 10;

// Provider component
export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userEmotion, setUserEmotion] = useState<Emotion>('neutral');
  const [aiEmotion, setAiEmotion] = useState<Emotion>('neutral');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('robot');
  const [conversationContext, setConversationContext] = useState<string[]>([]);

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

  // Update conversation context with new information
  const updateConversationContext = useCallback((newContext: string) => {
    setConversationContext(prevContext => {
      const updatedContext = [...prevContext, newContext];
      // Keep only the most recent context items
      return updatedContext.slice(-MAX_CONTEXT_ITEMS);
    });
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
    // Also clear conversation context when starting a new conversation
    setConversationContext([]);
  }, []);

  // Value to be provided by the context
  const value = {
    messages,
    userEmotion,
    aiEmotion,
    isListening,
    isProcessing,
    isSpeaking,
    selectedAvatar,
    conversationContext,
    addMessage,
    setUserEmotion,
    setAiEmotion,
    startListening,
    stopListening,
    clearMessages,
    setIsSpeaking,
    setSelectedAvatar,
    updateConversationContext
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
