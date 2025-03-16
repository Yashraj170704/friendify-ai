
import React, { useRef, useEffect } from 'react';
import { useChat } from '@/context/ChatContext';
import MessageBubble from './MessageBubble';
import EmotionAnalyzer from './EmotionAnalyzer';
import VoiceRecognition from './VoiceRecognition';
import ThreeDAvatar from './ThreeDAvatar';
import { Sparkles, Radio, Zap, Bot } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';

const ChatInterface = () => {
  const { 
    messages, 
    aiEmotion, 
    isSpeaking, 
    setIsSpeaking,
    selectedAvatar,
    setSelectedAvatar
  } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { speak, cancel } = useSpeechSynthesis({
    onStart: () => setIsSpeaking(true),
    onEnd: () => setIsSpeaking(false),
    onError: (error) => {
      console.error('Speech synthesis error:', error);
      setIsSpeaking(false);
    },
  });
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Speak the latest AI message
    const latestMessage = messages[messages.length - 1];
    if (latestMessage && latestMessage.sender === 'ai') {
      speak(latestMessage.content, latestMessage.emotion || 'neutral');
    }
    
    // Cleanup function to cancel speech when component unmounts
    return () => {
      cancel();
    };
  }, [messages, speak, cancel]);

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-150px)] overflow-y-auto custom-scrollbar">
      {/* Left Column: Avatar Section */}
      <motion.div 
        className="lg:w-1/4 glass-panel p-4 rounded-2xl flex flex-col neo-glow tech-scanline"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h2 
          className="text-xl font-medium mb-2 text-center text-white flex justify-center items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Bot className="mr-2 h-5 w-5 text-purple-400" />
          AI Assistant
        </motion.h2>
        
        <div className="flex-1 flex flex-col items-center justify-center">
          <ThreeDAvatar 
            emotion={aiEmotion} 
            speaking={isSpeaking}
            selectedAvatar={selectedAvatar}
            onAvatarChange={setSelectedAvatar}
            showAvatarSelector={true}
          />
          
          {isSpeaking && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 py-1 px-3 bg-purple-500/20 rounded-full flex items-center"
            >
              <span className="animate-pulse mr-1">●</span>
              <span className="text-sm text-purple-200">Speaking...</span>
            </motion.div>
          )}
          
          <motion.div 
            className="mt-4 flex items-center justify-center gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Radio className="h-4 w-4 text-purple-400 animate-pulse" />
            <p className="text-sm text-center text-purple-200 max-w-md">
              I respond based on your emotions!
            </p>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Middle Column: Chat Messages */}
      <motion.div 
        className="lg:w-2/4 flex flex-col gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Chat Messages */}
        <div className="glass-panel p-4 rounded-2xl flex-grow overflow-hidden flex flex-col neo-glow h-[calc(100vh-270px)]">
          <div className="flex-1 overflow-y-auto pr-2 pb-4 custom-scrollbar">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-purple-200">
                <Sparkles className="h-8 w-8 text-purple-400 mb-2" />
                <p className="text-center mb-2">No messages yet</p>
                <p className="text-sm text-center">
                  Start speaking to begin a conversation with your AI assistant
                </p>
              </div>
            ) : (
              <div className="flex flex-col space-y-4 py-2">
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>
        
        {/* Voice Recognition Controls */}
        <div className="glass-panel p-4 rounded-2xl neo-glow">
          <VoiceRecognition />
        </div>
      </motion.div>
      
      {/* Right Column: Emotion Analyzer with Camera */}
      <motion.div 
        className="lg:w-1/4 glass-panel p-4 rounded-2xl neo-glow"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2 className="text-xl font-medium mb-2 text-center text-white flex justify-center items-center">
          <Zap className="mr-2 h-5 w-5 text-purple-400" />
          Emotion Detection
        </h2>
        <EmotionAnalyzer />
      </motion.div>
    </div>
  );
};

export default ChatInterface;
