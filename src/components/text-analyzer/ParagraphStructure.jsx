import React from 'react';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlignLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ParagraphStructure({ text }) {
    const paragraphs = text
        .split(/\n\s*\n/)
        .map(p => p.trim())
        .filter(p => p.length > 0);

    if (paragraphs.length === 0) {
        return (
            <div className="flex items-center justify-center h-24 text-slate-400 text-sm">
                Enter text to see structure
            </div>
        );
    }

    const maxWords = Math.max(...paragraphs.map(p => p.split(/\s+/).length));

    const getParaStatus = (wordCount) => {
        if (wordCount < 30) return { color: 'bg-blue-400', label: 'Short', status: 'info' };
        if (wordCount > 150) return { color: 'bg-amber-400', label: 'Long', status: 'warning' };
        return { color: 'bg-emerald-400', label: 'Good', status: 'good' };
    };

    const avgWords = Math.round(paragraphs.reduce((sum, p) => sum + p.split(/\s+/).length, 0) / paragraphs.length);
    const longParas = paragraphs.filter(p => p.split(/\s+/).length > 150).length;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
        >
            {/* Summary */}
            <div className="flex items-center justify-between text-xs text-slate-600">
                <span>{paragraphs.length} paragraph{paragraphs.length !== 1 ? 's' : ''}</span>
                <span>Avg: {avgWords} words</span>
            </div>

            {/* Visual blocks */}
            <TooltipProvider>
                <div className="flex gap-1.5 items-end h-20">
                    {paragraphs.map((para, idx) => {
                        const words = para.split(/\s+/).length;
                        const height = Math.max(20, (words / maxWords) * 100);
                        const status = getParaStatus(words);
                        const sentences = para.split(/[.!?]+/).filter(s => s.trim()).length;

                        return (
                            <Tooltip key={idx}>
                                <TooltipTrigger asChild>
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${height}%` }}
                                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                                        className={`flex-1 ${status.color} rounded-t-md cursor-pointer hover:opacity-80 transition-opacity min-w-[20px] max-w-[60px]`}
                                        style={{ minHeight: '20%' }}
                                    />
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs">
                                    <p className="font-medium">Paragraph {idx + 1}</p>
                                    <p className="text-xs text-slate-500">{words} words, {sentences} sentences</p>
                                    <p className="text-xs mt-1 text-slate-400 line-clamp-2">{para.slice(0, 100)}...</p>
                                </TooltipContent>
                            </Tooltip>
                        );
                    })}
                </div>
            </TooltipProvider>

            {/* Legend */}
            <div className="flex items-center gap-4 text-[10px]">
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-sm bg-blue-400" />
                    <span className="text-slate-500">Short (&lt;30)</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-sm bg-emerald-400" />
                    <span className="text-slate-500">Good (30-150)</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-sm bg-amber-400" />
                    <span className="text-slate-500">Long (&gt;150)</span>
                </div>
            </div>

            {/* Insight */}
            {longParas > 0 && (
                <div className="flex items-start gap-2 p-2 bg-amber-50 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5" />
                    <p className="text-xs text-slate-600">Consider breaking long paragraphs for readability.</p>
                </div>
            )}
        </motion.div>
    );
}