import React from 'react';
import { motion } from 'framer-motion';
import { Key, Tag, Copy, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Common stop words to exclude
const STOP_WORDS = new Set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us', 'is', 'are', 'was', 'were', 'been', 'being', 'has', 'had', 'does', 'did', 'am', 'very', 'such', 'here', 'where', 'why', 'should', 'each', 'more', 'may', 'must', 'own', 'too', 'much', 'many', 'those', 'both', 'same', 'through', 'during', 'before', 'under', 'between', 'while', 'although', 'however', 'since', 'until', 'against', 'without', 'within', 'along', 'among', 'around', 'behind', 'beyond', 'across', 'beside', 'besides', 'whether', 'either', 'neither', 'yet', 'still', 'already', 'always', 'never', 'ever', 'often', 'sometimes', 'usually', 'perhaps', 'probably', 'certainly', 'definitely', 'possibly', 'actually', 'really', 'quite', 'rather', 'almost', 'enough', 'especially', 'particularly', 'generally', 'specifically', 'simply', 'completely', 'absolutely', 'exactly', 'directly', 'immediately', 'recently', 'currently', 'finally', 'eventually', 'suddenly', 'gradually', 'slowly', 'quickly', 'carefully', 'easily', 'hardly', 'nearly', 'mainly', 'mostly', 'partly', 'slightly', 'highly', 'greatly', 'strongly', 'deeply', 'widely', 'clearly', 'closely', 'fully', 'further', 'therefore', 'thus', 'hence', 'moreover', 'furthermore', 'additionally', 'meanwhile', 'nonetheless', 'nevertheless', 'otherwise', 'instead', 'accordingly', 'consequently', 'subsequently'
]);

export function extractKeywords(text, wordFrequency, limit = 15) {
    if (!text || !wordFrequency) return [];

    // Sort by frequency and filter out stop words and short words
    const keywords = Object.entries(wordFrequency)
        .filter(([word]) => !STOP_WORDS.has(word) && word.length > 2)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([word, count]) => ({ word, count }));

    return keywords;
}

export default function KeywordsPanel({ keywords }) {
    const [copied, setCopied] = React.useState(false);

    if (!keywords || keywords.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Key className="w-7 h-7 text-slate-400" />
                </div>
                <p className="text-slate-500">Enter text to extract keywords</p>
            </div>
        );
    }

    const maxCount = keywords[0]?.count || 1;

    const copyKeywords = () => {
        navigator.clipboard.writeText(keywords.map(k => k.word).join(', '));
        setCopied(true);
        toast.success('Keywords copied!');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
        >
            <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center">
                            <Key className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-slate-800">Extracted Keywords</h3>
                            <p className="text-xs text-slate-500">Top {keywords.length} keywords from your text</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyKeywords}
                        className="text-slate-500 hover:text-slate-700"
                    >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                </div>
            </div>
            
            <div className="p-5">
                {/* Keyword Tags */}
                <div className="flex flex-wrap gap-2 mb-5">
                    {keywords.slice(0, 8).map((keyword, idx) => (
                        <motion.span
                            key={keyword.word}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: idx * 0.05 }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-50 to-purple-50 text-violet-700 rounded-full text-sm font-medium border border-violet-100"
                        >
                            <Tag className="w-3 h-3" />
                            {keyword.word}
                            <span className="text-xs text-violet-400">({keyword.count})</span>
                        </motion.span>
                    ))}
                </div>

                {/* Keyword List with Bars */}
                <div className="space-y-2">
                    {keywords.map((keyword, idx) => (
                        <motion.div
                            key={keyword.word}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: idx * 0.03 }}
                            className="group"
                        >
                            <div className="flex items-center justify-between text-sm mb-1">
                                <span className="font-medium text-slate-700 group-hover:text-violet-600 transition-colors">
                                    {keyword.word}
                                </span>
                                <span className="text-xs text-slate-400">{keyword.count}x</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(keyword.count / maxCount) * 100}%` }}
                                    transition={{ duration: 0.5, delay: idx * 0.03 + 0.2 }}
                                />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}