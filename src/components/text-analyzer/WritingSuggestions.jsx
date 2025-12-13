import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, X, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

// Analyze text for common issues
export function generateSuggestions(text, stats, writingStyle) {
    const suggestions = [];
    
    if (!text || stats.totalWords === 0) return suggestions;

    const words = text.toLowerCase().replace(/[.,!?;:'"()\-\[\]{}]/g, '').split(/\s+/).filter(w => w.length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

    // Check for passive voice indicators
    const passivePatterns = /\b(was|were|is|are|been|being|be)\s+\w+ed\b/gi;
    const passiveMatches = text.match(passivePatterns);
    if (passiveMatches && passiveMatches.length > 2) {
        suggestions.push({
            type: 'warning',
            title: 'Possible Passive Voice',
            description: `Found ${passiveMatches.length} potential passive voice constructions. Consider using active voice for clearer, more engaging writing.`,
            examples: passiveMatches.slice(0, 3)
        });
    }

    // Check for very long sentences
    const longSentences = sentences.filter(s => s.split(/\s+/).length > 35);
    if (longSentences.length > 0) {
        suggestions.push({
            type: 'warning',
            title: 'Long Sentences Detected',
            description: `${longSentences.length} sentence(s) have more than 35 words. Consider breaking them into shorter sentences for better readability.`,
            examples: longSentences.slice(0, 2).map(s => s.trim().slice(0, 50) + '...')
        });
    }

    // Check for repeated words
    const wordCounts = {};
    words.forEach(w => { wordCounts[w] = (wordCounts[w] || 0) + 1; });
    const repeatedWords = Object.entries(wordCounts)
        .filter(([word, count]) => count > 5 && word.length > 4)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);
    
    if (repeatedWords.length > 0) {
        suggestions.push({
            type: 'info',
            title: 'Frequently Repeated Words',
            description: 'Consider using synonyms for variety:',
            examples: repeatedWords.map(([word, count]) => `"${word}" (${count}x)`)
        });
    }

    // Check for filler words
    const fillerWords = ['very', 'really', 'just', 'actually', 'basically', 'literally', 'definitely', 'probably', 'certainly', 'simply', 'quite', 'rather'];
    const foundFillers = fillerWords.filter(f => words.includes(f));
    if (foundFillers.length >= 3) {
        suggestions.push({
            type: 'info',
            title: 'Filler Words Found',
            description: 'These words often weaken your writing:',
            examples: foundFillers
        });
    }

    // Check for consecutive spaces or formatting issues
    if (/\s{3,}/.test(text)) {
        suggestions.push({
            type: 'error',
            title: 'Formatting Issue',
            description: 'Multiple consecutive spaces detected. Clean up extra spacing for a polished look.'
        });
    }

    // Style-specific suggestions
    if (writingStyle === 'academic') {
        const informalWords = ['gonna', 'wanna', 'gotta', 'kinda', 'sorta', 'yeah', 'nope', 'cool', 'awesome', 'stuff', 'things', 'lots'];
        const foundInformal = informalWords.filter(w => words.includes(w));
        if (foundInformal.length > 0) {
            suggestions.push({
                type: 'warning',
                title: 'Informal Language Detected',
                description: 'For academic writing, consider replacing:',
                examples: foundInformal
            });
        }
    }

    if (writingStyle === 'business') {
        const wordyPhrases = ['in order to', 'due to the fact that', 'at this point in time', 'in the event that'];
        const foundWordy = wordyPhrases.filter(p => text.toLowerCase().includes(p));
        if (foundWordy.length > 0) {
            suggestions.push({
                type: 'info',
                title: 'Wordy Phrases',
                description: 'Consider more concise alternatives:',
                examples: foundWordy
            });
        }
    }

    // Positive feedback if text is well-written
    if (suggestions.length === 0 && stats.totalWords > 50) {
        suggestions.push({
            type: 'success',
            title: 'Looking Good!',
            description: 'No major issues detected. Your text appears well-structured and clear.'
        });
    }

    return suggestions;
}

export default function WritingSuggestions({ suggestions, showSuggestions, onToggle }) {
    const [expanded, setExpanded] = useState(true);
    const [dismissed, setDismissed] = useState([]);

    const activeSuggestions = suggestions.filter((_, idx) => !dismissed.includes(idx));

    const getIcon = (type) => {
        switch (type) {
            case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />;
            case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
            case 'success': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
            default: return <Lightbulb className="w-4 h-4 text-blue-500" />;
        }
    };

    const getBgColor = (type) => {
        switch (type) {
            case 'error': return 'bg-red-50 border-red-100';
            case 'warning': return 'bg-amber-50 border-amber-100';
            case 'success': return 'bg-emerald-50 border-emerald-100';
            default: return 'bg-blue-50 border-blue-100';
        }
    };

    if (!showSuggestions) {
        return (
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-slate-400" />
                    <span className="text-sm text-slate-600">Writing suggestions are hidden</span>
                </div>
                <Switch checked={showSuggestions} onCheckedChange={onToggle} />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
        >
            <div 
                className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                            <Lightbulb className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-slate-800">Writing Suggestions</h3>
                            <p className="text-xs text-slate-500">
                                {activeSuggestions.length} suggestion{activeSuggestions.length !== 1 ? 's' : ''} available
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Switch checked={showSuggestions} onCheckedChange={onToggle} />
                        {expanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                    </div>
                </div>
            </div>
            
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="p-5 space-y-3">
                            {activeSuggestions.length === 0 ? (
                                <div className="text-center py-4 text-slate-500 text-sm">
                                    No suggestions at the moment
                                </div>
                            ) : (
                                activeSuggestions.map((suggestion, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        transition={{ duration: 0.2, delay: idx * 0.05 }}
                                        className={`p-4 rounded-xl border ${getBgColor(suggestion.type)} relative group`}
                                    >
                                        <button
                                            onClick={() => setDismissed([...dismissed, suggestions.indexOf(suggestion)])}
                                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/50 rounded-lg"
                                        >
                                            <X className="w-3 h-3 text-slate-400" />
                                        </button>
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5">{getIcon(suggestion.type)}</div>
                                            <div className="flex-1">
                                                <h4 className="text-sm font-semibold text-slate-800 mb-1">{suggestion.title}</h4>
                                                <p className="text-xs text-slate-600">{suggestion.description}</p>
                                                {suggestion.examples && (
                                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                                        {suggestion.examples.map((ex, i) => (
                                                            <span key={i} className="px-2 py-0.5 bg-white/70 rounded text-xs text-slate-700 font-mono">
                                                                {ex}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}