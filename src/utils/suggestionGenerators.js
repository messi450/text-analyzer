/**
 * Writing Suggestion Generators
 * Functions to detect and suggest improvements for text
 */

/**
 * Synonyms dictionary for word replacement suggestions
 */
export const SYNONYMS = {
    'very': ['extremely', 'highly', 'remarkably', 'particularly'],
    'really': ['truly', 'genuinely', 'certainly', 'definitely'],
    'just': ['simply', 'merely', 'only', ''],
    'actually': ['in fact', 'indeed', 'truly', ''],
    'basically': ['essentially', 'fundamentally', 'primarily', ''],
    'literally': ['actually', 'truly', 'precisely', ''],
    'thing': ['item', 'object', 'matter', 'aspect'],
    'things': ['items', 'aspects', 'elements', 'factors'],
    'good': ['excellent', 'great', 'effective', 'beneficial'],
    'bad': ['poor', 'negative', 'harmful', 'detrimental'],
    'big': ['large', 'significant', 'substantial', 'considerable'],
    'small': ['minor', 'slight', 'modest', 'limited'],
    'get': ['obtain', 'acquire', 'receive', 'achieve'],
    'got': ['obtained', 'acquired', 'received', 'achieved'],
    'make': ['create', 'produce', 'develop', 'establish'],
    'made': ['created', 'produced', 'developed', 'established'],
};

/**
 * Words that are good break points for long sentences
 */
const BREAK_WORDS = ['and', 'but', 'or', 'so', 'because', 'which', 'that', 'while', 'although'];

/**
 * Check for long sentences and suggest splits
 * @param {string} text - Text to analyze
 * @returns {Array<Object>} Array of suggestion objects
 */
export function checkLongSentences(text) {
    if (!text) return [];
    
    const suggestions = [];
    const sentenceMatches = [...text.matchAll(/[^.!?]+[.!?]+/g)];

    sentenceMatches.forEach((match) => {
        const sentence = match[0];
        const words = sentence.split(/\s+/).filter(w => w.length > 0);
        
        if (words.length > 25) {
            const midPoint = Math.floor(words.length / 2);
            let breakIndex = midPoint;

            // Find a good break point near the middle
            for (let j = midPoint - 5; j <= midPoint + 5 && j < words.length; j++) {
                if (j > 0 && BREAK_WORDS.includes(words[j].toLowerCase().replace(/,/g, ''))) {
                    breakIndex = j;
                    break;
                }
            }

            const firstPart = words.slice(0, breakIndex).join(' ');
            const secondPart = words.slice(breakIndex).join(' ');
            const suggestedText =
                firstPart.trim().replace(/,?\s*$/, '.') + ' ' +
                secondPart.trim().charAt(0).toUpperCase() + secondPart.trim().slice(1);

            suggestions.push({
                id: `long-${match.index}`,
                type: 'clarity',
                severity: 'medium',
                title: 'Long sentence detected',
                description: `This sentence has ${words.length} words. Click to split into shorter sentences.`,
                original: sentence.trim(),
                suggested: suggestedText,
                start: match.index,
                end: match.index + sentence.length,
            });
        }
    });

    return suggestions;
}

/**
 * Check for passive voice usage
 * @param {string} text - Text to analyze
 * @returns {Array<Object>} Array of suggestion objects
 */
export function checkPassiveVoice(text) {
    if (!text) return [];
    
    const suggestions = [];
    const passivePatterns = [
        { regex: /\b(was|were)\s+(\w+ed)\b/gi },
        { regex: /\b(is|are)\s+being\s+(\w+ed)\b/gi },
        { regex: /\b(has|have)\s+been\s+(\w+ed)\b/gi },
    ];

    passivePatterns.forEach(pattern => {
        let match;
        while ((match = pattern.regex.exec(text)) !== null) {
            suggestions.push({
                id: `passive-${match.index}`,
                type: 'style',
                severity: 'low',
                title: 'Possible passive voice',
                description: 'Active voice is often clearer. Click to see suggestion.',
                original: match[0],
                suggested: `[active form of "${match[0]}"]`,
                start: match.index,
                end: match.index + match[0].length,
            });
        }
    });

    return suggestions;
}

/**
 * Check for filler words
 * @param {string} text - Text to analyze
 * @returns {Array<Object>} Array of suggestion objects
 */
export function checkFillerWords(text) {
    if (!text) return [];
    
    const suggestions = [];
    const fillers = ['very', 'really', 'just', 'actually', 'basically', 'literally'];

    fillers.forEach(filler => {
        const regex = new RegExp(`\\b${filler}\\b`, 'gi');
        let match;

        while ((match = regex.exec(text)) !== null) {
            const synonyms = SYNONYMS[filler.toLowerCase()] || [''];
            const suggested = synonyms[0] || '';

            suggestions.push({
                id: `filler-${match.index}`,
                type: 'style',
                severity: 'low',
                title: `Filler word: "${filler}"`,
                description: suggested
                    ? `Replace with "${suggested}" for stronger writing.`
                    : 'This word weakens your writing. Click to remove it.',
                original: match[0],
                suggested: suggested,
                start: match.index,
                end: match.index + match[0].length,
            });
        }
    });

    return suggestions;
}

/**
 * Check for weak words that could be replaced
 * @param {string} text - Text to analyze
 * @returns {Array<Object>} Array of suggestion objects
 */
export function checkWeakWords(text) {
    if (!text) return [];
    
    const suggestions = [];
    const weakWords = ['thing', 'things', 'good', 'bad', 'big', 'small', 'get', 'got', 'make', 'made'];

    weakWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        let match;

        while ((match = regex.exec(text)) !== null) {
            const synonyms = SYNONYMS[word.toLowerCase()];
            if (synonyms && synonyms.length > 0) {
                let suggested = synonyms[0];

                // Preserve capitalization
                if (match[0][0] === match[0][0].toUpperCase()) {
                    suggested = suggested.charAt(0).toUpperCase() + suggested.slice(1);
                }

                suggestions.push({
                    id: `weak-${match.index}`,
                    type: 'style',
                    severity: 'low',
                    title: `Weak word: "${match[0]}"`,
                    description: `Consider using "${suggested}" for more precise writing.`,
                    original: match[0],
                    suggested: suggested,
                    start: match.index,
                    end: match.index + match[0].length,
                });
            }
        }
    });

    return suggestions;
}

/**
 * Check for repeated words
 * @param {string} text - Text to analyze
 * @returns {Array<Object>} Array of suggestion objects
 */
export function checkRepeatedWords(text) {
    if (!text) return [];
    
    const suggestions = [];
    const wordPositions = {};
    const wordRegex = /\b\w{5,}\b/g;
    let match;

    while ((match = wordRegex.exec(text.toLowerCase())) !== null) {
        const word = match[0];
        if (!wordPositions[word]) wordPositions[word] = [];
        wordPositions[word].push({ index: match.index, length: match[0].length });
    }

    Object.entries(wordPositions).forEach(([word, positions]) => {
        if (positions.length >= 3 && positions.length <= 6) {
            for (let i = 1; i < positions.length; i++) {
                if (positions[i].index - positions[i - 1].index < 200) {
                    const synonyms = SYNONYMS[word] || [];
                    if (synonyms.length > 0) {
                        suggestions.push({
                            id: `repeated-${positions[i].index}`,
                            type: 'style',
                            severity: 'low',
                            title: `Repeated word: "${word}"`,
                            description: `This word appears multiple times nearby. Try "${synonyms[0]}".`,
                            original: text.slice(positions[i].index, positions[i].index + positions[i].length),
                            suggested: synonyms[0],
                            start: positions[i].index,
                            end: positions[i].index + positions[i].length,
                        });
                    }
                    break;
                }
            }
        }
    });

    return suggestions;
}

/**
 * Check for spacing issues
 * @param {string} text - Text to analyze
 * @returns {Array<Object>} Array of suggestion objects
 */
export function checkSpacing(text) {
    if (!text) return [];
    
    const suggestions = [];
    
    // Check for double spaces
    const doubleSpaceRegex = /  +/g;
    let match;
    while ((match = doubleSpaceRegex.exec(text)) !== null) {
        suggestions.push({
            id: `space-${match.index}`,
            type: 'grammar',
            severity: 'low',
            title: 'Extra spaces',
            description: 'Multiple spaces detected. Click to fix.',
            original: match[0],
            suggested: ' ',
            start: match.index,
            end: match.index + match[0].length,
        });
    }

    // Check for missing spaces after punctuation
    const missingSpaceRegex = /[.!?,;:][A-Za-z]/g;
    while ((match = missingSpaceRegex.exec(text)) !== null) {
        suggestions.push({
            id: `mspace-${match.index}`,
            type: 'grammar',
            severity: 'medium',
            title: 'Missing space after punctuation',
            description: 'Add a space after punctuation marks.',
            original: match[0],
            suggested: match[0][0] + ' ' + match[0][1],
            start: match.index,
            end: match.index + match[0].length,
        });
    }

    return suggestions;
}

/**
 * Generate all local suggestions for text
 * @param {string} text - Text to analyze
 * @param {Object} stats - Text statistics
 * @returns {Array<Object>} Array of all suggestions
 */
export function generateLocalSuggestions(text, stats) {
    if (!text || !stats || stats.totalWords === 0) return [];

    const suggestions = [
        ...checkLongSentences(text),
        ...checkPassiveVoice(text),
        ...checkFillerWords(text),
        ...checkWeakWords(text),
        ...checkRepeatedWords(text),
        ...checkSpacing(text),
    ];

    // Sort by position and limit to 20 most relevant
    return suggestions
        .sort((a, b) => (a.start || 0) - (b.start || 0))
        .slice(0, 20);
}

