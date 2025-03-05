
import React, { useEffect } from 'react';
import { useWebcam } from '@/hooks/useWebcam';
import { useChat } from '@/context/ChatContext';

const EmotionAnalyzer = () => {
  const { setUserEmotion } = useChat();
  const { videoRef, isActive, startWebcam, error } = useWebcam({
    onEmotionDetected: (emotion) => {
      setUserEmotion(emotion);
    }
  });

  // Start webcam when component mounts
  useEffect(() => {
    if (!isActive) {
      startWebcam();
    }
  }, [isActive, startWebcam]);

  return (
    <div className="relative overflow-hidden rounded-2xl glass-panel h-48 md:h-64">
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white p-4 text-center">
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
      
      <div className="absolute bottom-0 left-0 right-0 bg-black/30 text-white text-xs p-2 text-center">
        Emotion Analysis Active
      </div>
    </div>
  );
};

export default EmotionAnalyzer;
