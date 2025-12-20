import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { toast } from 'sonner';
import {
    Sparkles,
    Trash2,
    BarChart3,
    Activity,
    Sliders,
    LogOut,
    Eraser,
    Sun,
    Moon,
    CheckCircle2,
    Brain,
    Loader2,
    ChevronDown,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

import GrammarChecker from '@/components/text-analyzer/GrammarChecker';
import AIWritingAssistant from '@/components/text-analyzer/AIWritingAssistant';
import TextInputWithHighlights from '@/components/text-analyzer/TextInputWithHighlights';
import QuickFixSuggestions from '@/components/text-analyzer/QuickFixSuggestions';
import StatsCards from '@/components/text-analyzer/StatsCards';
import WordFrequencyTable from '@/components/text-analyzer/WordFrequencyTable';
import StatsChart from '@/components/text-analyzer/StatsChart';
import ResultsSummary from '@/components/text-analyzer/ResultsSummary';
import ReadabilityPanel from '@/components/text-analyzer/ReadabilityPanel';
import SentimentPanel from '@/components/text-analyzer/SentimentPanel';
import KeywordsPanel from '@/components/text-analyzer/KeywordsPanel';
import ExportPanel from '@/components/text-analyzer/ExportPanel';
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
import { useTextAnalysis } from '@/hooks/useTextAnalysis';
import { useTextFixes } from '@/hooks/useTextFixes';
import { useAISuggestions } from '@/hooks/useAISuggestions';
import { calculateReadingTime } from '@/utils/textAnalyzer';
import { DEFAULT_PREFERENCES } from '@/utils/constants';

// ============================================

// Main Component

// ============================================

function TextAnalyzerPageContent() {

    const { theme, toggleTheme } = useTheme();

    const [text, setText] = useState('');

    const [writingStyle, setWritingStyle] = useState('casual');

    const [language, setLanguage] = useState('en');

    const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);

    const [isSaving, setIsSaving] = useState(false);

    const [activeTab, setActiveTab] = useState('suggestions');

    const [metricsOpen, setMetricsOpen] = useState(false);

    const [user, setUser] = useState(null);
    const [aiSuggestions, setAiSuggestions] = useState([]);
    const [isFetchingAiSuggestions, setIsFetchingAiSuggestions] = useState(false);


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

    // Use custom hooks for analysis and AI suggestions
    // Note: We need to get stats first, then use them for AI suggestions
    const tempAnalysis = useTextAnalysis(text, writingStyle, []);
    const { stats } = tempAnalysis;
    
    const { aiSuggestions, isFetchingAiSuggestions, fetchAiSuggestions } = useAISuggestions(text, stats, writingStyle);
    const analysisData = useTextAnalysis(text, writingStyle, aiSuggestions);
    const { wordFrequency, readability, sentiment, keywords, localSuggestions, overallScore } = analysisData;
    const { applyFix, applyAllFixes, applySuggestion, applyGrammarFix } = useTextFixes(text, setText);

    const handleClear = useCallback(() => setText(''), [setText]);

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



    const readingTime = calculateReadingTime(stats.totalWords);

    const isAuthenticated = !!user;

    return (

        <>

            <Helmet>

                <title>Text Analyzer AI – Free Readability, Grammar & Sentiment Checker</title>

                <meta name="description" content="Free online text analyzer. Instantly check readability, grammar, sentiment, and word count. The #1 AI-powered writing enhancement tool." />

                <meta name="keywords" content="text analyzer, readability checker, grammar check, sentiment analysis, free text tool, seo writing, word counter, ai writing assistant" />

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

                                    {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}

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

                                    <TabsList className="bg-white/80 p-0.5 rounded-xl h-9 grid grid-cols-6 w-full shadow-sm">

                                        <TabsTrigger value="suggestions" className="text-xs rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all">Suggestions</TabsTrigger>

                                        <TabsTrigger value="rewrite" className="text-xs rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"><Sliders className="w-3 h-3 mr-1" /> Tone</TabsTrigger>

                                        <TabsTrigger value="analytics" className="text-xs rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"><Activity className="w-3 h-3 mr-1" /> Flow</TabsTrigger>

                                        <TabsTrigger value="stats" className="text-xs rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"><BarChart3 className="w-3 h-3 mr-1" /> Stats</TabsTrigger>

                                        <TabsTrigger value="ai" className="text-xs rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"><Brain className="w-3 h-3 mr-1" /> AI</TabsTrigger>

                                        <TabsTrigger value="grammar" className="text-xs rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"><CheckCircle2 className="w-3 h-3 mr-1" /> Grammar</TabsTrigger>

                                    </TabsList>

                                </div>

                                <div className="p-4 min-h-[400px] max-h-[600px] overflow-y-auto custom-scrollbar">

                                    <TabsContent value="suggestions" className="mt-0 space-y-4">
                                        <div className="flex justify-center pt-2">
                                            <Button
                                                onClick={fetchAiSuggestions}
                                                disabled={isFetchingAiSuggestions || !text}
                                                variant="outline"
                                                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 border-none shadow-md"
                                            >
                                                {isFetchingAiSuggestions ? (
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                ) : (
                                                    <Sparkles className="w-4 h-4 mr-2" />
                                                )}
                                                {isFetchingAiSuggestions ? 'Fetching AI Suggestions...' : 'Get AI-Powered Suggestions'}
                                            </Button>
                                        </div>
                                        <QuickFixSuggestions
                                            suggestions={localSuggestions}
                                            onApplyFix={applyFix}
                                            onApplyAllFixes={applyAllFixes}
                                        />

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

                                    <TabsContent value="ai" className="mt-0">
                                        <AIWritingAssistant
                                            text={text}
                                            writingStyle={writingStyle}
                                            onApplySuggestion={applySuggestion}
                                        />
                                    </TabsContent>

                                    <TabsContent value="grammar" className="mt-0">
                                        <GrammarChecker
                                            text={text}
                                            onApplyFix={applyGrammarFix}
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

// Wrap with HelmetProvider
export default function TextAnalyzerPage() {
    return (
        <HelmetProvider>
            <TextAnalyzerPageContent />
        </HelmetProvider>
    );
}
