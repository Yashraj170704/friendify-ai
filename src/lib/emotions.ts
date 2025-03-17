import type { Emotion } from '../context/ChatContext';

// Simple emotion detection from text
export const detectEmotionFromText = (text: string): Emotion => {
  const lowercaseText = text.toLowerCase();
  
  // Enhanced emotion detection with more patterns and contextual analysis
  
  // Happy emotion patterns
  const happyWords = [
    'happy', 'joy', 'great', 'excellent', 'wonderful', 'amazing', 'love', 'awesome',
    'delighted', 'pleased', 'thrilled', 'excited', 'fantastic', 'glad', 'smile', 'laugh',
    'perfect', 'nice', 'good', 'yay', 'best', 'congrats', 'congratulations', 'win', 'winning'
  ];
  
  // Sad emotion patterns
  const sadWords = [
    'sad', 'unhappy', 'upset', 'awful', 'terrible', 'horrible', 'disappointed', 'miserable',
    'depressed', 'gloomy', 'sorry', 'regret', 'cry', 'tears', 'lost', 'miss', 'fail', 'failed',
    'unfortunately', 'grief', 'heartbroken'
  ];
  
  // Angry emotion patterns
  const angryWords = [
    'angry', 'mad', 'furious', 'annoyed', 'irritated', 'hate', 'anger', 'frustrated',
    'rage', 'outrageous', 'unfair', 'unacceptable', 'damn', 'hell', 'stupid', 'ridiculous',
    'absurd', 'worst', 'terrible', 'atrocious'
  ];
  
  // Surprised emotion patterns
  const surprisedWords = [
    'surprised', 'shock', 'unexpected', 'wow', 'oh', 'whoa', 'unbelievable', 'astonished',
    'amazed', 'astounded', 'startled', 'stunning', 'incredible', 'speechless', 'omg', 'what',
    'serious', 'really', 'seriously', 'impossible'
  ];
  
  // Count matches for each emotion
  let happyScore = 0;
  let sadScore = 0;
  let angryScore = 0;
  let surprisedScore = 0;
  
  // Check for matching words in text
  happyWords.forEach(word => {
    if (lowercaseText.includes(word)) {
      happyScore += 1;
      // Give more weight to stronger words
      if (['love', 'amazing', 'excellent', 'fantastic', 'wonderful'].includes(word)) {
        happyScore += 1;
      }
    }
  });
  
  sadWords.forEach(word => {
    if (lowercaseText.includes(word)) {
      sadScore += 1;
      // Give more weight to stronger words
      if (['depressed', 'heartbroken', 'grief', 'miserable', 'terrible'].includes(word)) {
        sadScore += 1;
      }
    }
  });
  
  angryWords.forEach(word => {
    if (lowercaseText.includes(word)) {
      angryScore += 1;
      // Give more weight to stronger words
      if (['hate', 'furious', 'rage', 'outrageous', 'unacceptable'].includes(word)) {
        angryScore += 1;
      }
    }
  });
  
  surprisedWords.forEach(word => {
    if (lowercaseText.includes(word)) {
      surprisedScore += 1;
      // Give more weight to stronger words
      if (['wow', 'unbelievable', 'incredible', 'astounded', 'speechless'].includes(word)) {
        surprisedScore += 1;
      }
    }
  });
  
  // Check for emoticons and emoji
  if (/[:;][\-']?[\)D]|😊|😀|😁|😄|🙂|😍|❤️|👍/.test(lowercaseText)) happyScore += 2;
  if (/[:;][\-']?[\(]|😢|😭|😔|😞|☹️|💔/.test(lowercaseText)) sadScore += 2;
  if (/>[:\-]?[\(]|😠|😡|🤬|👎|😤/.test(lowercaseText)) angryScore += 2;
  if (/[:;][\-']?[oO]|😮|😲|😱|😵|🤯/.test(lowercaseText)) surprisedScore += 2;
  
  // Account for negations (e.g., "not happy")
  if (/\b(not|no|never|isn't|aren't|wasn't|weren't|don't|doesn't|didn't)\b/.test(lowercaseText)) {
    if (happyScore > 0) {
      happyScore--;
      sadScore++;
    }
  }
  
  // Check which emotion scored highest
  const scores = [
    { emotion: 'happy', score: happyScore },
    { emotion: 'sad', score: sadScore },
    { emotion: 'angry', score: angryScore },
    { emotion: 'surprised', score: surprisedScore },
  ];
  
  // Sort emotions by score
  scores.sort((a, b) => b.score - a.score);
  
  // Return the emotion with highest score, or neutral if no strong emotions
  return (scores[0].score > 0) ? scores[0].emotion as Emotion : 'neutral';
};

// Generate AI response based on user input and emotion
export const generateAIResponse = (
  userMessage: string, 
  userEmotion: Emotion
): { text: string; emotion: Emotion } => {
  const lowerMessage = userMessage.toLowerCase();
  
  // Check for greetings
  if (
    lowerMessage.includes('hello') || 
    lowerMessage.includes('hi') || 
    lowerMessage.includes('hey') ||
    lowerMessage.includes('greetings')
  ) {
    return {
      text: "Hello there! It's great to see you. How are you feeling today?",
      emotion: 'happy'
    };
  }
  
  // Check for questions about the AI
  if (
    lowerMessage.includes('who are you') || 
    lowerMessage.includes('what are you') ||
    lowerMessage.includes('your name')
  ) {
    return {
      text: "I'm your AI friend, designed to understand your emotions and chat with you. I can see and hear you to provide a more empathetic conversation experience.",
      emotion: 'neutral'
    };
  }
  
  // Check for how are you questions
  if (
    lowerMessage.includes('how are you') || 
    lowerMessage.includes('how do you feel') ||
    lowerMessage.includes('are you ok')
  ) {
    return {
      text: "I'm doing well, thank you for asking! More importantly, how are you feeling right now?",
      emotion: 'happy'
    };
  }
  
  // Check for thank you
  if (
    lowerMessage.includes('thank you') || 
    lowerMessage.includes('thanks') ||
    lowerMessage.includes('appreciate')
  ) {
    return {
      text: "You're very welcome! I'm always here to chat whenever you need me.",
      emotion: 'happy'
    };
  }
  
  // Dynamic responses based on emotion
  const responses = {
    happy: [
      "I'm so glad to hear you're feeling good! That positive energy is contagious.",
      "Your happiness makes me happy too! What's contributing to your good mood today?",
      "It's wonderful to see you in such high spirits! I hope this feeling stays with you.",
      "You seem really cheerful today! Would you like to share what's making you happy?",
      "Your smile brightens my day! Let's keep this positive energy going!"
    ],
    sad: [
      "I'm sorry you're feeling down. Remember that it's okay to not be okay sometimes.",
      "I hear that you're feeling sad. Would you like to talk about what's on your mind?",
      "It sounds like things are difficult right now. I'm here to listen whenever you need.",
      "I notice you seem a bit down today. Sometimes talking about it can help lighten the burden.",
      "Your feelings are valid, and it's okay to feel sad. Is there anything I can do to support you?"
    ],
    angry: [
      "I can sense you're frustrated. Sometimes taking a deep breath can help center your thoughts.",
      "I understand you're feeling angry. Would it help to talk through what happened?",
      "Your feelings are valid. Sometimes expressing anger is a necessary step toward resolution.",
      "It seems like something's bothering you. Would you like to share what happened?",
      "I'm here to listen without judgment. Feel free to express your frustration."
    ],
    surprised: [
      "That does sound surprising! I'd love to hear more about what caught you off guard.",
      "Unexpected things can certainly shake us up! How are you processing this surprise?",
      "Life's full of surprises, isn't it? I'm all ears if you want to share more details.",
      "Wow, I can see that really surprised you! Would you like to talk more about it?",
      "Sometimes surprises can be a lot to take in. How are you feeling about it now?"
    ],
    neutral: [
      "I appreciate you sharing your thoughts with me. How else has your day been going?",
      "Thank you for telling me. Is there anything specific you'd like to discuss today?",
      "I'm here to chat about whatever's on your mind. What would you like to explore next?",
      "It's nice to have this conversation with you. What else would you like to talk about?",
      "I'm really enjoying our chat. Is there anything else you'd like to share or ask me about?"
    ]
  };

  // Choose a more contextual response first, otherwise fall back to emotion-based response
  if (lowerMessage.includes('day') && lowerMessage.includes('been')) {
    return {
      text: "My day has been productive! I've been looking forward to our conversation. How about yours? Any highlights or challenges?",
      emotion: 'happy'
    };
  }
  
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
