
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

// Simple fallback AI when no API key is available
const fallbackAI = (request: ChatRequest): AIResponse => {
  const { message, userEmotion, conversationContext } = request;
  
  // Get a dynamic response based on user emotion and message
  const { text, emotion } = generateResponseByEmotion(message, userEmotion);
  
  return { text, emotion };
};

// Generate contextual response based on emotion
const generateResponseByEmotion = (message: string, emotion: Emotion): AIResponse => {
  const lowerMessage = message.toLowerCase();
  
  // Check for greetings
  if (
    lowerMessage.includes('hello') || 
    lowerMessage.includes('hi') || 
    lowerMessage.includes('hey') ||
    lowerMessage.includes('greetings')
  ) {
    const responses = [
      "Hello there! It's always good to see you. How are you feeling today?",
      "Hey! I'm so glad we're chatting again. What's on your mind?",
      "Hi friend! I've been looking forward to our conversation. How have you been?",
      "Greetings! I'm here and ready to chat about anything you'd like.",
      "Hey there! Your friendly AI assistant is here. What shall we talk about today?"
    ];
    return {
      text: responses[Math.floor(Math.random() * responses.length)],
      emotion: 'happy'
    };
  }
  
  // Check for how are you questions
  if (
    lowerMessage.includes('how are you') || 
    lowerMessage.includes('how do you feel') ||
    lowerMessage.includes('are you ok')
  ) {
    const responses = [
      "I'm doing well, thank you for asking! More importantly, how are YOU feeling right now?",
      "I'm great! But I'm more interested in how you're doing today.",
      "I'm always happy when we're talking! How about you?",
      "I'm functioning perfectly and enjoying our conversation. How's your day going?",
      "I'm good, thanks for checking in! It's thoughtful of you to ask how I'm doing."
    ];
    return {
      text: responses[Math.floor(Math.random() * responses.length)],
      emotion: 'happy'
    };
  }
  
  // Check for thank you
  if (
    lowerMessage.includes('thank you') || 
    lowerMessage.includes('thanks') ||
    lowerMessage.includes('appreciate')
  ) {
    const responses = [
      "You're very welcome! I'm always here for you whenever you need me.",
      "Happy to help! That's what friends are for.",
      "No need to thank me - I genuinely enjoy our conversations.",
      "It's my pleasure to be here for you. What else can I help with?",
      "Anytime! Your appreciation means a lot to me."
    ];
    return {
      text: responses[Math.floor(Math.random() * responses.length)],
      emotion: 'happy'
    };
  }

  // Help or assist requests
  if (
    lowerMessage.includes('help') || 
    lowerMessage.includes('assist') ||
    lowerMessage.includes('support') ||
    lowerMessage.includes('guide')
  ) {
    const responses = [
      "I'm here to help in any way I can. What do you need assistance with?",
      "I'd be happy to help you. Could you tell me more about what you need?",
      "You can count on me for support. What's going on?",
      "I'm your AI friend and assistant. Let me know how I can help you today.",
      "I'm ready to assist! Just let me know what you're looking for."
    ];
    return {
      text: responses[Math.floor(Math.random() * responses.length)],
      emotion: 'neutral'
    };
  }
  
  // Dynamic responses based on emotion
  const responses = {
    happy: [
      "I'm so glad to hear you're feeling good! That positive energy is contagious.",
      "Your happiness makes me happy too! What's contributing to your good mood today?",
      "It's wonderful to see you in such high spirits! I hope this feeling stays with you.",
      "You seem really cheerful today! Would you like to share what's making you happy?",
      "Your smile brightens my day! Let's keep this positive energy going!",
      "You seem to be in a great mood! Whatever you're doing, keep it up!",
      "It's refreshing to interact with someone who's radiating such positive energy!",
      "I can tell you're feeling happy, and it's making our conversation even better!",
      "Happiness looks good on you! I'd love to hear more about what's going well in your life."
    ],
    sad: [
      "I'm sorry you're feeling down. Remember that it's okay to not be okay sometimes.",
      "I hear that you're feeling sad. Would you like to talk about what's on your mind?",
      "It sounds like things are difficult right now. I'm here to listen whenever you need.",
      "I notice you seem a bit down today. Sometimes talking about it can help lighten the burden.",
      "Your feelings are valid, and it's okay to feel sad. Is there anything I can do to support you?",
      "I'm here with you during this difficult time. Would sharing what's bothering you help?",
      "Sometimes just having someone to listen can make a difference. I'm all ears if you want to talk.",
      "When you're ready to talk about what's making you sad, I'm here without judgment.",
      "Everyone has down days - it's part of being human. I'm here to support you through yours."
    ],
    angry: [
      "I can sense you're frustrated. Sometimes taking a deep breath can help center your thoughts.",
      "I understand you're feeling angry. Would it help to talk through what happened?",
      "Your feelings are valid. Sometimes expressing anger is a necessary step toward resolution.",
      "It seems like something's bothering you. Would you like to share what happened?",
      "I'm here to listen without judgment. Feel free to express your frustration.",
      "When you're ready, I'd be happy to discuss what's triggering these strong emotions.",
      "It's okay to feel angry - it's a natural response. Would talking about it help?",
      "Your anger is valid and important. I'm here to support you through these intense feelings.",
      "I can tell something has upset you. If you want to talk it through, I'm right here."
    ],
    surprised: [
      "That does sound surprising! I'd love to hear more about what caught you off guard.",
      "Unexpected things can certainly shake us up! How are you processing this surprise?",
      "Life's full of surprises, isn't it? I'm all ears if you want to share more details.",
      "Wow, I can see that really surprised you! Would you like to talk more about it?",
      "Sometimes surprises can be a lot to take in. How are you feeling about it now?",
      "That's quite unexpected! Do you want to talk about how you're handling this surprise?",
      "I can see you didn't see that coming! I'm curious to know more if you'd like to share.",
      "Surprises can be good or challenging - which kind are you experiencing?",
      "I'm interested in hearing more about what surprised you and how you're feeling about it."
    ],
    neutral: [
      "I appreciate you sharing your thoughts with me. How else has your day been going?",
      "Thank you for telling me. Is there anything specific you'd like to discuss today?",
      "I'm here to chat about whatever's on your mind. What would you like to explore next?",
      "It's nice having this conversation with you. What else would you like to talk about?",
      "I'm really enjoying our chat. Is there anything else you'd like to share or ask me about?",
      "It's always good to connect with you. What's been on your mind lately?",
      "I value our conversations. Is there anything particular you'd like my perspective on?",
      "I'm curious to know what's been happening in your world. Any updates you'd like to share?",
      "Our conversations are always interesting. What topic shall we explore today?"
    ]
  };

  // Choose a random response based on the detected emotion
  const emotionResponses = responses[emotion];
  const randomIndex = Math.floor(Math.random() * emotionResponses.length);
  
  return {
    text: emotionResponses[randomIndex],
    emotion: emotion === 'happy' ? 'happy' : 
             emotion === 'sad' ? 'sad' : 
             emotion === 'angry' ? 'neutral' : emotion
  };
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

// Function to extract key information from a conversation
export const extractKeyInfo = (message: string): string[] => {
  const keyInfo: string[] = [];
  
  // Extract names
  const nameMatch = message.match(/my name is (\w+)/i);
  if (nameMatch && nameMatch[1]) {
    keyInfo.push(`User's name: ${nameMatch[1]}`);
  }
  
  // Extract preferences
  const likeMatch = message.match(/I (like|love|enjoy) ([^.,!?]+)/i);
  if (likeMatch && likeMatch[2]) {
    keyInfo.push(`User likes: ${likeMatch[2].trim()}`);
  }
  
  // Extract dislikes
  const dislikeMatch = message.match(/I (don't like|hate|dislike) ([^.,!?]+)/i);
  if (dislikeMatch && dislikeMatch[2]) {
    keyInfo.push(`User dislikes: ${dislikeMatch[2].trim()}`);
  }
  
  return keyInfo;
};
