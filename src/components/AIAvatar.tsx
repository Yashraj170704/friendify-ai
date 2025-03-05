
import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Emotion } from '@/context/ChatContext';
import { getEmotionBgColor } from '@/lib/emotions';

interface AIAvatarProps {
  emotion: Emotion;
  speaking: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const AIAvatar = ({ 
  emotion = 'neutral',
  speaking = false,
  size = 'lg',
  className
}: AIAvatarProps) => {
  const pulseRef = useRef<HTMLDivElement>(null);
  
  // Avatar sizes
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-28 h-28'
  };
  
  // Effect for pulse animation when speaking
  useEffect(() => {
    const element = pulseRef.current;
    if (element) {
      if (speaking) {
        element.classList.add('pulsing');
      } else {
        element.classList.remove('pulsing');
      }
    }
  }, [speaking]);

  // Different "faces" based on emotions
  const getFaceForEmotion = (emotion: Emotion) => {
    switch (emotion) {
      case 'happy':
        return (
          <div className="text-center">
            <div className="mb-1 text-2xl">😊</div>
            <div className="text-xs uppercase tracking-wide">Happy</div>
          </div>
        );
      case 'sad':
        return (
          <div className="text-center">
            <div className="mb-1 text-2xl">😔</div>
            <div className="text-xs uppercase tracking-wide">Thoughtful</div>
          </div>
        );
      case 'angry':
        return (
          <div className="text-center">
            <div className="mb-1 text-2xl">😌</div>
            <div className="text-xs uppercase tracking-wide">Calm</div>
          </div>
        );
      case 'surprised':
        return (
          <div className="text-center">
            <div className="mb-1 text-2xl">😮</div>
            <div className="text-xs uppercase tracking-wide">Surprised</div>
          </div>
        );
      default:
        return (
          <div className="text-center">
            <div className="mb-1 text-2xl">🙂</div>
            <div className="text-xs uppercase tracking-wide">Listening</div>
          </div>
        );
    }
  };

  return (
    <div 
      className={cn(
        'relative flex items-center justify-center rounded-full',
        'transition-all duration-500 ease-in-out',
        sizeClasses[size],
        getEmotionBgColor(emotion),
        'shadow-avatar',
        'glow-effect',
        speaking && 'animate-pulse-subtle',
        className
      )}
    >
      <div className="avatar-pulse" ref={pulseRef}></div>
      <div className="transform transition-transform duration-300">
        {getFaceForEmotion(emotion)}
      </div>
    </div>
  );
};

export default AIAvatar;
