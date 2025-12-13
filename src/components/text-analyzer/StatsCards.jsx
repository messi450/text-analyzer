import React from 'react';
import { motion } from 'framer-motion';
import { 
    LetterText, 
    FileText, 
    AlignLeft, 
    Pilcrow,
    Sparkles,
    Clock,
    Award
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Get score color and label
function getScoreInfo(score) {
    if (score >= 90) return { color: 'from-emerald-500 to-green-500', label: 'Outstanding', emoji: '🌟', bg: 'bg-emerald-50', text: 'text-emerald-700' };
    if (score >= 80) return { color: 'from-emerald-500 to-teal-500', label: 'Excellent', emoji: '✨', bg: 'bg-emerald-50', text: 'text-emerald-700' };
    if (score >= 70) return { color: 'from-green-500 to-emerald-500', label: 'Very Good', emoji: '👍', bg: 'bg-green-50', text: 'text-green-700' };
    if (score >= 60) return { color: 'from-lime-500 to-green-500', label: 'Good', emoji: '👌', bg: 'bg-lime-50', text: 'text-lime-700' };
    if (score >= 50) return { color: 'from-yellow-500 to-amber-500', label: 'Fair', emoji: '📝', bg: 'bg-yellow-50', text: 'text-yellow-700' };
    if (score >= 40) return { color: 'from-orange-500 to-amber-500', label: 'Needs Work', emoji: '📚', bg: 'bg-orange-50', text: 'text-orange-700' };
    return { color: 'from-red-500 to-orange-500', label: 'Needs Improvement', emoji: '✏️', bg: 'bg-red-50', text: 'text-red-700' };
}

// Format large numbers
function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
}

const StatCard = ({ icon: Icon, label, value, subValue, gradient, delay, tooltip }) => (
    <TooltipProvider>
        <Tooltip>
            <TooltipTrigger asChild>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay }}
                    className="relative overflow-hidden bg-white dark:bg-slate-800 rounded-xl p-3 sm:p-4 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 group cursor-default min-w-0"
                >
                    <div className={`absolute top-0 right-0 w-16 h-16 ${gradient} opacity-10 dark:opacity-20 rounded-full transform translate-x-4 -translate-y-4 group-hover:scale-150 transition-transform duration-500`} />
                    <div className="relative min-w-0">
                        <div className={`w-8 h-8 sm:w-9 sm:h-9 ${gradient} rounded-lg flex items-center justify-center mb-2 shadow-md flex-shrink-0`}>
                            <Icon className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 mb-0.5 truncate">{label}</p>
                        <motion.p 
                            key={value}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 truncate"
                            title={typeof value === 'number' ? value.toLocaleString() : value}
                        >
                            {typeof value === 'number' ? formatNumber(value) : value}
                        </motion.p>
                        {subValue && (
                            <p className="text-[9px] sm:text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate" title={subValue}>{subValue}</p>
                        )}
                    </div>
                </motion.div>
            </TooltipTrigger>
            {tooltip && (
                <TooltipContent>
                    <p className="text-xs">{tooltip}</p>
                    {typeof value === 'number' && value >= 1000 && (
                        <p className="text-xs text-slate-500">Exact: {value.toLocaleString()}</p>
                    )}
                </TooltipContent>
            )}
        </Tooltip>
    </TooltipProvider>
);

// Score Card with circular progress
const ScoreCard = ({ score, delay }) => {
    const info = getScoreInfo(score);
    const circumference = 2 * Math.PI * 38; // radius = 38
    const progress = ((100 - score) / 100) * circumference;
    
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay }}
                        className={`relative overflow-hidden bg-gradient-to-br ${info.color} rounded-xl p-4 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-default`}
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full transform translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform duration-500" />
                        <div className="relative flex items-center gap-3">
                            {/* Circular Progress */}
                            <div className="relative w-20 h-20 flex-shrink-0">
                                <svg className="w-20 h-20 transform -rotate-90">
                                    {/* Background circle */}
                                    <circle
                                        cx="40"
                                        cy="40"
                                        r="38"
                                        stroke="rgba(255,255,255,0.3)"
                                        strokeWidth="6"
                                        fill="transparent"
                                    />
                                    {/* Progress circle */}
                                    <motion.circle
                                        cx="40"
                                        cy="40"
                                        r="38"
                                        stroke="white"
                                        strokeWidth="6"
                                        fill="transparent"
                                        strokeLinecap="round"
                                        strokeDasharray={circumference}
                                        initial={{ strokeDashoffset: circumference }}
                                        animate={{ strokeDashoffset: progress }}
                                        transition={{ duration: 1, delay: delay + 0.3, ease: "easeOut" }}
                                    />
                                </svg>
                                {/* Score number */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <motion.span 
                                        className="text-2xl font-bold text-white"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: delay + 0.5, type: "spring" }}
                                    >
                                        {score}
                                    </motion.span>
                                    <span className="text-[10px] text-white/80">/100</span>
                                </div>
                            </div>
                            
                            {/* Score Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                    <Award className="w-4 h-4 text-white flex-shrink-0" />
                                    <span className="text-xs font-medium text-white/80">Score</span>
                                </div>
                                <p className="text-lg font-bold text-white mb-0.5 truncate">
                                    {info.emoji} {info.label}
                                </p>
                                <p className="text-[10px] text-white/70 hidden sm:block">
                                    Readability • Structure • Vocabulary
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                    <p className="text-xs font-medium mb-1">Score Breakdown:</p>
                    <ul className="text-xs text-slate-600 space-y-0.5">
                        <li>• Readability (25 pts): How easy to read</li>
                        <li>• Structure (20 pts): Sentence variety</li>
                        <li>• Vocabulary (20 pts): Word diversity</li>
                        <li>• Clarity (20 pts): Issues found</li>
                        <li>• Depth (15 pts): Content length</li>
                    </ul>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

export default function StatsCards({ stats, score = 0 }) {
    // Calculate reading time (avg 200 words per minute)
    const readingTime = Math.max(1, Math.ceil(stats.totalWords / 200));
    // Calculate speaking time (avg 130 words per minute)
    const speakingTime = Math.max(1, Math.ceil(stats.totalWords / 130));

    const cards = [
        {
            icon: LetterText,
            label: 'Characters',
            value: stats.totalChars,
            subValue: `${formatNumber(stats.totalCharsNoSpaces)} no spaces`,
            gradient: 'bg-gradient-to-br from-blue-500 to-cyan-500',
            tooltip: 'Total character count including all spaces and punctuation'
        },
        {
            icon: FileText,
            label: 'Words',
            value: stats.totalWords,
            gradient: 'bg-gradient-to-br from-indigo-500 to-blue-500',
            tooltip: 'Words separated by spaces, punctuation excluded'
        },
        {
            icon: AlignLeft,
            label: 'Sentences',
            value: stats.totalSentences,
            gradient: 'bg-gradient-to-br from-emerald-500 to-teal-500',
            tooltip: 'Sentences ending with period, exclamation, or question mark'
        },
        {
            icon: Pilcrow,
            label: 'Paragraphs',
            value: stats.totalParagraphs,
            gradient: 'bg-gradient-to-br from-amber-500 to-orange-500',
            tooltip: 'Text blocks separated by empty lines'
        },
        {
            icon: Sparkles,
            label: 'Unique',
            value: stats.uniqueWords,
            gradient: 'bg-gradient-to-br from-pink-500 to-rose-500',
            tooltip: 'Distinct words after removing duplicates'
        },
        {
            icon: Clock,
            label: 'Read Time',
            value: `${readingTime}m`,
            subValue: `${speakingTime}m speak`,
            gradient: 'bg-gradient-to-br from-violet-500 to-purple-500',
            tooltip: 'Based on average reading speed of 200 words/min'
        }
    ];

    return (
        <div className="space-y-3">
            {/* Combined Layout: Score + Stats in Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3">
                {/* Overall Score Card - Takes 1 col on mobile, 2 on larger */}
                {stats.totalWords > 0 && (
                    <div className="col-span-3 sm:col-span-2 lg:col-span-1 lg:row-span-2">
                        <ScoreCard score={score} delay={0} />
                    </div>
                )}
                
                {/* Stats Cards */}
                {cards.map((card, index) => (
                    <StatCard
                        key={card.label}
                        {...card}
                        delay={(index + 1) * 0.05}
                    />
                ))}
            </div>
        </div>
    );
}
