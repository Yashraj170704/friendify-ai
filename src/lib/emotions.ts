
import type { Emotion } from '../context/ChatContext';

// Simple emotion detection from text
export const detectEmotionFromText = (text: string): Emotion => {
  const lowerText = text.toLowerCase();
  
  // Simple keyword-based emotion detection
  if (
    lowerText.includes('happy') || 
    lowerText.includes('glad') || 
    lowerText.includes('joy') || 
    lowerText.includes('excellent') ||
    lowerText.includes('great') ||
    lowerText.includes('😊') ||
    lowerText.includes('😄')
  ) {
    return 'happy';
  } else if (
    lowerText.includes('sad') || 
    lowerText.includes('sorry') || 
    lowerText.includes('upset') || 
    lowerText.includes('unhappy') ||
    lowerText.includes('miss') ||
    lowerText.includes('😢') ||
    lowerText.includes('😔')
  ) {
    return 'sad';
  } else if (
    lowerText.includes('angry') || 
    lowerText.includes('upset') || 
    lowerText.includes('annoyed') || 
    lowerText.includes('frustrated') ||
    lowerText.includes('mad') ||
    lowerText.includes('😡') ||
    lowerText.includes('😠')
  ) {
    return 'angry';
  } else if (
    lowerText.includes('wow') || 
    lowerText.includes('surprised') || 
    lowerText.includes('amazing') || 
    lowerText.includes('shocking') ||
    lowerText.includes('unexpected') ||
    lowerText.includes('😲') ||
    lowerText.includes('😮')
  ) {
    return 'surprised';
  }
  
  return 'neutral';
};

// Generate AI response based on user input and emotion
export const generateAIResponse = (
  userMessage: string, 
  userEmotion: Emotion
): { text: string; emotion: Emotion } => {
  // Mock responses based on user emotion
  const responses = {
    happy: [
      "I'm so glad to hear you're feeling good! That positive energy is contagious.",
      "Your happiness makes me happy too! What's contributing to your good mood today?",
      "It's wonderful to see you in such high spirits! I hope this feeling stays with you."
    ],
    sad: [
      "I'm sorry you're feeling down. Remember that it's okay to not be okay sometimes.",
      "I hear that you're feeling sad. Would you like to talk about what's on your mind?",
      "It sounds like things are difficult right now. I'm here to listen whenever you need."
    ],
    angry: [
      "I can sense you're frustrated. Sometimes taking a deep breath can help center your thoughts.",
      "I understand you're feeling angry. Would it help to talk through what happened?",
      "Your feelings are valid. Sometimes expressing anger is a necessary step toward resolution."
    ],
    surprised: [
      "That does sound surprising! I'd love to hear more about what caught you off guard.",
      "Unexpected things can certainly shake us up! How are you processing this surprise?",
      "Life's full of surprises, isn't it? I'm all ears if you want to share more details."
    ],
    neutral: [
      "I appreciate you sharing your thoughts with me. How else has your day been going?",
      "Thank you for telling me. Is there anything specific you'd like to discuss today?",
      "I'm here to chat about whatever's on your mind. What would you like to explore next?"
    ]
  };

  // Choose a random response based on the detected emotion
  const emotionResponses = responses[userEmotion];
  const randomIndex = Math.floor(Math.random() * emotionResponses.length);
  
  return {
    text: emotionResponses[randomIndex],
    emotion: userEmotion === 'happy' ? 'happy' : 
             userEmotion === 'sad' ? 'sad' : 
             userEmotion === 'angry' ? 'neutral' : userEmotion
  };
};

// Get color based on emotion
export const getEmotionColor = (emotion: Emotion): string => {
  switch (emotion) {
    case 'happy':
      return 'text-emotion-happy';
    case 'sad':
      return 'text-emotion-sad';
    case 'angry':
      return 'text-emotion-angry';
    case 'surprised':
      return 'text-emotion-surprised';
    default:
      return 'text-emotion-neutral';
  }
};

// Get background color based on emotion
export const getEmotionBgColor = (emotion: Emotion): string => {
  switch (emotion) {
    case 'happy':
      return 'bg-emotion-happy/20';
    case 'sad':
      return 'bg-emotion-sad/20';
    case 'angry':
      return 'bg-emotion-angry/20';
    case 'surprised':
      return 'bg-emotion-surprised/20';
    default:
      return 'bg-emotion-neutral/10';
  }
};
