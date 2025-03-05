
import React, { useEffect } from 'react';
import { ChatProvider } from '@/context/ChatContext';
import ChatInterface from '@/components/ChatInterface';
import { toast } from 'sonner';

const Index = () => {
  useEffect(() => {
    // Welcome toast
    toast.success("AI Friend ready to chat!", {
      description: "Enable your camera and microphone for the full experience.",
      duration: 5000,
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-friend to-friend-dark animate-gradient-shift">
              AI Friend
            </h1>
            <p className="text-muted-foreground mt-2 animate-fade-in">
              An empathetic companion that understands your emotions
            </p>
          </div>
        </header>
        
        <main className="chat-container animate-blur-in">
          <ChatProvider>
            <ChatInterface />
          </ChatProvider>
        </main>
        
        <footer className="mt-8 text-center text-sm text-muted-foreground">
          <p>AI Friend responds to both your words and emotions</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
