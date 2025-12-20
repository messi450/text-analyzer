import { useMemo } from 'react';
import { TextAnalyzer } from '@/utils/textAnalyzer';
import { generateLocalSuggestions } from '@/utils/suggestionGenerators';
import { calculateReadability } from '@/components/text-analyzer/ReadabilityPanel';
import { analyzeSentiment } from '@/components/text-analyzer/SentimentPanel';
import { extractKeywords } from '@/components/text-analyzer/KeywordsPanel';
import { calculateOverallScore } from '@/components/text-analyzer/ExportPanel';

/**
 * Custom hook for text analysis
 * @param {string} text - Text to analyze
 * @param {string} writingStyle - Writing style preference
 * @param {Array} aiSuggestions - AI-generated suggestions
 * @returns {Object} Analysis data including stats, readability, sentiment, etc.
 */
export function useTextAnalysis(text, writingStyle = 'casual', aiSuggestions = []) {
    return useMemo(() => {
        if (!text || !text.trim()) {
            return {
                stats: {
                    totalChars: 0,
                    totalCharsNoSpaces: 0,
                    totalWords: 0,
                    totalSentences: 0,
                    totalParagraphs: 0,
                    uniqueWords: 0,
                },
                wordFrequency: {},
                readability: null,
                sentiment: null,
                keywords: [],
                localSuggestions: [],
                overallScore: 0,
            };
        }

        try {
            const analyzer = new TextAnalyzer(text);
            const stats = analyzer.getAllStats();
            const wordFrequency = analyzer.getWordFrequency();
            const readabilityData = calculateReadability(text, stats);
            const sentimentData = analyzeSentiment(text);
            const localSuggestions = generateLocalSuggestions(text, stats);
            const scoreResult = calculateOverallScore(stats, readabilityData, sentimentData, localSuggestions);
            const score = typeof scoreResult === 'object' ? scoreResult.score : scoreResult;

            return {
                stats,
                wordFrequency,
                readability: readabilityData,
                sentiment: sentimentData,
                keywords: extractKeywords(text, wordFrequency),
                localSuggestions: [...localSuggestions, ...(aiSuggestions || [])],
                overallScore: score,
            };
        } catch (error) {
            console.error('Text analysis error:', error);
            return {
                stats: {
                    totalChars: 0,
                    totalCharsNoSpaces: 0,
                    totalWords: 0,
                    totalSentences: 0,
                    totalParagraphs: 0,
                    uniqueWords: 0,
                },
                wordFrequency: {},
                readability: null,
                sentiment: null,
                keywords: [],
                localSuggestions: [],
                overallScore: 0,
            };
        }
    }, [text, writingStyle, aiSuggestions]);
}

