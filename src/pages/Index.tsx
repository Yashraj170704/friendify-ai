
import React, { useEffect } from 'react';
import { ChatProvider } from '@/context/ChatContext';
import ChatInterface from '@/components/ChatInterface';
import { toast } from 'sonner';
import { Sparkles } from 'lucide-react';

const Index = () => {
  useEffect(() => {
    // Welcome toast
    toast.success("AI Friend ready to chat!", {
      description: "Enable your camera and microphone for the full experience.",
      duration: 5000,
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-indigo-950 py-6 px-4 sm:px-6 lg:px-8 cyber-grid">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 animate-gradient-shift flex items-center justify-center gap-2">
              <Sparkles className="h-8 w-8 text-blue-400" />
              AI Friend
              <Sparkles className="h-8 w-8 text-purple-400" />
            </h1>
            <p className="text-blue-200 mt-2 animate-fade-in">
              An empathetic companion that understands your emotions
            </p>
          </div>
        </header>
        
        <main className="chat-container animate-blur-in">
          <ChatProvider>
            <ChatInterface />
          </ChatProvider>
        </main>
        
        <footer className="mt-8 text-center text-sm text-blue-300/60">
          <p>AI Friend responds to both your words and emotions</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
