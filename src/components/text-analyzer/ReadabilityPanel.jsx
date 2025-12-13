import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Users, Gauge, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Readability score calculations
export function calculateReadability(text, stats) {
    if (!text || stats.totalWords === 0) {
        return {
            fleschKincaid: 0,
            fleschReading: 0,
            gradeLevel: 'N/A',
            avgWordLength: 0,
            avgSentenceLength: 0,
            complexWordPercent: 0,
            audienceLevel: 'N/A'
        };
    }

    const words = text.toLowerCase().replace(/[.,!?;:'"()\-\[\]{}]/g, '').split(/\s+/).filter(w => w.length > 0);
    const syllableCount = words.reduce((acc, word) => acc + countSyllables(word), 0);
    
    const avgWordLength = stats.totalCharsNoSpaces / stats.totalWords;
    const avgSentenceLength = stats.totalWords / Math.max(1, stats.totalSentences);
    const avgSyllablesPerWord = syllableCount / stats.totalWords;
    
    // Complex words (3+ syllables)
    const complexWords = words.filter(w => countSyllables(w) >= 3).length;
    const complexWordPercent = (complexWords / stats.totalWords) * 100;

    // Flesch Reading Ease (0-100, higher is easier)
    const fleschReading = Math.max(0, Math.min(100, 
        206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord)
    ));

    // Flesch-Kincaid Grade Level
    const fleschKincaid = Math.max(0, 
        (0.39 * avgSentenceLength) + (11.8 * avgSyllablesPerWord) - 15.59
    );

    // Determine grade level and audience
    let gradeLevel, audienceLevel;
    if (fleschReading >= 90) { gradeLevel = '5th Grade'; audienceLevel = 'Very Easy'; }
    else if (fleschReading >= 80) { gradeLevel = '6th Grade'; audienceLevel = 'Easy'; }
    else if (fleschReading >= 70) { gradeLevel = '7th Grade'; audienceLevel = 'Fairly Easy'; }
    else if (fleschReading >= 60) { gradeLevel = '8-9th Grade'; audienceLevel = 'Standard'; }
    else if (fleschReading >= 50) { gradeLevel = '10-12th Grade'; audienceLevel = 'Fairly Difficult'; }
    else if (fleschReading >= 30) { gradeLevel = 'College'; audienceLevel = 'Difficult'; }
    else { gradeLevel = 'Graduate'; audienceLevel = 'Very Difficult'; }

    return {
        fleschKincaid: Math.round(fleschKincaid * 10) / 10,
        fleschReading: Math.round(fleschReading),
        gradeLevel,
        avgWordLength: Math.round(avgWordLength * 10) / 10,
        avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
        complexWordPercent: Math.round(complexWordPercent),
        audienceLevel
    };
}

function countSyllables(word) {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    
    const syllables = word.match(/[aeiouy]{1,2}/g);
    return syllables ? syllables.length : 1;
}

const ScoreGauge = ({ score, label, color, max = 100 }) => (
    <div className="text-center">
        <div className="relative w-20 h-20 mx-auto mb-2">
            <svg className="w-20 h-20 transform -rotate-90">
                <circle
                    className="text-slate-100"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r="32"
                    cx="40"
                    cy="40"
                />
                <motion.circle
                    className={color}
                    strokeWidth="8"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="32"
                    cx="40"
                    cy="40"
                    initial={{ strokeDasharray: "0 201" }}
                    animate={{ strokeDasharray: `${(score / max) * 201} 201` }}
                    transition={{ duration: 1, delay: 0.3 }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-slate-800">{score}</span>
            </div>
        </div>
        <p className="text-xs font-medium text-slate-600">{label}</p>
    </div>
);

export default function ReadabilityPanel({ readability }) {
    if (!readability || readability.gradeLevel === 'N/A') {
        return (
            <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Gauge className="w-7 h-7 text-slate-400" />
                </div>
                <p className="text-slate-500">Enter text to see readability analysis</p>
            </div>
        );
    }

    const getScoreColor = (score) => {
        if (score >= 70) return 'text-emerald-500';
        if (score >= 50) return 'text-amber-500';
        return 'text-red-500';
    };

    const getAudienceIcon = (level) => {
        if (level === 'Very Easy' || level === 'Easy') return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
        if (level === 'Fairly Easy' || level === 'Standard') return <Info className="w-4 h-4 text-blue-500" />;
        return <AlertCircle className="w-4 h-4 text-amber-500" />;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
        >
            <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                        <Gauge className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-slate-800">Readability Analysis</h3>
                        <p className="text-xs text-slate-500">How easy is your text to read?</p>
                    </div>
                </div>
            </div>
            
            <div className="p-5">
                {/* Main Scores */}
                <div className="flex justify-around mb-6">
                    <ScoreGauge 
                        score={readability.fleschReading} 
                        label="Reading Ease" 
                        color={getScoreColor(readability.fleschReading)}
                    />
                    <ScoreGauge 
                        score={readability.fleschKincaid} 
                        label="Grade Level" 
                        color="text-indigo-500"
                        max={20}
                    />
                </div>

                {/* Audience Level */}
                <div className="bg-slate-50 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-slate-500" />
                            <span className="text-sm font-medium text-slate-700">Target Audience</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {getAudienceIcon(readability.audienceLevel)}
                            <span className="text-sm font-semibold text-slate-800">{readability.audienceLevel}</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-slate-500" />
                            <span className="text-sm font-medium text-slate-700">Education Level</span>
                        </div>
                        <span className="text-sm font-semibold text-slate-800">{readability.gradeLevel}</span>
                    </div>
                </div>

                {/* Metrics */}
                <div className="space-y-3">
                    <TooltipProvider>
                        <div className="flex items-center justify-between text-sm">
                            <Tooltip>
                                <TooltipTrigger className="text-slate-600 cursor-help">Avg. Word Length</TooltipTrigger>
                                <TooltipContent><p>Average characters per word</p></TooltipContent>
                            </Tooltip>
                            <span className="font-medium text-slate-800">{readability.avgWordLength} chars</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <Tooltip>
                                <TooltipTrigger className="text-slate-600 cursor-help">Avg. Sentence Length</TooltipTrigger>
                                <TooltipContent><p>Average words per sentence</p></TooltipContent>
                            </Tooltip>
                            <span className="font-medium text-slate-800">{readability.avgSentenceLength} words</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <Tooltip>
                                <TooltipTrigger className="text-slate-600 cursor-help">Complex Words</TooltipTrigger>
                                <TooltipContent><p>Words with 3+ syllables</p></TooltipContent>
                            </Tooltip>
                            <span className="font-medium text-slate-800">{readability.complexWordPercent}%</span>
                        </div>
                    </TooltipProvider>
                </div>
            </div>
        </motion.div>
    );
}