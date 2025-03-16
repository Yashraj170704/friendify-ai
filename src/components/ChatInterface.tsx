
import React, { useRef, useEffect, useState } from 'react';
import { useChat } from '@/context/ChatContext';
import MessageBubble from './MessageBubble';
import EmotionAnalyzer from './EmotionAnalyzer';
import VoiceRecognition from './VoiceRecognition';
import ThreeDAvatar from './ThreeDAvatar';
import { Sparkles, Radio, Zap, Bot, Brain, History } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { Badge } from '@/components/ui/badge';

const ChatInterface = () => {
  const { 
    messages, 
    aiEmotion, 
    isSpeaking: chatIsSpeaking, 
    setIsSpeaking,
    selectedAvatar,
    setSelectedAvatar,
    conversationContext
  } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showContextPanel, setShowContextPanel] = useState(false);
  const lastProcessedMessageRef = useRef<string | null>(null);
  
  const { speak, cancel, isSpeaking } = useSpeechSynthesis({
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
    
    // Speak the latest AI message if it's not the same as the last one
    const latestMessage = messages[messages.length - 1];
    if (latestMessage && 
        latestMessage.sender === 'ai' && 
        lastProcessedMessageRef.current !== latestMessage.id) {
      console.log('Speaking new AI message:', latestMessage.content);
      lastProcessedMessageRef.current = latestMessage.id;
      speak(latestMessage.content, latestMessage.emotion || 'neutral');
    }
    
  }, [messages, speak]);

  // Cleanup function to cancel speech when component unmounts
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  const toggleContextPanel = () => {
    setShowContextPanel(!showContextPanel);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-150px)] overflow-y-auto custom-scrollbar">
      {/* Left Column: Avatar and Context Memory */}
      <motion.div 
        className="lg:w-1/4 flex flex-col gap-4"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Avatar */}
        <div className="glass-panel p-4 rounded-2xl flex flex-col neo-glow tech-scanline">
          <motion.h2 
            className="text-xl font-medium mb-2 text-center text-white flex justify-center items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Bot className="mr-2 h-5 w-5 text-purple-400" />
            AI Friend
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
          </div>
        </div>
        
        {/* Context Memory Panel */}
        <motion.div 
          className="glass-panel p-4 rounded-2xl neo-glow flex-1 flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-medium text-white flex items-center">
              <Brain className="mr-2 h-5 w-5 text-purple-400" />
              Memory & Context
            </h2>
            <Badge 
              variant="outline" 
              className="bg-purple-500/20 border-purple-400/30 text-white cursor-pointer"
              onClick={toggleContextPanel}
            >
              <History className="h-3 w-3 mr-1" />
              {showContextPanel ? 'Hide' : 'Show'}
            </Badge>
          </div>
          
          {showContextPanel && (
            <div className="flex flex-col gap-2 overflow-y-auto custom-scrollbar">
              {conversationContext.length > 0 ? (
                conversationContext.map((item, index) => (
                  <div key={`context-${index}`} className="bg-white/10 backdrop-blur-md rounded-lg p-2 text-sm">
                    {item}
                  </div>
                ))
              ) : (
                <p className="text-purple-200 text-sm text-center italic">
                  I'll remember important details from our conversation here.
                </p>
              )}
            </div>
          )}
          
          {!showContextPanel && (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-purple-200 text-sm text-center max-w-xs">
                I remember our conversations and learn about you over time, just like a real friend!
              </p>
            </div>
          )}
          
          <div className="mt-4 flex items-center justify-center gap-2">
            <Radio className="h-4 w-4 text-purple-400 animate-pulse" />
            <p className="text-sm text-center text-purple-200 max-w-md">
              I respond based on your emotions and our history.
            </p>
          </div>
        </motion.div>
      </motion.div>
      
      {/* Middle Column: Chat Messages */}
      <motion.div 
        className="lg:w-1/2 flex flex-col gap-4"
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
                  Start speaking to begin a conversation with your AI friend
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
