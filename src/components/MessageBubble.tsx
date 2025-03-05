
import React from 'react';
import { cn } from '@/lib/utils';
import type { Message } from '@/context/ChatContext';
import { getEmotionColor } from '@/lib/emotions';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
  const { content, sender, emotion = 'neutral' } = message;
  const isUser = sender === 'user';
  
  return (
    <div 
      className={cn(
        'message-bubble',
        isUser ? 'user-message' : 'ai-message',
        isUser ? 'bg-primary' : 'bg-friend-surface',
        'transition-all duration-300 ease-in-out'
      )}
    >
      <div className="flex flex-col">
        <span 
          className={cn(
            'text-sm font-medium mb-1',
            isUser ? 'text-white/80' : getEmotionColor(emotion)
          )}
        >
          {isUser ? 'You' : 'AI Friend'}
        </span>
        <p className={isUser ? 'text-white' : 'text-foreground'}>
          {content}
        </p>
      </div>
    </div>
  );
};

export default MessageBubble;
