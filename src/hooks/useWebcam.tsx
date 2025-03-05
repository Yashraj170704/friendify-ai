
import { useState, useEffect, useRef } from 'react';
import type { Emotion } from '../context/ChatContext';

interface UseWebcamOptions {
  onEmotionDetected?: (emotion: Emotion) => void;
}

export function useWebcam({ onEmotionDetected }: UseWebcamOptions = {}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [permission, setPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [error, setError] = useState<string | null>(null);

  // Start webcam stream
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsActive(true);
        setPermission('granted');
        setError(null);
        
        // Simulate emotion detection for demo purposes
        if (onEmotionDetected) {
          startEmotionDetection(onEmotionDetected);
        }
      }
    } catch (err) {
      console.error('Error accessing webcam:', err);
      setIsActive(false);
      setPermission('denied');
      setError('Failed to access webcam. Please check permissions.');
    }
  };

  // Stop webcam stream
  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsActive(false);
    }
  };

  // Simulate emotion detection (in real app, would use a ML model)
  const startEmotionDetection = (callback: (emotion: Emotion) => void) => {
    const emotions: Emotion[] = ['neutral', 'happy', 'sad', 'surprised', 'angry'];
    let lastEmotion: Emotion = 'neutral';
    
    // Simulate occasional emotion changes
    const detectionInterval = setInterval(() => {
      // 80% chance to stay with current emotion, 20% chance to change
      if (Math.random() > 0.8) {
        const newEmotion = emotions[Math.floor(Math.random() * emotions.length)];
        if (newEmotion !== lastEmotion) {
          lastEmotion = newEmotion;
          callback(newEmotion);
        }
      }
    }, 3000);
    
    // Clean up interval when component unmounts
    return () => clearInterval(detectionInterval);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, []);

  return {
    videoRef,
    isActive,
    permission,
    error,
    startWebcam,
    stopWebcam
  };
}
