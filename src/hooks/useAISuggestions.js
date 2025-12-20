import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { generateSuggestionsGemini, isGeminiAvailable } from '@/api/geminiClient';

/**
 * Custom hook for managing AI suggestions
 * @param {string} text - Text to analyze
 * @param {Object} stats - Text statistics
 * @param {string} writingStyle - Writing style
 * @returns {Object} AI suggestions state and functions
 */
export function useAISuggestions(text, stats, writingStyle) {
    const [aiSuggestions, setAiSuggestions] = useState([]);
    const [isFetchingAiSuggestions, setIsFetchingAiSuggestions] = useState(false);

    const fetchAiSuggestions = useCallback(async () => {
        if (!text || text.trim().length < 20) {
            toast.error('Please enter more text to get AI suggestions');
            return;
        }

        if (!isGeminiAvailable()) {
            toast.error('Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your .env file');
            return;
        }

        setIsFetchingAiSuggestions(true);
        try {
            const suggestions = await generateSuggestionsGemini(text, stats, writingStyle);

            // Assign IDs and try to find positions for AI suggestions
            const formatted = (suggestions || []).map((s, i) => {
                let start, end;
                if (s.original) {
                    const index = text.indexOf(s.original);
                    if (index !== -1) {
                        start = index;
                        end = index + s.original.length;
                    }
                }

                return {
                    id: `ai-suggest-${i}-${Date.now()}`,
                    ...s,
                    start,
                    end
                };
            });

            setAiSuggestions(formatted);
            toast.success(`Found ${formatted.length} AI suggestions`);
        } catch (error) {
            console.error('AI Suggestions error:', error);
            toast.error('Failed to fetch AI suggestions. ' + (error.message || ''));
        } finally {
            setIsFetchingAiSuggestions(false);
        }
    }, [text, stats, writingStyle]);

    return {
        aiSuggestions,
        isFetchingAiSuggestions,
        fetchAiSuggestions,
        setAiSuggestions,
    };
}

