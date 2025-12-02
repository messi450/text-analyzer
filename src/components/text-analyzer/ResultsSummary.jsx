import React from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Terminal } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ResultsSummary({ stats, wordFrequency, readability, sentiment }) {
    const [copied, setCopied] = React.useState(false);

    const topWords = Object.entries(wordFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    const generateSummaryText = () => {
        return `TEXT ANALYSIS RESULTS
${'='.repeat(40)}

STATISTICS:
Total characters (with spaces): ${stats.totalChars.toLocaleString()}
Total characters (without spaces): ${stats.totalCharsNoSpaces.toLocaleString()}
Total words: ${stats.totalWords.toLocaleString()}
Total sentences: ${stats.totalSentences.toLocaleString()}
Total paragraphs: ${stats.totalParagraphs.toLocaleString()}
Unique words: ${stats.uniqueWords.toLocaleString()}

READABILITY:
Flesch Reading Ease: ${readability?.fleschReading || 'N/A'}
Grade Level: ${readability?.gradeLevel || 'N/A'}
Audience: ${readability?.audienceLevel || 'N/A'}

SENTIMENT:
Overall: ${sentiment?.label || 'N/A'}
Score: ${sentiment?.score || 'N/A'}

${'='.repeat(40)}
TOP 10 MOST COMMON WORDS:
${'='.repeat(40)}
${topWords.map(([word, freq]) => `${word}: ${freq}`).join('\n')}`;
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generateSummaryText());
        setCopied(true);
        toast.success('Results copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    if (stats.totalWords === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 text-white"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-base font-semibold">Output Summary</h3>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyToClipboard}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white rounded-xl"
                >
                    {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copied ? 'Copied!' : 'Copy All'}
                </Button>
            </div>
            
            <div className="font-mono text-xs bg-black/30 rounded-xl p-4 overflow-x-auto">
                <pre className="text-emerald-400 whitespace-pre-wrap leading-relaxed">
{`Total characters (with spaces): ${stats.totalChars.toLocaleString()}
Total characters (without spaces): ${stats.totalCharsNoSpaces.toLocaleString()}
Total words: ${stats.totalWords.toLocaleString()}
Total sentences: ${stats.totalSentences.toLocaleString()}
Total paragraphs: ${stats.totalParagraphs.toLocaleString()}

Readability: ${readability?.fleschReading || 'N/A'} (${readability?.audienceLevel || 'N/A'})
Sentiment: ${sentiment?.label || 'Neutral'} (${sentiment?.score > 0 ? '+' : ''}${sentiment?.score || 0})

Top 10 Words:
${'-'.repeat(25)}
${topWords.map(([word, freq]) => `${word}: ${freq}`).join('\n')}`}
                </pre>
            </div>
        </motion.div>
    );
}