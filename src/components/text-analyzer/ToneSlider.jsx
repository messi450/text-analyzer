import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Copy, Check, RefreshCw, ArrowRight, Lightbulb, Target, Zap, Palette } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { adjustTone, adjustToneAdvanced, detectTone, generateAISuggestions, getToneOptions } from '@/utils/toneAdjuster';
import { toast } from "sonner";

const TONE_CONFIG = {
  formality: {
    labels: ['Very Casual', 'Casual', 'Neutral', 'Formal', 'Very Formal'],
    emojis: ['😊', '🙂', '😐', '👔', '🎩'],
    icon: Target,
    color: 'blue'
  },
  emotion: {
    labels: ['Reserved', 'Neutral', 'Enthusiastic', 'Passionate', 'Urgent'],
    emojis: ['😐', '😌', '😃', '❤️', '⚡'],
    icon: Zap,
    color: 'red'
  },
  style: {
    labels: ['Concise', 'Balanced', 'Elaborate', 'Persuasive', 'Inspirational'],
    emojis: ['📝', '⚖️', '📖', '🎯', '✨'],
    icon: Palette,
    color: 'purple'
  }
};

export default function ToneSlider({ text, onApply }) {
    const [activeCategory, setActiveCategory] = useState('formality');
    const [toneLevels, setToneLevels] = useState({ formality: 2, emotion: 1, style: 1 });
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState(null);
    const [copied, setCopied] = useState(false);
    const [detectedTone, setDetectedTone] = useState(null);
    const [aiSuggestions, setAiSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Detect tone when text changes
    useEffect(() => {
        if (text && text.length > 10) {
            const detected = detectTone(text);
            setDetectedTone(detected);
        } else {
            setDetectedTone(null);
        }
    }, [text]);

    const handleToneLevelChange = (category, level) => {
        setToneLevels(prev => ({ ...prev, [category]: level }));

        // Generate AI suggestions when adjusting
        if (text && text.length > 10) {
            const suggestions = generateAISuggestions(text, category, level, detectedTone);
            setAiSuggestions(suggestions);
            setShowSuggestions(true);
        }
    };

    const handleAdjust = async () => {
        if (!text || text.length < 10) {
            toast.error('Please enter more text to adjust');
            return;
        }

        setIsProcessing(true);
        setResult(null);

        try {
            // Use advanced tone adjustment with multiple dimensions
            const adjustments = {
                formality: toneLevels.formality,
                emotion: toneLevels.emotion,
                style: toneLevels.style
            };

            const localResult = adjustToneAdvanced(text, adjustments);
            setResult(localResult);
            toast.success('Tone adjusted with enhanced AI processing');

        } catch (localError) {
            console.warn('Local tone adjustment failed, trying API fallback:', localError);

            // Fallback to API if local adjustment fails
            try {
                const config = TONE_CONFIG[activeCategory];
                const targetTone = config.labels[toneLevels[activeCategory]];
                const response = await base44.integrations.Core.InvokeLLM({
                    prompt: `Rewrite the following text to have a ${targetTone.toLowerCase()} ${activeCategory} tone. Keep the same meaning but adjust the language, word choice, and style to match the desired tone level.

Original text:
"${text}"

Consider the context and provide a natural, effective transformation. Focus on ${activeCategory} aspects while maintaining clarity and impact.`,
                });

                setResult(response);
                toast.success('Tone adjusted via AI');
            } catch (apiError) {
                console.error('API fallback also failed:', apiError);
                toast.error('Failed to adjust tone - please check your connection');
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(result);
        setCopied(true);
        toast.success('Copied!');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleApply = () => {
        onApply?.(result);
        setResult(null);
        setAiSuggestions([]);
        setShowSuggestions(false);
        toast.success('Applied to editor');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
        >
            {/* Detected Tone Display */}
            {detectedTone && (
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                    <div className="flex items-center gap-2 text-xs text-slate-600 mb-2">
                        <Target className="w-3 h-3" />
                        <span className="font-medium">Detected Current Tone</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <Badge variant="secondary" className="text-xs">
                            Formality: {TONE_CONFIG.formality.labels[Math.round(detectedTone.formality)]}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                            Emotion: {TONE_CONFIG.emotion.labels[Math.round(detectedTone.emotion)]}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                            Style: {TONE_CONFIG.style.labels[Math.round(detectedTone.style)]}
                        </Badge>
                    </div>
                </div>
            )}

            {/* Tone Category Tabs */}
            <Tabs value={activeCategory} onValueChange={setActiveCategory}>
                <TabsList className="grid grid-cols-3 w-full">
                    {Object.entries(TONE_CONFIG).map(([key, config]) => {
                        const Icon = config.icon;
                        return (
                            <TabsTrigger key={key} value={key} className="flex items-center gap-1 text-xs">
                                <Icon className="w-3 h-3" />
                                <span className="hidden sm:inline capitalize">{key}</span>
                            </TabsTrigger>
                        );
                    })}
                </TabsList>

                {Object.entries(TONE_CONFIG).map(([category, config]) => (
                    <TabsContent key={category} value={category} className="space-y-3 mt-4">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-700 capitalize">
                                    {category} Level
                                </span>
                                <span className="text-lg">{config.emojis[toneLevels[category]]}</span>
                            </div>

                            <Slider
                                value={[toneLevels[category]]}
                                onValueChange={(v) => handleToneLevelChange(category, v[0])}
                                max={4}
                                step={1}
                                className="w-full"
                            />

                            <div className="flex justify-between text-[10px] text-slate-400">
                                {config.labels.map((label, i) => {
                                    const isSelected = i === toneLevels[category];
                                    const colorClass = isSelected
                                        ? (config.color === 'blue' ? 'text-blue-600' :
                                           config.color === 'red' ? 'text-red-600' :
                                           config.color === 'purple' ? 'text-purple-600' : 'text-slate-600')
                                        : '';
                                    return (
                                        <span
                                            key={label}
                                            className={`${colorClass} ${isSelected ? 'font-medium' : ''}`}
                                        >
                                            {label}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    </TabsContent>
                ))}
            </Tabs>

            {/* AI Suggestions */}
            <AnimatePresence>
                {showSuggestions && aiSuggestions.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-amber-50 border border-amber-200 rounded-lg p-3"
                    >
                        <div className="flex items-center gap-2 text-xs text-amber-800 mb-2">
                            <Lightbulb className="w-3 h-3" />
                            <span className="font-medium">AI Suggestions</span>
                        </div>
                        <ul className="space-y-1 text-xs text-amber-700">
                            {aiSuggestions.map((suggestion, index) => (
                                <li key={index} className="flex items-start gap-1">
                                    <span className="text-amber-500 mt-0.5">•</span>
                                    <span>{suggestion}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Action button */}
            <Button
                onClick={handleAdjust}
                disabled={isProcessing || !text}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl h-10"
            >
                {isProcessing ? (
                    <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                    </>
                ) : (
                    <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Apply Enhanced Tone Adjustments
                    </>
                )}
            </Button>

            {/* Result */}
            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2"
                    >
                        <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>Enhanced adjusted text:</span>
                            <div className="flex gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleCopy}
                                    className="h-6 px-2 text-xs"
                                >
                                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleApply}
                                    className="h-6 px-2 text-xs text-blue-600"
                                >
                                    <ArrowRight className="w-3 h-3 mr-1" /> Apply
                                </Button>
                            </div>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-xl text-sm text-slate-700 max-h-40 overflow-y-auto">
                            {result}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}