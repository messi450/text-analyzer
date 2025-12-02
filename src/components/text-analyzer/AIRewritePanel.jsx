import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    PenLine, 
    Loader2, 
    Copy, 
    Check, 
    RefreshCw,
    Minimize2,
    Maximize2,
    ArrowRightLeft,
    Sparkles,
    Briefcase,
    GraduationCap,
    MessageCircle,
    Zap
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { base44 } from '@/api/base44Client';
import { toast } from "sonner";

const REWRITE_MODES = [
    { id: 'concise', label: 'More Concise', icon: Minimize2, description: 'Shorter and punchier' },
    { id: 'expand', label: 'Expand', icon: Maximize2, description: 'More detailed' },
    { id: 'formal', label: 'Formal', icon: Briefcase, description: 'Professional tone' },
    { id: 'casual', label: 'Casual', icon: MessageCircle, description: 'Friendly tone' },
    { id: 'academic', label: 'Academic', icon: GraduationCap, description: 'Scholarly style' },
    { id: 'creative', label: 'Creative', icon: Sparkles, description: 'More engaging' }
];

export default function AIRewritePanel({ text, selectedText, onApplyRewrite }) {
    const [isRewriting, setIsRewriting] = useState(false);
    const [rewriteResults, setRewriteResults] = useState(null);
    const [selectedMode, setSelectedMode] = useState('concise');
    const [copied, setCopied] = useState(false);
    const [inputText, setInputText] = useState('');

    const textToRewrite = selectedText || inputText || text?.slice(0, 500);

    const handleRewrite = async () => {
        if (!textToRewrite || textToRewrite.trim().length < 10) {
            toast.error('Please enter at least 10 characters to rewrite');
            return;
        }

        setIsRewriting(true);

        try {
            const modeConfig = REWRITE_MODES.find(m => m.id === selectedMode);
            
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `You are an expert writing editor. Rewrite the following text according to the specified style.

REWRITE MODE: ${modeConfig.label} - ${modeConfig.description}

ORIGINAL TEXT:
"""
${textToRewrite.slice(0, 1500)}
"""

Provide your rewrite in the following JSON structure:

{
    "rewritten_text": "The rewritten version of the text",
    "changes_made": [
        "List of specific changes made and why"
    ],
    "word_count_comparison": {
        "original": number,
        "rewritten": number
    },
    "key_improvements": [
        "Key improvements in the rewritten version"
    ],
    "alternative_phrasings": [
        {
            "original": "A phrase from the original",
            "alternatives": ["Alternative 1", "Alternative 2"]
        }
    ]
}

Guidelines for "${selectedMode}" mode:
${selectedMode === 'concise' ? 
    '- Remove redundant words and phrases\n- Use active voice\n- Eliminate filler words\n- Combine sentences where possible\n- Keep the core meaning intact' :
selectedMode === 'expand' ? 
    '- Add relevant details and examples\n- Elaborate on key points\n- Include transitional phrases\n- Maintain coherence while adding depth' :
selectedMode === 'formal' ? 
    '- Use professional vocabulary\n- Avoid contractions\n- Use third person where appropriate\n- Maintain objective tone\n- Use proper business/academic language' :
selectedMode === 'casual' ? 
    '- Use conversational language\n- Include contractions\n- Add friendly expressions\n- Make it approachable and warm\n- Keep it engaging' :
selectedMode === 'academic' ? 
    '- Use scholarly vocabulary\n- Include hedging language where appropriate\n- Maintain objective stance\n- Use formal structures\n- Cite-ready format' :
    '- Use vivid language and imagery\n- Add engaging hooks\n- Vary sentence structure\n- Include rhetorical devices\n- Make it memorable'}

Ensure the rewritten text:
1. Preserves the original meaning
2. Is grammatically correct
3. Flows naturally
4. Matches the requested style perfectly`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        rewritten_text: { type: "string" },
                        changes_made: { type: "array", items: { type: "string" } },
                        word_count_comparison: {
                            type: "object",
                            properties: {
                                original: { type: "number" },
                                rewritten: { type: "number" }
                            }
                        },
                        key_improvements: { type: "array", items: { type: "string" } },
                        alternative_phrasings: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    original: { type: "string" },
                                    alternatives: { type: "array", items: { type: "string" } }
                                }
                            }
                        }
                    }
                }
            });

            setRewriteResults(response);
            toast.success('Text rewritten successfully!');
        } catch (error) {
            console.error('Rewrite error:', error);
            toast.error('Failed to rewrite text. Please try again.');
        } finally {
            setIsRewriting(false);
        }
    };

    const handleCopy = () => {
        if (rewriteResults?.rewritten_text) {
            navigator.clipboard.writeText(rewriteResults.rewritten_text);
            setCopied(true);
            toast.success('Copied to clipboard');
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleReset = () => {
        setRewriteResults(null);
        setInputText('');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
        >
            {/* Header */}
            <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
                        <PenLine className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-slate-800">AI Sentence Restructuring</h3>
                        <p className="text-xs text-slate-500">Transform your text with different styles</p>
                    </div>
                </div>
            </div>

            <div className="p-5 space-y-5">
                {/* Mode Selection */}
                <div>
                    <p className="text-xs font-medium text-slate-500 mb-3">Select rewrite style:</p>
                    <div className="grid grid-cols-3 gap-2">
                        {REWRITE_MODES.map((mode) => {
                            const Icon = mode.icon;
                            return (
                                <button
                                    key={mode.id}
                                    onClick={() => setSelectedMode(mode.id)}
                                    className={`p-3 rounded-xl border-2 transition-all text-left ${
                                        selectedMode === mode.id 
                                            ? 'border-emerald-500 bg-emerald-50' 
                                            : 'border-slate-100 hover:border-slate-200 bg-white'
                                    }`}
                                >
                                    <Icon className={`w-4 h-4 mb-1 ${
                                        selectedMode === mode.id ? 'text-emerald-600' : 'text-slate-400'
                                    }`} />
                                    <p className={`text-xs font-medium ${
                                        selectedMode === mode.id ? 'text-emerald-700' : 'text-slate-700'
                                    }`}>{mode.label}</p>
                                    <p className="text-xs text-slate-400">{mode.description}</p>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Input Area */}
                {!rewriteResults && (
                    <div>
                        <p className="text-xs font-medium text-slate-500 mb-2">
                            Text to rewrite {selectedText ? '(using selected text)' : ''}:
                        </p>
                        <Textarea
                            placeholder="Enter or paste text to rewrite, or it will use the first 500 characters of your main text..."
                            value={inputText || textToRewrite}
                            onChange={(e) => setInputText(e.target.value)}
                            className="min-h-[100px] text-sm rounded-xl resize-none"
                        />
                        <div className="flex justify-between items-center mt-3">
                            <span className="text-xs text-slate-400">
                                {(inputText || textToRewrite || '').length} characters
                            </span>
                            <Button
                                onClick={handleRewrite}
                                disabled={isRewriting || !(inputText || textToRewrite)}
                                className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                            >
                                {isRewriting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Rewriting...
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-4 h-4 mr-2" />
                                        Rewrite Text
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Results */}
                <AnimatePresence>
                    {rewriteResults && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-4"
                        >
                            {/* Word Count Comparison */}
                            <div className="flex items-center justify-center gap-4 p-3 bg-slate-50 rounded-xl">
                                <div className="text-center">
                                    <p className="text-lg font-bold text-slate-700">
                                        {rewriteResults.word_count_comparison?.original || 0}
                                    </p>
                                    <p className="text-xs text-slate-500">Original</p>
                                </div>
                                <ArrowRightLeft className="w-5 h-5 text-slate-400" />
                                <div className="text-center">
                                    <p className="text-lg font-bold text-emerald-600">
                                        {rewriteResults.word_count_comparison?.rewritten || 0}
                                    </p>
                                    <p className="text-xs text-slate-500">Rewritten</p>
                                </div>
                                <Badge variant="outline" className={`ml-2 ${
                                    (rewriteResults.word_count_comparison?.rewritten || 0) < 
                                    (rewriteResults.word_count_comparison?.original || 0)
                                        ? 'text-emerald-600 border-emerald-200'
                                        : 'text-blue-600 border-blue-200'
                                }`}>
                                    {Math.abs(
                                        ((rewriteResults.word_count_comparison?.rewritten || 0) - 
                                        (rewriteResults.word_count_comparison?.original || 0))
                                    )} words {
                                        (rewriteResults.word_count_comparison?.rewritten || 0) < 
                                        (rewriteResults.word_count_comparison?.original || 0)
                                            ? 'shorter' : 'longer'
                                    }
                                </Badge>
                            </div>

                            {/* Rewritten Text */}
                            <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-medium text-emerald-700">Rewritten Text:</p>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleCopy}
                                        className="h-7 text-xs"
                                    >
                                        {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                                        {copied ? 'Copied!' : 'Copy'}
                                    </Button>
                                </div>
                                <p className="text-sm text-slate-700 leading-relaxed">
                                    {rewriteResults.rewritten_text}
                                </p>
                            </div>

                            {/* Key Improvements */}
                            {rewriteResults.key_improvements?.length > 0 && (
                                <div>
                                    <p className="text-xs font-medium text-slate-500 mb-2">Key Improvements:</p>
                                    <div className="space-y-1">
                                        {rewriteResults.key_improvements.map((improvement, idx) => (
                                            <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                                                <Check className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                                                {improvement}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Alternative Phrasings */}
                            {rewriteResults.alternative_phrasings?.length > 0 && (
                                <div>
                                    <p className="text-xs font-medium text-slate-500 mb-2">Alternative Phrasings:</p>
                                    <div className="space-y-2">
                                        {rewriteResults.alternative_phrasings.slice(0, 3).map((item, idx) => (
                                            <div key={idx} className="p-3 bg-slate-50 rounded-lg">
                                                <p className="text-xs text-slate-500 mb-1">"{item.original}"</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {item.alternatives?.map((alt, altIdx) => (
                                                        <Badge key={altIdx} variant="outline" className="text-xs">
                                                            {alt}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2 pt-2">
                                <Button
                                    variant="outline"
                                    onClick={handleReset}
                                    className="flex-1 rounded-xl"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Try Again
                                </Button>
                                <Button
                                    onClick={handleRewrite}
                                    disabled={isRewriting}
                                    className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600"
                                >
                                    <Zap className="w-4 h-4 mr-2" />
                                    Different Style
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}