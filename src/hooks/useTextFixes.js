import { useCallback } from 'react';
import { toast } from 'sonner';

/**
 * Custom hook for applying text fixes
 * @param {string} text - Current text
 * @param {Function} setText - Function to update text
 * @returns {Object} Fix application functions
 */
export function useTextFixes(text, setText) {
    /**
     * Apply a single fix
     */
    const applyFix = useCallback((issue) => {
        if (!issue) return;
        
        if (issue.suggested !== undefined && issue.start !== undefined && issue.end !== undefined) {
            const newText = text.slice(0, issue.start) + issue.suggested + text.slice(issue.end);
            setText(newText);
            toast.success('Fix applied');
        } else if (issue.original && issue.suggested) {
            // Fallback for issues without offsets
            const newText = text.replace(issue.original, issue.suggested);
            setText(newText);
            toast.success('Fix applied');
        }
    }, [text, setText]);

    /**
     * Apply all fixes at once
     */
    const applyAllFixes = useCallback((sortedFixes) => {
        if (!sortedFixes || sortedFixes.length === 0) return;
        
        let newText = text;
        // Apply from end to start to avoid shifting indices
        const sorted = [...sortedFixes].sort((a, b) => (b.start || 0) - (a.start || 0));
        
        for (const issue of sorted) {
            if (issue.suggested !== undefined && issue.start !== undefined && issue.end !== undefined) {
                newText = newText.slice(0, issue.start) + issue.suggested + newText.slice(issue.end);
            }
        }
        
        setText(newText);
        toast.success(`Applied ${sortedFixes.length} fixes`);
    }, [text, setText]);

    /**
     * Apply a suggestion
     */
    const applySuggestion = useCallback((suggestion) => {
        if (!suggestion || !suggestion.suggested || !suggestion.original) return;
        
        const position = text.indexOf(suggestion.original);
        if (position !== -1) {
            const newText = text.slice(0, position) + suggestion.suggested + text.slice(position + suggestion.original.length);
            setText(newText);
        } else {
            const newText = text.replace(suggestion.original, suggestion.suggested);
            setText(newText);
        }
        toast.success('Suggestion applied');
    }, [text, setText]);

    /**
     * Apply a grammar fix
     */
    const applyGrammarFix = useCallback((original, suggested, index) => {
        if (!original || !suggested) return;
        
        // Try to find the exact occurrence
        const regex = new RegExp(original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        const matches = [...text.matchAll(regex)];

        if (matches.length > 0) {
            const match = matches[0]; // Use first match
            const newText = text.slice(0, match.index) + suggested + text.slice(match.index + original.length);
            setText(newText);
            toast.success('Grammar fix applied');
        } else {
            toast.error('Could not find text to replace. It might have already been modified.');
        }
    }, [text, setText]);

    return {
        applyFix,
        applyAllFixes,
        applySuggestion,
        applyGrammarFix,
    };
}

