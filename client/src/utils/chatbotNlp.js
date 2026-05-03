const INTENTS = [
  {
    name: 'safety',
    examples: [
      'I need emergency help',
      'I feel unsafe',
      'Call police',
      'women helpline number',
      'domestic violence support',
      'cyber crime complaint'
    ],
    response:
      "Emergency Contacts:\n\n- Women Helpline: 1091\n- Domestic Abuse: 181\n- Police: 100\n- Cyber Crime: 1930\n\nIf you are in immediate danger, call emergency services first and share your live location with a trusted contact."
  },
  {
    name: 'legal',
    examples: [
      'what are my legal rights',
      'harassment law in india',
      'how to file fir',
      'workplace sexual harassment',
      'domestic violence act details',
      'can i file zero fir'
    ],
    response:
      "Your Legal Rights:\n\n1. Zero FIR: You can file an FIR at any police station.\n2. POSH Act: Protection against workplace sexual harassment.\n3. Domestic Violence Act: Protection from physical, emotional, and economic abuse.\n\nTell me your exact situation and I can guide you to the closest relevant step."
  },
  {
    name: 'mental_health',
    examples: [
      'i feel stressed',
      'anxiety and panic',
      'i feel depressed',
      'mental health support',
      'i am feeling low',
      'coping techniques'
    ],
    response:
      "Mental Health Support:\n\n- Try slow breathing (inhale 4 sec, hold 4 sec, exhale 6 sec).\n- Use the 5-4-3-2-1 grounding technique.\n- Talk to a trusted person.\n- Vandrevala Foundation Helpline: 1860-266-2345\n\nYou do not have to handle this alone."
  },
  {
    name: 'career',
    examples: [
      'career guidance',
      'find a job',
      'financial independence',
      'learn new skills',
      'women entrepreneurship',
      'how to save money'
    ],
    response:
      "Career and Finance:\n\n- Upskill with Swayam or Google Digital Garage.\n- Explore Mahila E-Haat for business opportunities.\n- Build a monthly budget and emergency fund.\n\nIf you share your goal (job, business, or study), I can suggest a step-by-step plan."
  },
  {
    name: 'greeting',
    examples: [
      'hi',
      'hello',
      'hey there',
      'good morning',
      'good evening'
    ],
    response:
      "Hello! I am Sakhi, your NLP-powered support assistant. Ask me about safety, legal rights, mental health, or career growth."
  },
  {
    name: 'thanks',
    examples: ['thank you', 'thanks', 'thx', 'grateful'],
    response: 'You are welcome. I am here whenever you need support.'
  }
];

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'am', 'i', 'me', 'my', 'you', 'your', 'to', 'for', 'of', 'on', 'in',
  'and', 'or', 'with', 'at', 'it', 'this', 'that', 'be', 'can', 'do', 'how', 'what', 'about', 'please'
]);

function normalizeToken(token) {
  let t = token.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!t) return '';

  // Lightweight stemming rules.
  if (t.endsWith('ing') && t.length > 5) t = t.slice(0, -3);
  else if (t.endsWith('ed') && t.length > 4) t = t.slice(0, -2);
  else if (t.endsWith('es') && t.length > 4) t = t.slice(0, -2);
  else if (t.endsWith('s') && t.length > 3) t = t.slice(0, -1);

  return t;
}

function tokenize(text) {
  return text
    .split(/\s+/)
    .map(normalizeToken)
    .filter((token) => token && !STOP_WORDS.has(token));
}

function vectorize(tokens) {
  const counts = new Map();
  tokens.forEach((token) => counts.set(token, (counts.get(token) || 0) + 1));
  return counts;
}

function cosineSimilarity(vecA, vecB) {
  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (const value of vecA.values()) {
    magA += value * value;
  }
  for (const value of vecB.values()) {
    magB += value * value;
  }

  for (const [token, valueA] of vecA.entries()) {
    const valueB = vecB.get(token) || 0;
    dot += valueA * valueB;
  }

  if (!magA || !magB) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

const MODEL = INTENTS.map((intent) => {
  const intentTokens = intent.examples.flatMap((example) => tokenize(example));
  return {
    ...intent,
    vector: vectorize(intentTokens)
  };
});

function fallbackResponse() {
  return (
    "I could not confidently understand that yet.\n\n" +
    "Try asking in one of these categories:\n" +
    "- Safety and emergency\n" +
    "- Legal rights\n" +
    "- Mental health\n" +
    "- Career and financial guidance"
  );
}

export function generateNlpResponse(message) {
  const tokens = tokenize(message || '');
  const inputVector = vectorize(tokens);

  let best = { score: 0, intent: null };
  MODEL.forEach((intent) => {
    const score = cosineSimilarity(inputVector, intent.vector);
    if (score > best.score) {
      best = { score, intent };
    }
  });

  // Intent confidence threshold.
  if (!best.intent || best.score < 0.15) {
    return fallbackResponse();
  }

  return best.intent.response;
}
