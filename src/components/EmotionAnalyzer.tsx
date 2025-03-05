
import React, { useEffect, useState } from 'react';
import { useWebcam } from '@/hooks/useWebcam';
import { useChat } from '@/context/ChatContext';
import { Badge } from "@/components/ui/badge";
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
    <div className="relative overflow-hidden rounded-2xl glass-panel h-48 md:h-64 flex flex-col">
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white p-4 text-center z-10">
          <p>{error}</p>
        </div>
      )}
      
      <video 
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      
      <div className="absolute bottom-0 left-0 right-0 bg-black/30 p-2 flex justify-between items-center">
        <span className="text-white text-xs">Emotion Detector</span>
        <Badge variant="outline" className="bg-white/20 text-white">
          {getEmotionEmoji(userEmotion)} {userEmotion.charAt(0).toUpperCase() + userEmotion.slice(1)}
        </Badge>
      </div>
    </div>
  );
};

export default EmotionAnalyzer;
