
import React, { useEffect, useState } from 'react';
import { useWebcam } from '@/hooks/useWebcam';
import { useChat } from '@/context/ChatContext';
import { Badge } from "@/components/ui/badge";
import { ScanFace } from 'lucide-react';
import type { Emotion } from '@/context/ChatContext';

const EmotionAnalyzer = () => {
  const { setUserEmotion, userEmotion } = useChat();
  const [lastDetection, setLastDetection] = useState<Date>(new Date());
  
  const { videoRef, isActive, startWebcam, error } = useWebcam({
    onEmotionDetected: (emotion) => {
      setUserEmotion(emotion);
      setLastDetection(new Date());
    }
  });

  // Start webcam when component mounts
  useEffect(() => {
    if (!isActive) {
      startWebcam();
    }
  }, [isActive, startWebcam]);

  // Get emoji based on emotion
  const getEmotionEmoji = (emotion: Emotion): string => {
    switch (emotion) {
      case 'happy':
        return '😊';
      case 'sad': 
        return '😔';
      case 'angry':
        return '😠';
      case 'surprised':
        return '😮';
      default:
        return '🙂';
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl glass-panel h-48 md:h-64 flex flex-col neo-glow">
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white p-4 text-center z-10 backdrop-blur-md">
          <p>{error}</p>
        </div>
      )}
      
      <div className="absolute top-2 left-2 flex items-center space-x-2 p-1 px-2 bg-black/20 backdrop-blur-sm rounded-full z-10">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        <span className="text-white text-xs">Live</span>
      </div>
      
      <video 
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      
      <div className="absolute inset-0 pointer-events-none border border-indigo-500/20 rounded-2xl"></div>
      
      <div className="absolute top-2 right-2 z-10">
        <Badge variant="outline" className="bg-black/30 backdrop-blur-md text-white border-indigo-500/50 px-3 py-1">
          <ScanFace size={14} className="mr-1 text-indigo-400" /> Emotion Scanner
        </Badge>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-3 flex justify-between items-center border-t border-white/10">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
          <span className="text-white text-xs">Scanning</span>
        </div>
        <Badge variant="outline" className="bg-indigo-500/20 text-white border-indigo-400/50 px-3 py-1.5">
          {getEmotionEmoji(userEmotion)} {userEmotion.charAt(0).toUpperCase() + userEmotion.slice(1)}
        </Badge>
      </div>
      
      <div className="absolute inset-0 border-[8px] border-transparent rounded-2xl bg-clip-padding p-1">
        <div className="w-full h-full rounded-lg border border-indigo-500/30 pointer-events-none"></div>
      </div>
    </div>
  );
};

export default EmotionAnalyzer;
