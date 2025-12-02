import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Hash, Copy, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function WordFrequencyTable({ wordFrequency }) {
    const [copied, setCopied] = React.useState(false);
    
    const topWords = Object.entries(wordFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const maxFrequency = topWords.length > 0 ? topWords[0][1] : 1;

    const copyWords = () => {
        const text = topWords.map(([word, freq]) => `${word}: ${freq}`).join('\n');
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success('Word frequency copied!');
        setTimeout(() => setCopied(false), 2000);
    };

    if (topWords.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center h-full flex flex-col items-center justify-center">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Hash className="w-7 h-7 text-slate-400" />
                </div>
                <p className="text-slate-500">Enter text to see word frequency</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden h-full"
        >
            <div className="p-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-indigo-500" />
                        <h3 className="text-sm font-semibold text-slate-800">Top Words</h3>
                    </div>
                    <Button variant="ghost" size="sm" onClick={copyWords} className="h-6 w-6 p-0 text-slate-400">
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </Button>
                </div>
            </div>
            
            <div className="p-3">
                <div className="space-y-1.5">
                    {topWords.map(([word, frequency], index) => (
                        <div key={word} className="flex items-center gap-2">
                            <span className="w-4 text-[10px] font-bold text-slate-400">{index + 1}</span>
                            <span className="text-xs font-medium text-slate-700 flex-1 truncate">{word}</span>
                            <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(frequency / maxFrequency) * 100}%` }} />
                            </div>
                            <span className="text-[10px] text-slate-500 w-4 text-right">{frequency}x</span>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}