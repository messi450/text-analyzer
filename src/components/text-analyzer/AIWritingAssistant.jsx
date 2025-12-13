import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Wand2, 
    Loader2, 
    CheckCircle2, 
    AlertTriangle, 
    Lightbulb, 
    RefreshCw,
    ChevronDown,
    ChevronUp,
    Copy,
    Check,
    Sparkles,
    MessageSquare,
    Zap,
    BookOpen,
    Target,
    ArrowRight,
    X
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { base44 } from '@/api/base44Client';
import { toast } from "sonner";

const SUGGESTION_TYPES = {
    grammar: { icon: CheckCircle2, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100', label: 'Grammar' },
    style: { icon: Sparkles, color: 'text-violet-500', bg: 'bg-violet-50', border: 'border-violet-100', label: 'Style' },
    clarity: { icon: Target, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100', label: 'Clarity' },
    tone: { icon: MessageSquare, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100', label: 'Tone' },
    structure: { icon: BookOpen, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100', label: 'Structure' }
};

function SuggestionCard({ suggestion, onApply, onDismiss, copiedId, onCopy }) {
    const [expanded, setExpanded] = useState(false);
    const typeConfig = SUGGESTION_TYPES[suggestion.type] || SUGGESTION_TYPES.style;
    const Icon = typeConfig.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={`p-4 rounded-xl border ${typeConfig.bg} ${typeConfig.border} relative group`}
        >
            <button
                onClick={() => onDismiss(suggestion.id)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/50 rounded-lg"
            >
                <X className="w-3 h-3 text-slate-400" />
            </button>

            <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-white shadow-sm`}>
                    <Icon className={`w-4 h-4 ${typeConfig.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={`text-xs ${typeConfig.color} border-current`}>
                            {typeConfig.label}
                        </Badge>
                        {suggestion.severity === 'high' && (
                            <Badge variant="outline" className="text-xs text-red-500 border-red-200">
                                Important
                            </Badge>
                        )}
                    </div>
                    
                    <h4 className="text-sm font-semibold text-slate-800 mb-1">{suggestion.title}</h4>
                    <p className="text-xs text-slate-600 mb-3">{suggestion.description}</p>

                    {/* Original vs Suggested */}
                    {suggestion.original && suggestion.suggested && (
                        <div className="space-y-2 mb-3">
                            <div className="flex items-start gap-2">
                                <span className="text-xs text-slate-400 w-16 flex-shrink-0 pt-1">Original:</span>
                                <div className="flex-1 p-2 bg-red-100/50 rounded-lg text-xs text-slate-700 line-through">
                                    "{suggestion.original}"
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-xs text-slate-400 w-16 flex-shrink-0 pt-1">Suggested:</span>
                                <div className="flex-1 p-2 bg-emerald-100/50 rounded-lg text-xs text-slate-700 font-medium">
                                    "{suggestion.suggested}"
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Explanation - Expandable */}
                    {suggestion.explanation && (
                        <div>
                            <button
                                onClick={() => setExpanded(!expanded)}
                                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 mb-2"
                            >
                                <Lightbulb className="w-3 h-3" />
                                Why this suggestion?
                                {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                            <AnimatePresence>
                                {expanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <p className="text-xs text-slate-500 bg-white/50 p-3 rounded-lg border border-slate-100">
                                            {suggestion.explanation}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-3">
                        {suggestion.suggested && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onCopy(suggestion.id, suggestion.suggested)}
                                className="h-7 text-xs rounded-lg"
                            >
                                {copiedId === suggestion.id ? (
                                    <><Check className="w-3 h-3 mr-1" /> Copied</>
                                ) : (
                                    <><Copy className="w-3 h-3 mr-1" /> Copy</>
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function ToneAnalysis({ toneData }) {
    if (!toneData) return null;

    const toneColors = {
        formal: 'bg-indigo-500',
        informal: 'bg-pink-500',
        professional: 'bg-blue-500',
        casual: 'bg-orange-500',
        academic: 'bg-purple-500',
        friendly: 'bg-green-500',
        assertive: 'bg-red-500',
        neutral: 'bg-slate-500'
    };

    return (
        <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100">
            <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-4 h-4 text-amber-600" />
                <h4 className="text-sm font-semibold text-slate-800">Tone Analysis</h4>
            </div>
            
            <div className="space-y-3">
                <div>
                    <p className="text-xs text-slate-500 mb-2">Detected Tones:</p>
                    <div className="flex flex-wrap gap-2">
                        {toneData.detected_tones?.map((tone, idx) => (
                            <Badge 
                                key={idx} 
                                className={`${toneColors[tone.toLowerCase()] || 'bg-slate-500'} text-white`}
                            >
                                {tone}
                            </Badge>
                        ))}
                    </div>
                </div>
                
                <div>
                    <p className="text-xs text-slate-500 mb-1">Consistency Score:</p>
                    <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-white rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${toneData.consistency_score || 0}%` }}
                                className={`h-full rounded-full ${
                                    toneData.consistency_score >= 80 ? 'bg-emerald-500' :
                                    toneData.consistency_score >= 60 ? 'bg-amber-500' : 'bg-red-500'
                                }`}
                            />
                        </div>
                        <span className="text-xs font-semibold text-slate-700">{toneData.consistency_score}%</span>
                    </div>
                </div>

                {toneData.inconsistencies?.length > 0 && (
                    <div>
                        <p className="text-xs text-slate-500 mb-1">Inconsistencies Found:</p>
                        <ul className="text-xs text-slate-600 space-y-1">
                            {toneData.inconsistencies.slice(0, 3).map((issue, idx) => (
                                <li key={idx} className="flex items-start gap-1">
                                    <AlertTriangle className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
                                    {issue}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function AIWritingAssistant({ text, writingStyle, onApplySuggestion }) {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [toneAnalysis, setToneAnalysis] = useState(null);
    const [dismissed, setDismissed] = useState([]);
    const [copiedId, setCopiedId] = useState(null);
    const [activeTab, setActiveTab] = useState('all');
    const [hasAnalyzed, setHasAnalyzed] = useState(false);

    const analyzeWithAI = async () => {
        if (!text || text.trim().length < 20) {
            toast.error('Please enter at least 20 characters to analyze');
            return;
        }

        setIsAnalyzing(true);
        setDismissed([]);

        try {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `You are an expert writing coach and editor. Analyze the following text and provide detailed suggestions for improvement.

Writing Style Context: ${writingStyle}

TEXT TO ANALYZE:
"""
${text.slice(0, 3000)}
"""

Provide your analysis in the following JSON structure:

{
    "suggestions": [
        {
            "id": "unique_id",
            "type": "grammar|style|clarity|tone|structure",
            "severity": "high|medium|low",
            "title": "Brief title of the issue",
            "description": "What the issue is",
            "original": "The problematic text (exact quote if applicable)",
            "suggested": "The improved version",
            "explanation": "Detailed explanation of why this change improves the writing, teaching the user about the writing principle involved"
        }
    ],
    "tone_analysis": {
        "detected_tones": ["list of detected tones like formal, casual, professional, friendly, assertive, etc."],
        "consistency_score": 0-100,
        "inconsistencies": ["list of tone inconsistency issues found"],
        "overall_assessment": "Brief assessment of the overall tone"
    }
}

Focus on:
1. GRAMMAR: Complex grammatical errors (subject-verb agreement, dangling modifiers, parallel structure, tense consistency, pronoun reference)
2. STYLE: Conciseness improvements (remove redundancy, wordy phrases, unnecessary qualifiers)
3. CLARITY: Ambiguous sentences, unclear references, confusing structure
4. TONE: Consistency in voice and register throughout the text
5. STRUCTURE: Sentence restructuring for better flow, variety in sentence length and structure

Provide 5-10 actionable suggestions. Each suggestion should have a clear explanation that teaches the user about good writing. Be specific with original and suggested text.`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        suggestions: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    id: { type: "string" },
                                    type: { type: "string" },
                                    severity: { type: "string" },
                                    title: { type: "string" },
                                    description: { type: "string" },
                                    original: { type: "string" },
                                    suggested: { type: "string" },
                                    explanation: { type: "string" }
                                }
                            }
                        },
                        tone_analysis: {
                            type: "object",
                            properties: {
                                detected_tones: { type: "array", items: { type: "string" } },
                                consistency_score: { type: "number" },
                                inconsistencies: { type: "array", items: { type: "string" } },
                                overall_assessment: { type: "string" }
                            }
                        }
                    }
                }
            });

            setSuggestions(response.suggestions || []);
            setToneAnalysis(response.tone_analysis || null);
            setHasAnalyzed(true);
            toast.success(`Found ${response.suggestions?.length || 0} suggestions`);
        } catch (error) {
            console.error('AI Analysis error:', error);
            toast.error('Failed to analyze text. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleDismiss = (id) => {
        setDismissed([...dismissed, id]);
    };

    const handleCopy = (id, text) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        toast.success('Copied to clipboard');
        setTimeout(() => setCopiedId(null), 2000);
    };

    const activeSuggestions = suggestions.filter(s => !dismissed.includes(s.id));
    const filteredSuggestions = activeTab === 'all' 
        ? activeSuggestions 
        : activeSuggestions.filter(s => s.type === activeTab);

    const suggestionCounts = {
        all: activeSuggestions.length,
        grammar: activeSuggestions.filter(s => s.type === 'grammar').length,
        style: activeSuggestions.filter(s => s.type === 'style').length,
        clarity: activeSuggestions.filter(s => s.type === 'clarity').length,
        tone: activeSuggestions.filter(s => s.type === 'tone').length,
        structure: activeSuggestions.filter(s => s.type === 'structure').length
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
        >
            {/* Header */}
            <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-violet-50 via-purple-50 to-indigo-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-200">
                            <Wand2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-slate-800">AI Writing Assistant</h3>
                            <p className="text-xs text-slate-500">Advanced grammar, style & tone analysis</p>
                        </div>
                    </div>
                    <Button
                        onClick={analyzeWithAI}
                        disabled={isAnalyzing || !text || text.length < 20}
                        className="rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-md shadow-violet-200"
                    >
                        {isAnalyzing ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Zap className="w-4 h-4 mr-2" />
                                {hasAnalyzed ? 'Re-analyze' : 'Analyze with AI'}
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                {!hasAnalyzed && !isAnalyzing ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-violet-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Wand2 className="w-8 h-8 text-violet-500" />
                        </div>
                        <h4 className="text-lg font-semibold text-slate-800 mb-2">AI-Powered Analysis</h4>
                        <p className="text-sm text-slate-500 max-w-md mx-auto mb-4">
                            Get sophisticated grammar corrections, style improvements, tone consistency checks, 
                            and sentence restructuring suggestions with detailed explanations.
                        </p>
                        <div className="flex flex-wrap justify-center gap-2">
                            {Object.entries(SUGGESTION_TYPES).map(([key, config]) => (
                                <Badge key={key} variant="outline" className={`${config.color} border-current`}>
                                    {config.label}
                                </Badge>
                            ))}
                        </div>
                    </div>
                ) : isAnalyzing ? (
                    <div className="text-center py-12">
                        <Loader2 className="w-10 h-10 animate-spin text-violet-500 mx-auto mb-4" />
                        <p className="text-sm text-slate-600">Analyzing your text with AI...</p>
                        <p className="text-xs text-slate-400 mt-1">This may take a few seconds</p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {/* Tone Analysis Card */}
                        <ToneAnalysis toneData={toneAnalysis} />

                        {/* Suggestions Tabs */}
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="bg-slate-100 p-1 rounded-xl">
                                <TabsTrigger value="all" className="rounded-lg text-xs">
                                    All ({suggestionCounts.all})
                                </TabsTrigger>
                                {suggestionCounts.grammar > 0 && (
                                    <TabsTrigger value="grammar" className="rounded-lg text-xs">
                                        Grammar ({suggestionCounts.grammar})
                                    </TabsTrigger>
                                )}
                                {suggestionCounts.style > 0 && (
                                    <TabsTrigger value="style" className="rounded-lg text-xs">
                                        Style ({suggestionCounts.style})
                                    </TabsTrigger>
                                )}
                                {suggestionCounts.clarity > 0 && (
                                    <TabsTrigger value="clarity" className="rounded-lg text-xs">
                                        Clarity ({suggestionCounts.clarity})
                                    </TabsTrigger>
                                )}
                                {suggestionCounts.structure > 0 && (
                                    <TabsTrigger value="structure" className="rounded-lg text-xs">
                                        Structure ({suggestionCounts.structure})
                                    </TabsTrigger>
                                )}
                            </TabsList>

                            <TabsContent value={activeTab} className="mt-4">
                                <ScrollArea className="h-[400px] pr-2">
                                    {filteredSuggestions.length === 0 ? (
                                        <div className="text-center py-8 text-slate-500">
                                            <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-emerald-500" />
                                            <p className="text-sm font-medium">No issues found in this category!</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <AnimatePresence>
                                                {filteredSuggestions.map((suggestion) => (
                                                    <SuggestionCard
                                                        key={suggestion.id}
                                                        suggestion={suggestion}
                                                        onApply={onApplySuggestion}
                                                        onDismiss={handleDismiss}
                                                        copiedId={copiedId}
                                                        onCopy={handleCopy}
                                                    />
                                                ))}
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </ScrollArea>
                            </TabsContent>
                        </Tabs>

                        {/* Summary Stats */}
                        {activeSuggestions.length > 0 && (
                            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                <div className="flex items-center gap-4 text-xs text-slate-500">
                                    <span>{activeSuggestions.filter(s => s.severity === 'high').length} high priority</span>
                                    <span>{dismissed.length} dismissed</span>
                                </div>
                                {dismissed.length > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setDismissed([])}
                                        className="text-xs"
                                    >
                                        <RefreshCw className="w-3 h-3 mr-1" />
                                        Restore dismissed
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
}