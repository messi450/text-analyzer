import React, { useState, useMemo, useEffect, useCallback } from 'react';

import GrammarChecker from '@/components/text-analyzer/GrammarChecker';

import { motion } from 'framer-motion';

import { Sparkles, Trash2, BarChart3, Wand2, ChevronDown, Activity, Sliders, LogOut, User, Eraser, Sun, Moon, CheckCircle2 } from 'lucide-react';

import { Button } from "@/components/ui/button";

import { Helmet } from 'react-helmet-async';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

import { toast } from "sonner";

import TextInputWithHighlights from '@/components/text-analyzer/TextInputWithHighlights';

import QuickFixSuggestions from '@/components/text-analyzer/QuickFixSuggestions';

import StatsCards from '@/components/text-analyzer/StatsCards';

import WordFrequencyTable from '@/components/text-analyzer/WordFrequencyTable';

import StatsChart from '@/components/text-analyzer/StatsChart';

import ResultsSummary from '@/components/text-analyzer/ResultsSummary';

import ReadabilityPanel, { calculateReadability } from '@/components/text-analyzer/ReadabilityPanel';

import SentimentPanel, { analyzeSentiment } from '@/components/text-analyzer/SentimentPanel';

import KeywordsPanel, { extractKeywords } from '@/components/text-analyzer/KeywordsPanel';

import ExportPanel, { calculateOverallScore } from '@/components/text-analyzer/ExportPanel';

import HistoryPanel, { saveToLocalHistory } from '@/components/text-analyzer/HistoryPanel';

import SaveAnalysisDialog from '@/components/text-analyzer/SaveAnalysisDialog';

import SettingsPanel from '@/components/text-analyzer/SettingsPanel';

import SentenceLengthChart from '@/components/text-analyzer/SentenceLengthChart';

import ParagraphStructure from '@/components/text-analyzer/ParagraphStructure';

import ReadingFlowHeatmap from '@/components/text-analyzer/ReadingFlowHeatmap';

import ToneSlider from '@/components/text-analyzer/ToneSlider';

import AuthDialog from '@/components/AuthDialog';

import { authService } from '@/lib/auth';

import { useTheme } from '@/components/ThemeProvider';

// ============================================

// Text Analysis Class

// ============================================

class TextAnalyzer {

    constructor(text) {

        this.text = text;

    }

    countTotalChars() {

        return this.text.length;

    }

    countCharsNoSpaces() {

        return this.text.replace(/\s/g, '').length;

    }

    countWords() {

        return this.text

            .replace(/[.,!?;:'"()\-\[\]{}]/g, '')

            .split(/\s+/)

            .filter(w => w.length > 0).length;

    }

    countSentences() {

        return this.text

            .split(/[.!?]+/)

            .filter(s => s.trim().length > 0).length;

    }

    countParagraphs() {

        const paragraphs = this.text

            .split(/\n\s*\n/)

            .filter(p => p.trim().length > 0);

        return Math.max(paragraphs.length, this.text.trim().length > 0 ? 1 : 0);

    }

    getWordFrequency() {

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

    getUniqueWordCount() {

        return Object.keys(this.getWordFrequency()).length;

    }

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

// ============================================

// Constants

// ============================================

const SYNONYMS = {

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

const DEFAULT_PREFERENCES = {

    theme: 'light',

    default_writing_style: 'casual',

    default_language: 'en',

    show_suggestions: true,

    auto_analyze: true,

    font_size: 'medium',

};

const BREAK_WORDS = ['and', 'but', 'or', 'so', 'because', 'which', 'that', 'while', 'although'];

// ============================================

// Suggestion Generation Utilities

// ============================================

function checkLongSentences(text) {

    const suggestions = [];

    const sentenceMatches = [...text.matchAll(/[^.!?]+[.!?]+/g)];

    sentenceMatches.forEach((match) => {

        const sentence = match[0];

        const words = sentence.split(/\s+/).filter(w => w.length > 0);

        if (words.length > 25) {

            const midPoint = Math.floor(words.length / 2);

            let breakIndex = midPoint;

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

function checkPassiveVoice(text) {

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

function checkFillerWords(text) {

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

function checkWeakWords(text) {

    const suggestions = [];

    const weakWords = ['thing', 'things', 'good', 'bad', 'big', 'small', 'get', 'got', 'make', 'made'];

    weakWords.forEach(word => {

        const regex = new RegExp(`\\b${word}\\b`, 'gi');

        let match;

        while ((match = regex.exec(text)) !== null) {

            const synonyms = SYNONYMS[word.toLowerCase()];

            if (synonyms && synonyms.length > 0) {

                let suggested = synonyms[0];

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

function checkRepeatedWords(text) {

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

function checkSpacing(text) {

    const suggestions = [];

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

function generateLocalSuggestions(text, stats) {

    if (!text || stats.totalWords === 0) return [];

    const suggestions = [

        ...checkLongSentences(text),

        ...checkPassiveVoice(text),

        ...checkFillerWords(text),

        ...checkWeakWords(text),

        ...checkRepeatedWords(text),

        ...checkSpacing(text),

    ];

    return suggestions

        .sort((a, b) => (a.start || 0) - (b.start || 0))

        .slice(0, 20);

}

// ============================================

// Main Component

// ============================================

export default function TextAnalyzerPage() {

    const { theme, toggleTheme } = useTheme();

    const [text, setText] = useState('');

    const [writingStyle, setWritingStyle] = useState('casual');

    const [language, setLanguage] = useState('en');

    const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);

    const [isSaving, setIsSaving] = useState(false);

    const [activeTab, setActiveTab] = useState('suggestions');

    const [metricsOpen, setMetricsOpen] = useState(false);

    const [user, setUser] = useState(null);

    useEffect(() => {

        const currentUser = authService.getCurrentUser();

        if (currentUser) {

            setUser(currentUser);

        }

        try {

            const savedPrefs = localStorage.getItem('textalyzer_preferences');

            if (savedPrefs) {

                setPreferences({ ...DEFAULT_PREFERENCES, ...JSON.parse(savedPrefs) });

            }

        } catch (error) {

            console.warn('Failed to load preferences:', error);

        }

    }, []);

    const analysisData = useMemo(() => {

        if (!text.trim()) {

            return {

                stats: { totalChars: 0, totalCharsNoSpaces: 0, totalWords: 0, totalSentences: 0, totalParagraphs: 0, uniqueWords: 0 },

                wordFrequency: {},

                readability: null,

                sentiment: null,

                keywords: [],

                localSuggestions: [],

                overallScore: 0,

            };

        }

        const analyzer = new TextAnalyzer(text);

        const stats = analyzer.getAllStats();

        const wordFrequency = analyzer.getWordFrequency();

        const readabilityData = calculateReadability(text, stats);

        const sentimentData = analyzeSentiment(text);

        const suggestions = generateLocalSuggestions(text, stats);

        const scoreResult = calculateOverallScore(stats, readabilityData, sentimentData, suggestions);

        const score = typeof scoreResult === 'object' ? scoreResult.score : scoreResult;

        return {

            stats,

            wordFrequency,

            readability: readabilityData,

            sentiment: sentimentData,

            keywords: extractKeywords(text, wordFrequency),

            localSuggestions: suggestions,

            overallScore: score,

        };

    }, [text, writingStyle]);

    const { stats, wordFrequency, readability, sentiment, keywords, localSuggestions, overallScore } = analysisData;

    const handleClear = useCallback(() => setText(''), []);

    const handleAuthChange = useCallback((newUser) => {

        setUser(newUser);

    }, []);

    const handleLogout = useCallback(() => {

        authService.logout();

        setUser(null);

        toast.success('Logged out successfully');

    }, []);

    const handleSaveAnalysis = useCallback(async (title) => {

        setIsSaving(true);

        try {

            const analysis = {

                title,

                original_text: text,

                stats,

                word_frequency: wordFrequency,

                readability_scores: readability,

                sentiment,

                keywords: keywords.map(k => k.word),

                writing_style: writingStyle,

                language,

                is_favorite: false,

            };

            saveToLocalHistory(analysis);

            toast.success('Analysis saved!');

        } catch (error) {

            console.error('Save error:', error);

            toast.error('Failed to save analysis');

        } finally {

            setIsSaving(false);

        }

    }, [text, stats, wordFrequency, readability, sentiment, keywords, writingStyle, language]);

    const handleLoadAnalysis = useCallback((analysis) => {

        setText(analysis.original_text || '');

        setWritingStyle(analysis.writing_style || 'casual');

        setLanguage(analysis.language || 'en');

    }, []);

    const handleUpdatePreferences = useCallback((newPreferences) => {

        setPreferences(newPreferences);

        try {

            localStorage.setItem('textalyzer_preferences', JSON.stringify(newPreferences));

        } catch (error) {

            console.warn('Failed to save preferences:', error);

        }

    }, []);

    const handleApplyFix = useCallback((issue) => {

        if (issue.suggested !== undefined && issue.start !== undefined && issue.end !== undefined) {

            const newText = text.slice(0, issue.start) + issue.suggested + text.slice(issue.end);

            setText(newText);

        }

    }, [text]);

    const handleApplyAllFixes = useCallback((sortedFixes) => {

        let newText = text;

        for (const issue of sortedFixes) {

            if (issue.suggested !== undefined && issue.start !== undefined && issue.end !== undefined) {

                newText = newText.slice(0, issue.start) + issue.suggested + newText.slice(issue.end);

            }

        }

        setText(newText);

    }, [text]);

    const readingTime = Math.max(1, Math.ceil(stats.totalWords / 200));

    const isAuthenticated = !!user;

    return (

        <>

            <Helmet>

                <title>Textalyzer - AI-Powered Text Analyzer | Readability, Grammar & Writing Assistant</title>

                <meta name="description" content="Analyze your text instantly with Textalyzer. Get AI-powered readability scores, sentiment analysis, grammar suggestions, keyword extraction, and professional writing improvements. Free online text analyzer tool." />

                <meta name="keywords" content="text analyzer, readability checker, grammar checker, sentiment analysis, AI writing assistant, word counter, Flesch reading score, content optimization, SEO writing tool, writing improvement" />

                <meta property="og:title" content="Textalyzer - AI-Powered Text Analyzer" />

                <meta property="og:description" content="Analyze your text instantly with AI-powered readability scores, sentiment analysis, grammar suggestions, and professional writing improvements." />

                <meta property="og:url" content="https://textalyzer.app/" />

                <meta name="twitter:title" content="Textalyzer - AI-Powered Text Analyzer" />

                <meta name="twitter:description" content="Analyze your text instantly with AI-powered readability scores, sentiment analysis, grammar suggestions, and professional writing improvements." />

                <link rel="canonical" href="https://textalyzer.app/" />

            </Helmet>

            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">

                <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-700/60 sticky top-0 z-20">

                    <div className="max-w-6xl mx-auto px-4">

                        <div className="flex items-center justify-between h-14">

                            <motion.div className="flex items-center gap-3" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>

                                <div className="flex items-center gap-2">

                                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">

                                        <Sparkles className="w-4 h-4 text-white" />

                                    </div>

                                    <h1 className="text-base font-bold bg-gradient-to-r from-indigo-700 to-purple-600 bg-clip-text text-transparent">Textalyzer</h1>

                                </div>

                                <div className="h-5 w-px bg-slate-200" />

                                {user ? (

                                    <div className="flex items-center gap-1">

                                        <span className="text-xs text-slate-600 hidden sm:inline">{user.name}</span>

                                        <Button variant="ghost" size="icon" onClick={handleLogout} className="h-8 w-8 text-indigo-600 hover:bg-indigo-50" title="Logout">

                                            <LogOut className="w-4 h-4" />

                                        </Button>

                                    </div>

                                ) : (

                                    <AuthDialog onAuthChange={handleAuthChange} />

                                )}

                            </motion.div>

                            {stats.totalWords > 0 && (

                                <motion.div className="hidden md:flex items-center gap-3 text-xs" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}>

                                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 rounded-full">

                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />

                                        <span className="text-indigo-700 font-medium">{stats.totalWords} words</span>

                                    </div>

                                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 rounded-full">

                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />

                                        <span className="text-purple-700 font-medium">{stats.totalSentences} sentences</span>

                                    </div>

                                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-violet-50 rounded-full">

                                        <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />

                                        <span className="text-violet-700 font-medium">{readingTime} min</span>

                                    </div>

                                    <span className={`px-2.5 py-1 rounded-full font-medium ${readability?.fleschReading >= 60 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>

                                        {readability?.audienceLevel || 'N/A'}

                                    </span>

                                </motion.div>

                            )}

                            <div className="flex items-center gap-0.5 sm:gap-1">

                                <HistoryPanel analyses={[]} onLoad={handleLoadAnalysis} onDelete={() => { }} onToggleFavorite={() => { }} isLoading={false} isAuthenticated={isAuthenticated} />

                                <ExportPanel text={text} stats={stats} wordFrequency={wordFrequency} readability={readability} sentiment={sentiment} keywords={keywords} suggestions={localSuggestions} />

                                <SaveAnalysisDialog onSave={handleSaveAnalysis} disabled={stats.totalWords === 0} isSaving={isSaving} />

                                <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-400 dark:hover:text-indigo-400 dark:hover:bg-indigo-950" title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>

                                    {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />

                                </Button>

                                <SettingsPanel preferences={preferences} onUpdate={handleUpdatePreferences} writingStyle={writingStyle} onStyleChange={setWritingStyle} />

                                {text && (

                                    <Button variant="outline" size="sm" onClick={handleClear} className="h-8 px-3 border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 hover:border-red-300 font-medium gap-1.5 transition-all">

                                        <Eraser className="w-3.5 h-3.5" />

                                        <span className="hidden sm:inline">Clear</span>

                                    </Button>

                                )}

                            </div>

                        </div>

                    </div>

                </header>

                <main className="max-w-6xl mx-auto px-4 py-5">

                    <div className="grid lg:grid-cols-2 gap-5">

                        <motion.div className="space-y-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

                            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-4 shadow-sm hover:shadow-md transition-shadow">

                                <TextInputWithHighlights onTextChange={setText} text={text} issues={localSuggestions} />

                            </div>

                            <Collapsible open={metricsOpen} onOpenChange={setMetricsOpen}>

                                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm overflow-hidden">

                                    <CollapsibleTrigger className="w-full px-4 py-3 flex items-center justify-between hover:bg-indigo-50/50 dark:hover:bg-indigo-950/50 transition-colors">

                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Detailed Metrics</span>

                                        <motion.div animate={{ rotate: metricsOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>

                                            <ChevronDown className="w-4 h-4 text-slate-400" />

                                        </motion.div>

                                    </CollapsibleTrigger>

                                    <CollapsibleContent>

                                        <motion.div className="p-4 pt-0 space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>

                                            <div className="grid grid-cols-2 gap-3">

                                                <ReadabilityPanel readability={readability} />

                                                <SentimentPanel sentiment={sentiment} />

                                            </div>

                                            <KeywordsPanel keywords={keywords} />

                                        </motion.div>

                                    </CollapsibleContent>

                                </div>

                            </Collapsible>

                        </motion.div>

                        <motion.div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm overflow-hidden" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>

                            <Tabs value={activeTab} onValueChange={setActiveTab}>

                                <div className="border-b border-slate-200/60 px-4 pt-3 bg-gradient-to-r from-indigo-50/50 to-purple-50/50">

                                    <TabsList className="bg-white/80 p-0.5 rounded-xl h-9 grid grid-cols-5 w-full shadow-sm">

                                        <TabsTrigger value="suggestions" className="text-xs rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all">Suggestions</TabsTrigger>

                                        <TabsTrigger value="rewrite" className="text-xs rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"><Sliders className="w-3 h-3 mr-1" /> Tone</TabsTrigger>

                                        <TabsTrigger value="analytics" className="text-xs rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"><Activity className="w-3 h-3 mr-1" /> Flow</TabsTrigger>

                                        <TabsTrigger value="stats" className="text-xs rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"><BarChart3 className="w-3 h-3 mr-1" /> Stats</TabsTrigger>

                                        <TabsTrigger value="grammar" className="text-xs rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"><CheckCircle2 className="w-3 h-3 mr-1" /> Grammar</TabsTrigger>

                                    </TabsList>

                                </div>

                                <div className="p-4 min-h-[400px] max-h-[600px] overflow-y-auto custom-scrollbar">

                                    <TabsContent value="suggestions" className="mt-0">

                                        <QuickFixSuggestions suggestions={localSuggestions} onApplyFix={handleApplyFix} onApplyAllFixes={handleApplyAllFixes} />

                                    </TabsContent>

                                    <TabsContent value="rewrite" className="mt-0 space-y-4">

                                        <ToneSlider text={text} onApply={setText} />

                                    </TabsContent>

                                    <TabsContent value="analytics" className="mt-0 space-y-5">

                                        <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 rounded-xl p-4 border border-indigo-100/50">

                                            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2"><Activity className="w-4 h-4 text-indigo-500" />Sentence Length Variation</h3>

                                            <SentenceLengthChart text={text} />

                                        </div>

                                        <div className="bg-gradient-to-br from-purple-50/50 to-violet-50/50 rounded-xl p-4 border border-purple-100/50">

                                            <h3 className="text-sm font-semibold text-slate-700 mb-3">Paragraph Structure</h3>

                                            <ParagraphStructure text={text} />

                                        </div>

                                        <div className="bg-gradient-to-br from-violet-50/50 to-pink-50/50 rounded-xl p-4 border border-violet-100/50">

                                            <h3 className="text-sm font-semibold text-slate-700 mb-3">Reading Flow Heatmap</h3>

                                            <ReadingFlowHeatmap text={text} />

                                        </div>

                                    </TabsContent>

                                    <TabsContent value="stats" className="mt-0 space-y-4">

                                        <StatsCards stats={stats} score={overallScore} />

                                        <div className="grid grid-cols-2 gap-4">

                                            <WordFrequencyTable wordFrequency={wordFrequency} />

                                            <StatsChart stats={stats} />

                                        </div>

                                        <ResultsSummary stats={stats} wordFrequency={wordFrequency} readability={readability} sentiment={sentiment} />

                                    </TabsContent>

                                    <TabsContent value="grammar" className="mt-0">

                                        <GrammarChecker 

                                            text={text} 

                                            onApplyFix={(original, suggested) => {

                                                // Handle applying the fix to the text

                                                setText(text.replace(original, suggested));

                                            }}

                                        />

                                    </TabsContent>

                                </div>

                            </Tabs>

                        </motion.div>

                    </div>

                </main>

            </div>

        </>

    );

}
