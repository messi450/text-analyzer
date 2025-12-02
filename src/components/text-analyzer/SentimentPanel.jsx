import React from 'react';
import { motion } from 'framer-motion';
import { Smile, Frown, Meh, TrendingUp, TrendingDown, Minus, Heart } from 'lucide-react';

// Simple sentiment analysis using word lists
const POSITIVE_WORDS = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'awesome', 'best', 'love', 'happy', 'joy', 'beautiful', 'perfect', 'brilliant', 'outstanding', 'superb', 'nice', 'positive', 'success', 'successful', 'win', 'winner', 'excited', 'exciting', 'incredible', 'remarkable', 'impressive', 'delightful', 'pleasant', 'cheerful', 'glad', 'pleased', 'thankful', 'grateful', 'blessed', 'hopeful', 'optimistic', 'confident', 'proud', 'satisfied', 'content', 'peaceful', 'calm', 'relaxed', 'comfortable', 'safe', 'secure', 'strong', 'healthy', 'fresh', 'clean', 'bright', 'warm', 'friendly', 'kind', 'generous', 'helpful', 'supportive', 'encouraging', 'inspiring', 'motivated', 'energetic', 'enthusiastic', 'passionate', 'creative', 'innovative', 'smart', 'clever', 'wise', 'talented', 'skilled', 'capable', 'effective', 'efficient', 'productive', 'valuable', 'important', 'meaningful', 'significant', 'special', 'unique', 'rare', 'precious', 'lovely', 'charming', 'elegant', 'graceful'];

const NEGATIVE_WORDS = ['bad', 'terrible', 'awful', 'horrible', 'poor', 'worst', 'hate', 'sad', 'angry', 'upset', 'disappointed', 'frustrating', 'annoying', 'boring', 'dull', 'ugly', 'wrong', 'failure', 'failed', 'lose', 'loser', 'negative', 'problem', 'issue', 'difficult', 'hard', 'impossible', 'painful', 'hurt', 'damage', 'broken', 'weak', 'sick', 'tired', 'exhausted', 'stressed', 'worried', 'anxious', 'nervous', 'scared', 'afraid', 'fear', 'dangerous', 'risky', 'unsafe', 'unhappy', 'unhealthy', 'dirty', 'dark', 'cold', 'lonely', 'alone', 'empty', 'meaningless', 'useless', 'worthless', 'hopeless', 'helpless', 'desperate', 'confused', 'lost', 'stuck', 'trapped', 'limited', 'restricted', 'slow', 'late', 'wrong', 'mistake', 'error', 'fault', 'blame', 'guilt', 'shame', 'regret', 'sorry', 'miss', 'lack', 'need', 'want', 'crave', 'envy', 'jealous', 'greedy', 'selfish', 'rude', 'mean', 'cruel', 'harsh', 'aggressive', 'violent', 'hostile', 'unfriendly', 'unkind', 'ungrateful', 'disrespectful', 'dishonest', 'fake', 'false', 'lie', 'cheat', 'steal', 'destroy', 'ruin', 'waste'];

export function analyzeSentiment(text) {
    if (!text || text.trim().length === 0) {
        return {
            score: 0,
            label: 'Neutral',
            positive: 0,
            negative: 0,
            neutral: 0,
            emotionalWords: []
        };
    }

    const words = text.toLowerCase().replace(/[.,!?;:'"()\-\[\]{}]/g, '').split(/\s+/).filter(w => w.length > 0);
    
    let positiveCount = 0;
    let negativeCount = 0;
    const emotionalWords = [];

    words.forEach(word => {
        if (POSITIVE_WORDS.includes(word)) {
            positiveCount++;
            if (!emotionalWords.find(w => w.word === word)) {
                emotionalWords.push({ word, type: 'positive' });
            }
        } else if (NEGATIVE_WORDS.includes(word)) {
            negativeCount++;
            if (!emotionalWords.find(w => w.word === word)) {
                emotionalWords.push({ word, type: 'negative' });
            }
        }
    });

    const totalEmotional = positiveCount + negativeCount;
    const neutralCount = words.length - totalEmotional;
    
    // Calculate score (-100 to 100)
    let score = 0;
    if (totalEmotional > 0) {
        score = Math.round(((positiveCount - negativeCount) / totalEmotional) * 100);
    }

    // Determine label
    let label;
    if (score >= 30) label = 'Positive';
    else if (score >= 10) label = 'Slightly Positive';
    else if (score <= -30) label = 'Negative';
    else if (score <= -10) label = 'Slightly Negative';
    else label = 'Neutral';

    return {
        score,
        label,
        positive: positiveCount,
        negative: negativeCount,
        neutral: neutralCount,
        emotionalWords: emotionalWords.slice(0, 10)
    };
}

export default function SentimentPanel({ sentiment }) {
    if (!sentiment || sentiment.label === 'Neutral' && sentiment.positive === 0 && sentiment.negative === 0) {
        return (
            <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-7 h-7 text-slate-400" />
                </div>
                <p className="text-slate-500">Enter text to see sentiment analysis</p>
            </div>
        );
    }

    const getSentimentIcon = () => {
        if (sentiment.score >= 10) return <Smile className="w-8 h-8 text-emerald-500" />;
        if (sentiment.score <= -10) return <Frown className="w-8 h-8 text-red-500" />;
        return <Meh className="w-8 h-8 text-amber-500" />;
    };

    const getSentimentColor = () => {
        if (sentiment.score >= 10) return 'from-emerald-500 to-teal-500';
        if (sentiment.score <= -10) return 'from-red-500 to-rose-500';
        return 'from-amber-500 to-yellow-500';
    };

    const getTrendIcon = () => {
        if (sentiment.score >= 10) return <TrendingUp className="w-4 h-4 text-emerald-500" />;
        if (sentiment.score <= -10) return <TrendingDown className="w-4 h-4 text-red-500" />;
        return <Minus className="w-4 h-4 text-amber-500" />;
    };

    // Calculate percentages
    const total = sentiment.positive + sentiment.negative + sentiment.neutral;
    const positivePercent = total > 0 ? Math.round((sentiment.positive / total) * 100) : 0;
    const negativePercent = total > 0 ? Math.round((sentiment.negative / total) * 100) : 0;
    const neutralPercent = 100 - positivePercent - negativePercent;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
        >
            <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 bg-gradient-to-br ${getSentimentColor()} rounded-xl flex items-center justify-center`}>
                        <Heart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-slate-800">Sentiment Analysis</h3>
                        <p className="text-xs text-slate-500">Emotional tone of your text</p>
                    </div>
                </div>
            </div>
            
            <div className="p-5">
                {/* Main Sentiment Display */}
                <div className="text-center mb-5">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-50 mb-3">
                        {getSentimentIcon()}
                    </div>
                    <div className="flex items-center justify-center gap-2">
                        {getTrendIcon()}
                        <span className="text-xl font-bold text-slate-800">{sentiment.label}</span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">Score: {sentiment.score > 0 ? '+' : ''}{sentiment.score}</p>
                </div>

                {/* Sentiment Bar */}
                <div className="mb-5">
                    <div className="flex h-3 rounded-full overflow-hidden bg-slate-100">
                        <motion.div 
                            className="bg-emerald-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${positivePercent}%` }}
                            transition={{ duration: 0.8 }}
                        />
                        <motion.div 
                            className="bg-slate-300"
                            initial={{ width: 0 }}
                            animate={{ width: `${neutralPercent}%` }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                        />
                        <motion.div 
                            className="bg-red-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${negativePercent}%` }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        />
                    </div>
                    <div className="flex justify-between mt-2 text-xs">
                        <span className="text-emerald-600">Positive {positivePercent}%</span>
                        <span className="text-slate-500">Neutral {neutralPercent}%</span>
                        <span className="text-red-600">Negative {negativePercent}%</span>
                    </div>
                </div>

                {/* Emotional Words */}
                {sentiment.emotionalWords.length > 0 && (
                    <div>
                        <p className="text-xs font-medium text-slate-500 mb-2">Key emotional words:</p>
                        <div className="flex flex-wrap gap-1.5">
                            {sentiment.emotionalWords.map((item, idx) => (
                                <span 
                                    key={idx}
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        item.type === 'positive' 
                                            ? 'bg-emerald-50 text-emerald-700' 
                                            : 'bg-red-50 text-red-700'
                                    }`}
                                >
                                    {item.word}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}