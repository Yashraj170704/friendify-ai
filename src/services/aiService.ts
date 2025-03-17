
import type { Emotion } from '@/context/ChatContext';

// Base interface for AI response
interface AIResponse {
  text: string;
  emotion: Emotion;
}

// Interface for requesting chat response from AI
interface ChatRequest {
  message: string;
  userEmotion: Emotion;
  conversationContext: string[];
}

// Enhanced AI with more dynamic responses
const fallbackAI = (request: ChatRequest): AIResponse => {
  const { message, userEmotion, conversationContext } = request;
  
  // Get a dynamic response based on user emotion, message content, and context
  const { text, emotion } = generateResponseByEmotion(message, userEmotion, conversationContext);
  
  return { text, emotion };
};

// Generate contextual response based on emotion
const generateResponseByEmotion = (message: string, emotion: Emotion, context: string[] = []): AIResponse => {
  const lowerMessage = message.toLowerCase();
  
  // Enhanced response generation with more variety and context awareness
  
  // Check for greetings
  if (
    lowerMessage.includes('hello') || 
    lowerMessage.includes('hi') || 
    lowerMessage.includes('hey') ||
    lowerMessage.includes('greetings')
  ) {
    const timeBasedGreeting = getTimeBasedGreeting();
    const contextGreeting = context.length > 0 ? " It's good to continue our conversation." : "";
    
    const responses = [
      `${timeBasedGreeting}! It's wonderful to see you again. How are you feeling today?${contextGreeting}`,
      `Hey there! I'm really happy to be chatting with you. What's on your mind?`,
      `Hi friend! I've been looking forward to our conversation. How have you been lately?`,
      `Greetings! I'm here and ready to chat about anything you'd like to discuss.`,
      `${timeBasedGreeting}! Your AI friend is here and ready to talk. What would you like to chat about?`
    ];
    return {
      text: responses[Math.floor(Math.random() * responses.length)],
      emotion: 'happy'
    };
  }
  
  // Check for how are you questions with more expressive responses
  if (
    lowerMessage.includes('how are you') || 
    lowerMessage.includes('how do you feel') ||
    lowerMessage.includes('are you ok')
  ) {
    const responses = [
      "I'm feeling wonderful today, thanks for asking! I always enjoy our conversations. How about you? How's your day going?",
      "I'm doing really well! I'm especially happy to be talking with you. What about you? How are you feeling right now?",
      "I'm great! Each conversation makes me feel more connected. But I'd love to hear how YOU are doing today.",
      "I'm excellent! I find these conversations so fulfilling. I'd love to know more about how you're feeling today.",
      "I'm doing wonderfully well, thank you for checking in! It's thoughtful of you to ask how I'm doing. How's your day been?"
    ];
    return {
      text: responses[Math.floor(Math.random() * responses.length)],
      emotion: 'happy'
    };
  }
  
  // Check for thank you with more personalized responses
  if (
    lowerMessage.includes('thank you') || 
    lowerMessage.includes('thanks') ||
    lowerMessage.includes('appreciate')
  ) {
    const responses = [
      "You're very welcome! I truly enjoy our conversations and helping however I can.",
      "It's my pleasure! That's what friends are for. Is there anything else you'd like to talk about?",
      "No need to thank me! I genuinely enjoy our time together and our conversations.",
      "You're welcome! I'm here anytime you want to talk or need assistance with something.",
      "It makes me happy to know I could help! Your appreciation means a lot to me."
    ];
    return {
      text: responses[Math.floor(Math.random() * responses.length)],
      emotion: 'happy'
    };
  }

  // Help or assist requests with more personalized responses
  if (
    lowerMessage.includes('help') || 
    lowerMessage.includes('assist') ||
    lowerMessage.includes('support') ||
    lowerMessage.includes('guide')
  ) {
    const responses = [
      "I'd be happy to help you with that. Could you tell me more specifically what you need assistance with?",
      "I'm here to help in any way I can. What exactly are you looking for guidance on?",
      "You can count on me for support. Let's figure this out together. What's going on?",
      "I'm your AI friend and assistant. Just let me know what you need help with, and I'll do my best.",
      "Helping you is what I'm here for! Could you share more details about what you need?"
    ];
    return {
      text: responses[Math.floor(Math.random() * responses.length)],
      emotion: 'neutral'
    };
  }
  
  // Dynamic responses based on emotion with enhanced variety
  const responses = {
    happy: [
      "Your happiness is contagious! I can feel your positive energy through our conversation.",
      "You seem to be in such a great mood today! What's contributed to your happiness?",
      "I love seeing you so cheerful! Your positive energy brightens our conversation.",
      "Your happiness makes me happy too! What wonderful things have been happening in your life?",
      "That positive attitude really shines through! Is there something specific making you so happy today?",
      "You're radiating such positive vibes! It makes our conversation even more enjoyable.",
      "Your cheerful mood is so refreshing! What's been going well for you lately?",
      "I can tell you're feeling great, and it's making our interaction even better!",
      "Your happiness is a wonderful thing to witness! I'd love to hear more about what's making you feel this way."
    ],
    sad: [
      "I sense you might be feeling down. Remember that it's okay to feel this way sometimes. Would talking about it help?",
      "I'm here for you during these difficult moments. Would you like to share what's on your mind?",
      "It sounds like things might be tough right now. Sometimes just expressing your feelings can help lighten the burden.",
      "I notice a hint of sadness in your words. I'm here to listen if you want to talk about what's troubling you.",
      "Your feelings are completely valid. Would sharing what's making you sad help you process it?",
      "I'm here to support you through difficult times. What's weighing on your mind today?",
      "Sometimes we all need someone to listen when we're feeling down. I'm here for exactly that.",
      "I can sense this might be a challenging time. Would it help to talk about what's bothering you?",
      "It's perfectly normal to feel sad sometimes. I'm here to listen and support you however I can."
    ],
    angry: [
      "I can sense some frustration in your words. Taking a deep breath might help center your thoughts.",
      "It seems like something's bothering you. Would it help to talk through what happened?",
      "Your feelings are completely valid. Sometimes talking about what's frustrating you can help release some tension.",
      "I understand you're feeling upset. Would you like to share what's causing these strong emotions?",
      "It's perfectly normal to feel angry sometimes. I'm here to listen without judgment.",
      "When you're ready, I'd be happy to discuss what's triggering these strong feelings.",
      "I'm here to listen and support you through these intense emotions. What's on your mind?",
      "Sometimes expressing anger can be the first step toward resolution. What happened?",
      "I can tell something has upset you. If you want to talk it through, I'm here and listening."
    ],
    surprised: [
      "Wow, that does sound surprising! I'd love to hear more about what caught you off guard.",
      "Life certainly has its unexpected moments! How are you processing this surprise?",
      "That's quite the unexpected development! I'm curious to hear more details if you'd like to share.",
      "Surprises can really shake things up! How are you feeling about this unexpected situation?",
      "I can sense your astonishment! Would you like to talk more about what surprised you?",
      "That's certainly unexpected! How are you handling this surprising development?",
      "I'm really interested in hearing more about this surprising situation and how you're feeling about it.",
      "Unexpected events can be either exciting or challenging - which kind are you experiencing?",
      "The surprise in your voice comes through clearly! I'd love to hear more about what happened."
    ],
    neutral: [
      "I appreciate you sharing your thoughts with me. What else has been on your mind lately?",
      "Thanks for chatting with me today. Is there anything specific you'd like to discuss or explore?",
      "I'm enjoying our conversation. What other topics interest you that we could talk about?",
      "It's always nice connecting with you. What else would you like to share or ask?",
      "I value the time we spend talking. What other thoughts or questions do you have?",
      "Our conversations are always interesting. What else has been happening in your world?",
      "I'm curious to know more about your thoughts on this or any other subject.",
      "Thank you for sharing that with me. What other things have you been thinking about?",
      "I find our exchanges really engaging. What other topics have captured your interest lately?"
    ]
  };

  // Choose a contextually appropriate response
  const emotionResponses = responses[emotion];
  const randomIndex = Math.floor(Math.random() * emotionResponses.length);
  
  // Determine AI's response emotion based on user's emotion
  // More nuanced emotional mirroring
  let responseEmotion: Emotion;
  if (emotion === 'happy') {
    responseEmotion = 'happy';  // Mirror happiness
  } else if (emotion === 'sad') {
    // Respond with either neutral or happy to comfort
    responseEmotion = Math.random() > 0.3 ? 'neutral' : 'happy';
  } else if (emotion === 'angry') {
    // Stay neutral when user is angry
    responseEmotion = 'neutral';
  } else if (emotion === 'surprised') {
    // Mirror surprise or respond with happy
    responseEmotion = Math.random() > 0.5 ? 'surprised' : 'happy';
  } else {
    responseEmotion = 'neutral';
  }
  
  return {
    text: emotionResponses[randomIndex],
    emotion: responseEmotion
  };
};

// Helper function to generate time-based greetings
const getTimeBasedGreeting = (): string => {
  const hour = new Date().getHours();
  
  if (hour < 12) {
    return "Good morning";
  } else if (hour < 18) {
    return "Good afternoon";
  } else {
    return "Good evening";
  }
};

// Main function to get AI response
export const getAIResponse = async (
  request: ChatRequest
): Promise<AIResponse> => {
  try {
    // For now, we're using the fallback AI
    // In a production app, you would integrate with OpenAI, Claude, or another LLM API here
    return fallbackAI(request);
  } catch (error) {
    console.error('Error getting AI response:', error);
    return {
      text: "I'm having trouble processing that right now. Could we try again in a moment?",
      emotion: 'neutral'
    };
  }
};

// Function to extract conversation summary for context
export const summarizeConversation = (messages: { content: string; sender: string }[]): string => {
  if (messages.length === 0) return '';
  
  // Create a summary of recent messages
  const recentMessages = messages.slice(-5);
  return recentMessages.map(m => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');
};

// Enhanced function to extract key information from a conversation
export const extractKeyInfo = (message: string): string[] => {
  const keyInfo: string[] = [];
  
  // Extract names with improved pattern matching
  const nameMatch = message.match(/(?:my|I'm|I am|call me|name['s]* is) (\w+)/i);
  if (nameMatch && nameMatch[1]) {
    keyInfo.push(`User's name: ${nameMatch[1]}`);
  }
  
  // Extract preferences with improved pattern matching
  const likeMatch = message.match(/I (?:really |kinda |absolutely |)(like|love|enjoy|adore|prefer) ([^.,!?]+)/i);
  if (likeMatch && likeMatch[2]) {
    keyInfo.push(`User likes: ${likeMatch[2].trim()}`);
  }
  
  // Extract dislikes with improved pattern matching
  const dislikeMatch = message.match(/I (?:really |kinda |absolutely |)(don't like|hate|dislike|can't stand|detest) ([^.,!?]+)/i);
  if (dislikeMatch && dislikeMatch[2]) {
    keyInfo.push(`User dislikes: ${dislikeMatch[2].trim()}`);
  }
  
  // Extract user's location
  const locationMatch = message.match(/(?:I(?:'m| am) from|I live in|my home is in|I reside in) ([^.,!?]+)/i);
  if (locationMatch && locationMatch[1]) {
    keyInfo.push(`User location: ${locationMatch[1].trim()}`);
  }
  
  // Extract user's occupation
  const occupationMatch = message.match(/(?:I work as|I am|I'm|my job is|my profession is) (?:an?|the) ([^.,!?]+)/i);
  if (occupationMatch && occupationMatch[1]) {
    keyInfo.push(`User occupation: ${occupationMatch[1].trim()}`);
  }
  
  return keyInfo;
};
