// Advanced Tone Adjustment Utility - works offline with AI-powered suggestions
// Comprehensive text transformation system with multiple tone dimensions

const TONE_CATEGORIES = {
  FORMALITY: {
    0: 'very_casual',
    1: 'casual',
    2: 'neutral',
    3: 'formal',
    4: 'very_formal'
  },
  EMOTION: {
    0: 'reserved',
    1: 'neutral',
    2: 'enthusiastic',
    3: 'passionate',
    4: 'urgent'
  },
  STYLE: {
    0: 'concise',
    1: 'balanced',
    2: 'elaborate',
    3: 'persuasive',
    4: 'inspirational'
  }
};

const DOMAIN_SPECIFIC_TONES = {
  business: {
    keywords: ['profit', 'revenue', 'efficiency', 'strategy', 'market', 'client', 'stakeholder'],
    transforms: {
      'good': 'optimal',
      'bad': 'suboptimal',
      'think': 'believe',
      'want': 'seek',
      'need': 'require',
      'make': 'develop',
      'do': 'execute',
      'fix': 'resolve',
      'problem': 'challenge',
      'solution': 'approach'
    }
  },
  academic: {
    keywords: ['research', 'analysis', 'methodology', 'findings', 'conclusion', 'hypothesis', 'evidence'],
    transforms: {
      'think': 'contend',
      'believe': 'argue',
      'want': 'seek',
      'need': 'require',
      'show': 'demonstrate',
      'prove': 'establish',
      'find': 'discover',
      'see': 'observe',
      'use': 'employ',
      'work': 'function',
      'good': 'effective',
      'bad': 'ineffective'
    }
  },
  marketing: {
    keywords: ['amazing', 'revolutionary', 'exclusive', 'limited', 'transform', 'empower', 'unleash'],
    transforms: {
      'good': 'amazing',
      'great': 'exceptional',
      'nice': 'fantastic',
      'cool': 'innovative',
      'help': 'empower',
      'work': 'revolutionize',
      'use': 'leverage',
      'buy': 'invest in',
      'get': 'unlock',
      'try': 'experience'
    }
  },
  creative: {
    keywords: ['imagine', 'dream', 'inspire', 'passion', 'art', 'beauty', 'soul', 'heart'],
    transforms: {
      'good': 'beautiful',
      'bad': 'challenging',
      'think': 'dream',
      'feel': 'experience',
      'see': 'behold',
      'hear': 'listen to',
      'create': 'craft',
      'make': 'bring to life',
      'work': 'dance with',
      'live': 'thrive'
    }
  },
  technical: {
    keywords: ['algorithm', 'framework', 'architecture', 'implementation', 'optimization', 'scalability'],
    transforms: {
      'do': 'implement',
      'make': 'construct',
      'use': 'utilize',
      'work': 'function',
      'fix': 'debug',
      'good': 'robust',
      'bad': 'flawed',
      'fast': 'optimized',
      'slow': 'inefficient',
      'easy': 'streamlined',
      'hard': 'complex'
    }
  }
};

// Comprehensive transformation dictionaries for multiple tone dimensions
const TONE_TRANSFORMATIONS = {
  // Formality transformations
  formality: {
    casual_to_formal: {
      // Contractions
      "don't": "do not",
      "can't": "cannot",
      "won't": "will not",
      "isn't": "is not",
      "aren't": "are not",
      "wasn't": "was not",
      "weren't": "were not",
      "haven't": "have not",
      "hasn't": "has not",
      "hadn't": "had not",
      "doesn't": "does not",
      "didn't": "did not",
      "shouldn't": "should not",
      "wouldn't": "would not",
      "couldn't": "could not",
      "mustn't": "must not",

      // Informal words
      "guy": "person",
      "guys": "people",
      "kid": "child",
      "kids": "children",
      "stuff": "things",
      "thing": "matter",
      "things": "matters",
      "kinda": "somewhat",
      "sorta": "rather",
      "totally": "completely",
      "really": "very",
      "super": "extremely",
      "awesome": "excellent",
      "cool": "acceptable",
      "bad": "poor",
      "crap": "nonsense",
      "damn": "darn",
      "hell": "heck",
      "suck": "fail",
      "sucks": "fails",

      // Slang and colloquialisms
      "gonna": "going to",
      "wanna": "want to",
      "gotta": "have to",
      "ain't": "is not",
      "y'all": "you all",
      "ya": "you",
      "dunno": "do not know",
      "lots": "many",
      "loads": "many",
      "ton": "many",
      "tons": "many",

      // Phrasal verbs to single words
      "find out": "discover",
      "figure out": "determine",
      "work out": "resolve",
      "sort out": "organize",
      "set up": "establish",
      "carry out": "execute",
      "put off": "postpone",
      "bring up": "mention",
      "take on": "assume",
      "look into": "investigate",
      "go over": "review",
      "check out": "examine",
    },

    formal_to_casual: {
      "do not": "don't",
      "cannot": "can't",
      "will not": "won't",
      "is not": "isn't",
      "are not": "aren't",
      "was not": "wasn't",
      "were not": "weren't",
      "have not": "haven't",
      "has not": "hasn't",
      "had not": "hadn't",
      "does not": "doesn't",
      "did not": "didn't",
      "should not": "shouldn't",
      "would not": "wouldn't",
      "could not": "couldn't",
      "must not": "mustn't",

      "person": "guy",
      "people": "guys",
      "child": "kid",
      "children": "kids",
      "things": "stuff",
      "matter": "thing",
      "matters": "things",
      "somewhat": "kinda",
      "rather": "sorta",
      "completely": "totally",
      "very": "really",
      "extremely": "super",
      "excellent": "awesome",
      "acceptable": "cool",
      "poor": "bad",
      "nonsense": "crap",
      "darn": "damn",
      "heck": "hell",
      "fail": "suck",
      "fails": "sucks",

      "going to": "gonna",
      "want to": "wanna",
      "have to": "gotta",
      "you all": "y'all",
      "you": "ya",
      "do not know": "dunno",

      "discover": "find out",
      "determine": "figure out",
      "resolve": "work out",
      "organize": "sort out",
      "establish": "set up",
      "execute": "carry out",
      "postpone": "put off",
      "mention": "bring up",
      "assume": "take on",
      "investigate": "look into",
      "review": "go over",
      "examine": "check out",
    },

    // Very casual additions (for level 0)
    very_casual_additions: {
      "like": "ya know",
      "because": "cuz",
      "because": "cause",
      "about": "bout",
      "through": "thru",
      "though": "tho",
      "okay": "ok",
      "okay": "k",
      "great": "gr8",
      "before": "b4",
      "after": "afta",
      "friend": "buddy",
      "friends": "buddies",
      "really": "super",
      "very": "hella",
      "yes": "yep",
      "no": "nah",
      "and": "&",
      "for": "4",
      "to": "2",
      "you": "u",
      "your": "ur",
      "the": "da",
      "that": "dat",
      "this": "dis",
    },

    // Very formal additions (for level 4)
    very_formal_additions: {
      "I": "one",
      "you": "the reader",
      "we": "our team",
      "they": "the aforementioned parties",
      "it": "the aforementioned item",
      "this": "the present",
      "that": "the aforementioned",
      "these": "the present items",
      "those": "the aforementioned items",
      "good": "satisfactory",
      "bad": "unsatisfactory",
      "big": "substantial",
      "small": "modest",
      "make": "fabricate",
      "do": "perform",
      "get": "obtain",
      "give": "provide",
      "take": "acquire",
      "put": "place",
      "say": "state",
      "tell": "inform",
      "ask": "inquire",
      "work": "function",
      "help": "assist",
      "need": "require",
      "want": "desire",
      "like": "appreciate",
      "think": "contemplate",
      "know": "comprehend",
      "see": "observe",
      "hear": "perceive",
      "feel": "experience",
    }
  },

  // Emotional tone transformations
  emotion: {
    reserved_to_enthusiastic: {
      "okay": "fantastic",
      "good": "amazing",
      "fine": "wonderful",
      "nice": "excellent",
      "interesting": "fascinating",
      "like": "love",
      "enjoy": "adore",
      "happy": "thrilled",
      "satisfied": "delighted",
      "pleased": "ecstatic",
      "surprised": "amazed",
      "impressed": "blown away",
      "excited": "overjoyed",
      "interested": "passionate",
    },

    enthusiastic_to_reserved: {
      "amazing": "good",
      "fantastic": "okay",
      "wonderful": "fine",
      "excellent": "nice",
      "fascinating": "interesting",
      "love": "like",
      "adore": "enjoy",
      "thrilled": "happy",
      "delighted": "satisfied",
      "ecstatic": "pleased",
      "amazed": "surprised",
      "blown away": "impressed",
      "overjoyed": "excited",
      "passionate": "interested",
    },

    neutral_to_passionate: {
      "think": "believe passionately",
      "feel": "burn with passion",
      "want": "yearn for",
      "need": "crave",
      "like": "adore",
      "love": "worship",
      "care": "cherish deeply",
      "matter": "matter immensely",
      "important": "vitally important",
      "significant": "profoundly significant",
    },

    neutral_to_urgent: {
      "should": "must immediately",
      "could": "needs to urgently",
      "might": "absolutely must",
      "maybe": "definitely should",
      "perhaps": "without question",
      "possibly": "certainly",
      "later": "right now",
      "soon": "immediately",
      "eventually": "at once",
    }
  },

  // Style transformations
  style: {
    concise_to_elaborate: {
      "is": "represents",
      "has": "possesses",
      "does": "accomplishes",
      "makes": "creates",
      "shows": "demonstrates",
      "gives": "provides",
      "takes": "requires",
      "gets": "obtains",
      "sets": "establishes",
      "brings": "introduces",
      "helps": "facilitates",
      "works": "operates",
      "runs": "functions",
      "starts": "commences",
      "ends": "concludes",
      "changes": "transforms",
      "improves": "enhances",
      "fixes": "resolves",
    },

    elaborate_to_concise: {
      "represents": "is",
      "possesses": "has",
      "accomplishes": "does",
      "creates": "makes",
      "demonstrates": "shows",
      "provides": "gives",
      "requires": "takes",
      "obtains": "gets",
      "establishes": "sets",
      "introduces": "brings",
      "facilitates": "helps",
      "operates": "works",
      "functions": "runs",
      "commences": "starts",
      "concludes": "ends",
      "transforms": "changes",
      "enhances": "improves",
      "resolves": "fixes",
    },

    neutral_to_persuasive: {
      "think": "believe",
      "consider": "recognize",
      "know": "understand",
      "see": "realize",
      "find": "discover",
      "good": "powerful",
      "better": "superior",
      "best": "ultimate",
      "help": "empower",
      "work": "succeed",
      "result": "achievement",
      "outcome": "breakthrough",
    },

    neutral_to_inspirational: {
      "do": "achieve",
      "make": "create",
      "build": "forge",
      "create": "bring to life",
      "help": "inspire",
      "change": "transform",
      "grow": "evolve",
      "learn": "discover",
      "find": "uncover",
      "see": "envision",
      "dream": "aspire",
      "hope": "believe",
      "want": "desire",
      "need": "yearn",
    }
  }
};

// Enhanced sentence structure and rhetorical transformations
const SENTENCE_TRANSFORMS = {
  formality: {
    casual_to_formal: {
      patterns: [
        { find: /^(.+)\. (.+)\.$/, replace: "$1. Furthermore, $2." },
        { find: /^(.+), (.+)\.$/, replace: "$1. Additionally, $2." },
        { find: /^(.+)\? (.+)\.$/, replace: "$1? Moreover, $2." },
      ],
      capitalize: true,
      addTransitions: true,
    },

    formal_to_casual: {
      patterns: [
        { find: /\b(furthermore|moreover|additionally|consequently|therefore|hence|thus|accordingly)\b/gi, replace: "and" },
        { find: /\b(nevertheless|however|notwithstanding)\b/gi, replace: "but" },
        { find: /\b(therefore|consequently|hence|thus)\b/gi, replace: "so" },
        { find: /\b(moreover|furthermore|additionally)\b/gi, replace: "also" },
      ],
    }
  },

  emotion: {
    neutral_to_enthusiastic: {
      patterns: [
        { find: /\b(good|nice|fine)\b/gi, replace: (match) => {
          const options = { good: "amazing", nice: "fantastic", fine: "wonderful" };
          return options[match.toLowerCase()] || match;
        }},
        { find: /\b(I think|I believe|I feel)\b/gi, replace: "I'm excited that" },
        { find: /\b(interested in)\b/gi, replace: "passionate about" },
      ],
      addExclamation: true,
    },

    neutral_to_passionate: {
      patterns: [
        { find: /\b(I think|I believe)\b/gi, replace: "I passionately believe" },
        { find: /\b(important|significant)\b/gi, replace: (match) => match + " beyond measure" },
        { find: /\b(care about|value)\b/gi, replace: "cherish deeply" },
      ],
      intensify: true,
    },

    neutral_to_urgent: {
      patterns: [
        { find: /\b(should|could|might)\b/gi, replace: "must" },
        { find: /\b(soon|later|eventually)\b/gi, replace: "immediately" },
        { find: /\b(need to|have to)\b/gi, replace: "absolutely must" },
      ],
      addUrgency: true,
    }
  },

  style: {
    concise_to_elaborate: {
      patterns: [
        { find: /\b(is|are|was|were)\b\s+(\w+)/gi, replace: "$1 $2 and represents" },
        { find: /\b(has|have|had)\b\s+(\w+)/gi, replace: "$1 $2 and possesses" },
        { find: /\b(shows|show|showed)\b\s+(\w+)/gi, replace: "$1 $2 and demonstrates" },
      ],
      expand: true,
    },

    neutral_to_persuasive: {
      patterns: [
        { find: /\b(good|better|best)\b/gi, replace: (match) => {
          const persuasive = { good: "powerful", better: "superior", best: "ultimate" };
          return persuasive[match.toLowerCase()] || match;
        }},
        { find: /\b(think|believe)\b/gi, replace: "know from experience" },
        { find: /\b(help|helps|helped)\b/gi, replace: "empowers" },
      ],
      persuasivePhrases: true,
    },

    neutral_to_inspirational: {
      patterns: [
        { find: /\b(do|make|create)\b/gi, replace: "achieve" },
        { find: /\b(change|improve)\b/gi, replace: "transform" },
        { find: /\b(dream|hope|want)\b/gi, replace: "aspire" },
        { find: /\b(can|could|will)\b/gi, replace: "dare to" },
      ],
      inspirational: true,
    }
  }
};

// AI-powered suggestion patterns
const AI_SUGGESTIONS = {
  formality: {
    very_casual: {
      suggestions: [
        "Consider using full words instead of abbreviations",
        "Expand contractions for a more professional tone",
        "Use complete sentences and proper grammar",
        "Replace slang with standard vocabulary",
      ],
      examples: [
        { from: "u gonna b there?", to: "Will you be there?" },
        { from: "that's gr8 stuff", to: "That's excellent work" },
      ]
    },
    very_formal: {
      suggestions: [
        "Use passive voice where appropriate for academic tone",
        "Employ sophisticated vocabulary and complex sentence structures",
        "Include transitional phrases for better flow",
        "Use formal salutations and closings",
      ],
      examples: [
        { from: "I think this is good", to: "One contends that this represents a satisfactory outcome" },
        { from: "We need to fix this", to: "It is imperative that we address this matter forthwith" },
      ]
    }
  },

  emotion: {
    enthusiastic: {
      suggestions: [
        "Use exclamation points to show excitement",
        "Include positive adjectives and adverbs",
        "Express genuine enthusiasm and energy",
        "Use words that convey passion and interest",
      ],
      examples: [
        { from: "The project is going well", to: "The project is going amazingly well!" },
        { from: "I'm interested in this", to: "I'm absolutely thrilled about this!" },
      ]
    },
    passionate: {
      suggestions: [
        "Use strong emotional language",
        "Express deep conviction and feeling",
        "Include personal investment and commitment",
        "Use words that show intensity and dedication",
      ],
      examples: [
        { from: "I care about this cause", to: "This cause burns in my soul with unyielding passion" },
        { from: "This matters to me", to: "This profoundly matters to the very core of my being" },
      ]
    },
    urgent: {
      suggestions: [
        "Use time-sensitive language",
        "Emphasize immediate action and consequences",
        "Create a sense of urgency and importance",
        "Use imperative language and direct calls to action",
      ],
      examples: [
        { from: "We should do this soon", to: "We must act on this immediately!" },
        { from: "This needs attention", to: "This demands our urgent attention right now!" },
      ]
    }
  },

  style: {
    persuasive: {
      suggestions: [
        "Use rhetorical questions to engage readers",
        "Include social proof and testimonials",
        "Highlight benefits over features",
        "Use action-oriented language",
        "Address potential objections",
      ],
      examples: [
        { from: "This product works well", to: "Imagine transforming your workflow with this powerful solution!" },
        { from: "Buy our service", to: "Join thousands who've revolutionized their productivity" },
      ]
    },
    inspirational: {
      suggestions: [
        "Use aspirational and visionary language",
        "Include metaphors and vivid imagery",
        "Focus on transformation and growth",
        "Use words that evoke emotion and possibility",
        "Create a sense of journey and achievement",
      ],
      examples: [
        { from: "Start your journey", to: "Embark on an epic quest of self-discovery and limitless potential!" },
        { from: "You can succeed", to: "Rise above limitations and soar to heights you never imagined possible!" },
      ]
    }
  }
};

// Tone detection utility
export function detectTone(text) {
  if (!text || text.trim().length === 0) return { formality: 2, emotion: 1, style: 1, confidence: 0 };

  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

  let formalityScore = 0;
  let emotionScore = 0;
  let styleScore = 0;

  // Formality indicators
  const formalWords = ['therefore', 'moreover', 'consequently', 'furthermore', 'accordingly', 'henceforth', 'notwithstanding'];
  const casualWords = ['gonna', 'wanna', 'kinda', 'sorta', 'ya', 'ain\'t', 'dunno', 'cuz', 'thru'];
  const contractions = ['don\'t', 'can\'t', 'won\'t', 'isn\'t', 'aren\'t', 'wasn\'t', 'haven\'t'];

  formalityScore += words.filter(w => formalWords.includes(w)).length * 2;
  formalityScore -= words.filter(w => casualWords.includes(w)).length * 1.5;
  formalityScore -= words.filter(w => contractions.some(c => w.includes(c.replace(/'/g, '')))).length * 0.5;

  // Emotion indicators
  const enthusiasticWords = ['amazing', 'fantastic', 'wonderful', 'thrilled', 'excited', 'passionate', 'love', 'adore'];
  const reservedWords = ['adequate', 'sufficient', 'acceptable', 'satisfactory', 'reasonable'];
  const urgentWords = ['immediately', 'urgently', 'critical', 'crucial', 'essential', 'imperative', 'now'];

  emotionScore += words.filter(w => enthusiasticWords.includes(w)).length * 2;
  emotionScore += words.filter(w => urgentWords.includes(w)).length * 1.5;
  emotionScore -= words.filter(w => reservedWords.includes(w)).length * 0.5;

  // Style indicators
  const persuasiveWords = ['imagine', 'transform', 'revolutionize', 'powerful', 'ultimate', 'superior', 'empower'];
  const inspirationalWords = ['aspire', 'dream', 'achieve', 'evolve', 'inspire', 'vision', 'journey'];
  const conciseIndicators = sentences.filter(s => s.split(/\s+/).length <= 8).length;

  styleScore += words.filter(w => persuasiveWords.includes(w)).length * 1.5;
  styleScore += words.filter(w => inspirationalWords.includes(w)).length * 1.5;
  styleScore -= conciseIndicators * 0.3;

  // Normalize scores to 0-4 range
  const normalizeScore = (score, maxPossible) => Math.min(4, Math.max(0, 2 + (score / Math.max(maxPossible, 1)) * 2));

  const formality = normalizeScore(formalityScore, words.length * 0.1);
  const emotion = normalizeScore(emotionScore, words.length * 0.05);
  const style = normalizeScore(styleScore, words.length * 0.03);

  const confidence = Math.min(1, (words.length > 50 ? 0.8 : words.length > 20 ? 0.6 : 0.4));

  return { formality, emotion, style, confidence };
}

// Enhanced word transformation with context awareness
function applyWordTransformations(text, transformations, context = {}) {
  let result = text;

  // Sort transformations by length (longest first) to handle overlapping matches
  const sortedTransforms = Object.entries(transformations).sort((a, b) => b[0].length - a[0].length);

  sortedTransforms.forEach(([from, to]) => {
    // Use word boundaries to avoid partial matches
    const escapedFrom = from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedFrom}\\b`, 'gi');

    result = result.replace(regex, (match) => {
      // Apply context-aware transformations
      if (typeof to === 'function') {
        return to(match, context);
      }
      return to;
    });
  });

  return result;
}

// Enhanced sentence transformation with rhetorical devices
function applySentenceTransformations(text, transforms, category, level) {
  let result = text;

  if (transforms.patterns) {
    transforms.patterns.forEach(pattern => {
      result = result.replace(pattern.find, pattern.replace);
    });
  }

  if (transforms.capitalize) {
    // Capitalize first word of each sentence
    result = result.replace(/(?:^|\. )\s*([a-z])/g, (match, letter) => letter.toUpperCase());
  }

  // Apply category-specific enhancements
  if (category === 'emotion' && level >= 3) {
    if (transforms.addExclamation) {
      result = result.replace(/([.!?])$/, '!$1');
    }
    if (transforms.intensify) {
      result = result.replace(/\b(very|really|so)\s+(\w+)/gi, (match, intensifier, word) => {
        return `${intensifier} deeply ${word}`;
      });
    }
    if (transforms.addUrgency) {
      result = result.replace(/\b(should|could|might)\b/gi, 'must');
    }
  }

  if (category === 'style' && level >= 3) {
    if (transforms.expand) {
      result = result.replace(/(\w+)\s+(is|are|was|were)/gi, '$1 $2 and represents');
    }
    if (transforms.persuasivePhrases) {
      const persuasiveStarts = ['Imagine', 'Picture this', 'Think about', 'Consider'];
      if (Math.random() < 0.3) { // 30% chance to add persuasive opening
        const randomStart = persuasiveStarts[Math.floor(Math.random() * persuasiveStarts.length)];
        result = result.replace(/^(\w)/, `${randomStart}: $1`);
      }
    }
    if (transforms.inspirational) {
      result = result.replace(/\b(can|will|shall)\b/gi, 'dare to');
    }
  }

  return result;
}

// AI-powered suggestion generator
export function generateAISuggestions(text, category, targetLevel, currentTone = null) {
  const suggestions = [];
  const words = text.toLowerCase().split(/\s+/);

  // Get current tone if not provided
  const detectedTone = currentTone || detectTone(text);

  // Category-specific suggestions
  if (AI_SUGGESTIONS[category] && AI_SUGGESTIONS[category][TONE_CATEGORIES[category.toUpperCase()][targetLevel]]) {
    const categorySuggestions = AI_SUGGESTIONS[category][TONE_CATEGORIES[category.toUpperCase()][targetLevel]];

    // Add general suggestions
    suggestions.push(...categorySuggestions.suggestions.slice(0, 2));

    // Add contextual examples
    const relevantExamples = categorySuggestions.examples.filter(example => {
      const exampleWords = example.from.toLowerCase().split(/\s+/);
      return exampleWords.some(word => words.includes(word) || words.some(w => w.includes(word)));
    });

    if (relevantExamples.length > 0) {
      suggestions.push(`Example transformation: "${relevantExamples[0].from}" → "${relevantExamples[0].to}"`);
    }
  }

  // Context-aware suggestions
  if (category === 'formality') {
    if (targetLevel >= 3 && detectedTone.formality < 2) {
      suggestions.push("Consider using more sophisticated vocabulary and complex sentence structures");
    }
    if (targetLevel <= 1 && detectedTone.formality > 2) {
      suggestions.push("Try using contractions and simpler language to create a more conversational tone");
    }
  }

  if (category === 'emotion') {
    if (targetLevel >= 3) {
      suggestions.push("Use sensory language and vivid descriptions to heighten emotional impact");
      suggestions.push("Consider the emotional journey of your reader");
    }
  }

  if (category === 'style') {
    if (targetLevel >= 3) {
      suggestions.push("Focus on benefits and outcomes rather than features");
      suggestions.push("Use storytelling techniques to engage your audience");
    }
  }

  // Domain detection suggestions
  const detectedDomain = detectDomain(text);
  if (detectedDomain && DOMAIN_SPECIFIC_TONES[detectedDomain]) {
    suggestions.push(`Detected ${detectedDomain} context - consider using domain-specific terminology`);
  }

  return suggestions.slice(0, 4); // Limit to 4 suggestions
}

// Domain detection utility
function detectDomain(text) {
  const words = text.toLowerCase().split(/\s+/);
  const domainScores = {};

  Object.entries(DOMAIN_SPECIFIC_TONES).forEach(([domain, config]) => {
    const keywordMatches = config.keywords.filter(keyword =>
      words.some(word => word.includes(keyword) || keyword.includes(word))
    ).length;

    if (keywordMatches > 0) {
      domainScores[domain] = keywordMatches;
    }
  });

  const topDomain = Object.entries(domainScores).sort((a, b) => b[1] - a[1])[0];
  return topDomain ? topDomain[0] : null;
}

// Enhanced tone adjustment with multiple dimensions
function adjustToneByCategory(text, category, fromLevel, toLevel, context = {}) {
  const categoryKey = category.toUpperCase();
  if (!TONE_CATEGORIES[categoryKey]) return text;

  const toneNames = Object.values(TONE_CATEGORIES[categoryKey]);
  const fromTone = toneNames[fromLevel];
  const toTone = toneNames[toLevel];

  if (fromLevel === toLevel) return text;

  let result = text;
  const transforms = TONE_TRANSFORMATIONS[category];

  // Apply domain-specific transformations if detected
  const detectedDomain = detectDomain(text);
  if (detectedDomain && DOMAIN_SPECIFIC_TONES[detectedDomain]) {
    result = applyWordTransformations(result, DOMAIN_SPECIFIC_TONES[detectedDomain].transforms, context);
  }

  // Apply category-specific transformations
  if (transforms) {
    if (category === 'formality') {
      // Handle formality transformations
      if (toLevel > fromLevel) {
        // Making more formal
        if (fromLevel <= 1 && toLevel >= 2) {
          result = applyWordTransformations(result, transforms.casual_to_formal, context);
          result = applySentenceTransformations(result, SENTENCE_TRANSFORMS.formality.casual_to_formal, category, toLevel);
        }
        if (toLevel >= 4) {
          result = applyWordTransformations(result, transforms.very_formal_additions, context);
        }
      } else {
        // Making less formal
        if (fromLevel >= 3 && toLevel <= 2) {
          result = applyWordTransformations(result, transforms.formal_to_casual, context);
          result = applySentenceTransformations(result, SENTENCE_TRANSFORMS.formality.formal_to_casual, category, toLevel);
        }
        if (toLevel <= 0) {
          result = applyWordTransformations(result, transforms.very_casual_additions, context);
        }
      }
    } else if (category === 'emotion') {
      // Handle emotion transformations
      let emotionTransforms = null;
      let sentenceTransforms = null;

      if (toLevel >= 2 && toLevel <= 3) {
        // Enthusiastic/Passionate - use reserved_to_enthusiastic
        emotionTransforms = transforms.reserved_to_enthusiastic;
        sentenceTransforms = SENTENCE_TRANSFORMS.emotion.neutral_to_enthusiastic;
      } else if (toLevel === 4) {
        // Urgent - use neutral_to_urgent
        sentenceTransforms = SENTENCE_TRANSFORMS.emotion.neutral_to_urgent;
      } else if (toLevel === 3) {
        // Passionate - use neutral_to_passionate
        sentenceTransforms = SENTENCE_TRANSFORMS.emotion.neutral_to_passionate;
      }

      if (emotionTransforms) {
        result = applyWordTransformations(result, emotionTransforms, context);
      }
      if (sentenceTransforms) {
        result = applySentenceTransformations(result, sentenceTransforms, category, toLevel);
      }
    } else if (category === 'style') {
      // Handle style transformations
      let styleTransforms = transforms[`neutral_to_${toTone}`];
      if (!styleTransforms && toLevel > 1) {
        // Apply general style improvements
        styleTransforms = transforms.neutral_to_elaborate || {};
      }
      if (styleTransforms) {
        result = applyWordTransformations(result, styleTransforms, context);
      }
      const sentenceTransforms = SENTENCE_TRANSFORMS.style[`neutral_to_${toTone}`];
      if (sentenceTransforms) {
        result = applySentenceTransformations(result, sentenceTransforms, category, toLevel);
      }
    }
  }

  return result;
}

// Enhanced main functions for backward compatibility and new features
export function adjustTextTone(text, fromToneLevel, toToneLevel, category = 'formality') {
  if (!text || text.trim().length === 0) return text;

  return adjustToneByCategory(text, category, fromToneLevel, toToneLevel);
}

// Main export function that matches the expected interface (defaults to formality)
export function adjustTone(text, targetToneLevel, category = 'formality') {
  // Detect current tone and adjust accordingly
  const currentTone = detectTone(text);
  const currentLevel = Math.round(currentTone[category] || 2);

  return adjustTextTone(text, currentLevel, targetToneLevel, category);
}

// Advanced tone adjustment with multiple dimensions
export function adjustToneAdvanced(text, adjustments) {
  /*
  adjustments format:
  {
    formality: 3,    // 0-4 scale
    emotion: 2,      // 0-4 scale
    style: 1,        // 0-4 scale
    domain: 'business' // optional domain-specific adjustments
  }
  */

  if (!text || text.trim().length === 0) return text;

  let result = text;
  const currentTone = detectTone(text);

  // Apply each dimension
  Object.entries(adjustments).forEach(([category, targetLevel]) => {
    if (category === 'domain' && DOMAIN_SPECIFIC_TONES[adjustments.domain]) {
      result = applyWordTransformations(result, DOMAIN_SPECIFIC_TONES[adjustments.domain].transforms);
    } else if (TONE_CATEGORIES[category.toUpperCase()]) {
      const currentLevel = Math.round(currentTone[category] || 2);
      result = adjustToneByCategory(result, category, currentLevel, targetLevel);
    }
  });

  return result;
}

// Get available tone options
export function getToneOptions() {
  return {
    categories: {
      formality: {
        name: 'Formality',
        levels: TONE_CATEGORIES.FORMALITY,
        descriptions: {
          0: 'Very casual, conversational language',
          1: 'Casual, friendly tone',
          2: 'Neutral, balanced language',
          3: 'Formal, professional tone',
          4: 'Very formal, academic style'
        }
      },
      emotion: {
        name: 'Emotion',
        levels: TONE_CATEGORIES.EMOTION,
        descriptions: {
          0: 'Reserved, professional distance',
          1: 'Neutral emotional tone',
          2: 'Enthusiastic and positive',
          3: 'Passionate and intense',
          4: 'Urgent and compelling'
        }
      },
      style: {
        name: 'Style',
        levels: TONE_CATEGORIES.STYLE,
        descriptions: {
          0: 'Concise and direct',
          1: 'Balanced approach',
          2: 'Elaborate and detailed',
          3: 'Persuasive and convincing',
          4: 'Inspirational and motivational'
        }
      }
    },
    domains: Object.keys(DOMAIN_SPECIFIC_TONES)
  };
}
