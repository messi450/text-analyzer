import React from 'react';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Eye, Zap } from 'lucide-react';

export default function ReadingFlowHeatmap({ text }) {
    if (!text || text.length < 20) {
        return (
            <div className="flex items-center justify-center h-24 text-slate-400 text-sm">
                Enter more text to see reading flow
            </div>
        );
    }

    // Split text into chunks and analyze complexity
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    const analyzeComplexity = (sentence) => {
        const words = sentence.split(/\s+/).filter(w => w.length > 0);
        const wordCount = words.length;
        const avgWordLen = words.reduce((sum, w) => sum + w.length, 0) / Math.max(1, wordCount);
        const complexWords = words.filter(w => w.length > 8).length;
        
        // Complexity score: 0-100
        let score = 0;
        score += Math.min(40, wordCount * 1.5); // Length factor
        score += Math.min(30, avgWordLen * 4);   // Word complexity
        score += Math.min(30, complexWords * 8); // Complex word ratio
        
        return Math.min(100, Math.round(score));
    };

    const chunks = sentences.map((s, i) => ({
        text: s.trim(),
        complexity: analyzeComplexity(s),
        index: i
    }));

    const getHeatColor = (complexity) => {
        if (complexity < 30) return 'bg-blue-200 hover:bg-blue-300';
        if (complexity < 50) return 'bg-emerald-200 hover:bg-emerald-300';
        if (complexity < 70) return 'bg-amber-200 hover:bg-amber-300';
        return 'bg-red-200 hover:bg-red-300';
    };

    const getFlowLabel = (complexity) => {
        if (complexity < 30) return 'Easy flow';
        if (complexity < 50) return 'Smooth';
        if (complexity < 70) return 'Moderate';
        return 'Complex';
    };

    const avgComplexity = Math.round(chunks.reduce((sum, c) => sum + c.complexity, 0) / chunks.length);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
        >
            {/* Header */}
            <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-600">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Reading flow analysis</span>
                </div>
                <div className="flex items-center gap-1 text-slate-500">
                    <Zap className="w-3 h-3" />
                    <span>Avg complexity: <strong>{avgComplexity}</strong></span>
                </div>
            </div>

            {/* Heatmap grid */}
            <TooltipProvider>
                <div className="flex flex-wrap gap-1">
                    {chunks.slice(0, 30).map((chunk, idx) => (
                        <Tooltip key={idx}>
                            <TooltipTrigger asChild>
                                <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.2, delay: idx * 0.02 }}
                                    className={`w-6 h-6 rounded cursor-pointer transition-colors ${getHeatColor(chunk.complexity)}`}
                                />
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                                <p className="text-xs font-medium mb-1">
                                    Sentence {idx + 1} • {getFlowLabel(chunk.complexity)}
                                </p>
                                <p className="text-xs text-slate-500 line-clamp-2">{chunk.text}</p>
                                <div className="mt-1.5 flex items-center gap-2">
                                    <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-blue-400 via-emerald-400 to-red-400"
                                            style={{ width: `${chunk.complexity}%` }}
                                        />
                                    </div>
                                    <span className="text-[10px] text-slate-400">{chunk.complexity}</span>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    ))}
                    {chunks.length > 30 && (
                        <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-[10px] text-slate-400">
                            +{chunks.length - 30}
                        </div>
                    )}
                </div>
            </TooltipProvider>

            {/* Legend */}
            <div className="flex items-center gap-3 text-[10px]">
                <span className="text-slate-400">Complexity:</span>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-sm bg-blue-200" />
                    <span className="text-slate-500">Easy</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-sm bg-emerald-200" />
                    <span className="text-slate-500">Smooth</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-sm bg-amber-200" />
                    <span className="text-slate-500">Moderate</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-sm bg-red-200" />
                    <span className="text-slate-500">Complex</span>
                </div>
            </div>
        </motion.div>
    );
}