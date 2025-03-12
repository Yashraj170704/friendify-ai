
import React, { useEffect } from 'react';
import { ChatProvider } from '@/context/ChatContext';
import ChatInterface from '@/components/ChatInterface';
import BackgroundScene from '@/components/BackgroundScene';
import { toast } from 'sonner';
import { Bot, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const Index = () => {
  useEffect(() => {
    // Welcome toast
    toast.success("AI Assistant ready!", {
      description: "Your futuristic AI companion is ready to chat.",
      duration: 5000,
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-indigo-950 py-4 px-4 sm:px-6 lg:px-8 cyber-grid relative overflow-y-auto">
      {/* 3D Background */}
      <BackgroundScene />
      
      {/* Content */}
      <div className="mx-auto relative z-10">
        <motion.header 
          className="mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 animate-gradient-shift flex items-center justify-center gap-2">
              <Bot className="h-8 w-8 text-purple-400" />
              Futuristic AI Assistant
              <Sparkles className="h-8 w-8 text-pink-400" />
            </h1>
            <p className="text-purple-200 mt-2 animate-fade-in">
              An intelligent AI companion that speaks, listens, and responds
            </p>
          </div>
        </motion.header>
        
        <main className="chat-container animate-blur-in">
          <ChatProvider>
            <ChatInterface />
          </ChatProvider>
        </main>
        
        <motion.footer 
          className="mt-6 text-center text-sm text-purple-300/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
        >
          <p>Your AI assistant responds to your voice, emotions, and can speak back to you</p>
        </motion.footer>
      </div>
      
      {/* Decorative floating elements */}
      <div className="fixed top-10 right-10 w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
      <div className="fixed bottom-10 left-10 w-3 h-3 bg-pink-400 rounded-full animate-pulse"></div>
    </div>
  );
};

export default Index;
