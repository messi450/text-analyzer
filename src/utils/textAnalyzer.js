/**
 * Text Analysis Utilities
 * Core business logic for text analysis operations
 */

/**
 * TextAnalyzer class for analyzing text statistics
 */
export class TextAnalyzer {
    constructor(text) {
        this.text = text || '';
    }

    /**
     * Count total characters including spaces
     * @returns {number} Total character count
     */
    countTotalChars() {
        return this.text.length;
    }

    /**
     * Count characters excluding spaces
     * @returns {number} Character count without spaces
     */
    countCharsNoSpaces() {
        return this.text.replace(/\s/g, '').length;
    }

    /**
     * Count words in the text
     * @returns {number} Word count
     */
    countWords() {
        if (!this.text.trim()) return 0;
        return this.text
            .replace(/[.,!?;:'"()\-\[\]{}]/g, '')
            .split(/\s+/)
            .filter(w => w.length > 0).length;
    }

    /**
     * Count sentences in the text
     * @returns {number} Sentence count
     */
    countSentences() {
        if (!this.text.trim()) return 0;
        return this.text
            .split(/[.!?]+/)
            .filter(s => s.trim().length > 0).length;
    }

    /**
     * Count paragraphs in the text
     * @returns {number} Paragraph count
     */
    countParagraphs() {
        if (!this.text.trim()) return 0;
        const paragraphs = this.text
            .split(/\n\s*\n/)
            .filter(p => p.trim().length > 0);
        return Math.max(paragraphs.length, this.text.trim().length > 0 ? 1 : 0);
    }

    /**
     * Get word frequency map
     * @returns {Object<string, number>} Word frequency object
     */
    getWordFrequency() {
        if (!this.text.trim()) return {};
        
        const words = this.text
            .toLowerCase()
            .replace(/[.,!?;:'"()\-\[\]{}]/g, '')
            .split(/\s+/)
            .filter(w => w.length > 0);

        return words.reduce((freq, word) => {
            freq[word] = (freq[word] || 0) + 1;
            return freq;
        }, {});
    }

    /**
     * Get unique word count
     * @returns {number} Number of unique words
     */
    getUniqueWordCount() {
        return Object.keys(this.getWordFrequency()).length;
    }

    /**
     * Get all statistics
     * @returns {Object} Complete statistics object
     */
    getAllStats() {
        return {
            totalChars: this.countTotalChars(),
            totalCharsNoSpaces: this.countCharsNoSpaces(),
            totalWords: this.countWords(),
            totalSentences: this.countSentences(),
            totalParagraphs: this.countParagraphs(),
            uniqueWords: this.getUniqueWordCount(),
        };
    }
}

/**
 * Calculate reading time in minutes
 * @param {number} wordCount - Number of words
 * @param {number} wordsPerMinute - Reading speed (default: 200)
 * @returns {number} Reading time in minutes
 */
export function calculateReadingTime(wordCount, wordsPerMinute = 200) {
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

