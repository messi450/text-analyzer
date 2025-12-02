import React from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const words = payload[0].value;
        const status = words > 25 ? 'Long' : words < 8 ? 'Short' : 'Good';
        const statusColor = words > 25 ? 'text-amber-600' : words < 8 ? 'text-blue-600' : 'text-emerald-600';
        return (
            <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg p-2 shadow-lg">
                <p className="text-xs text-slate-500">Sentence {label}</p>
                <p className="text-sm font-bold text-slate-800">{words} words</p>
                <p className={`text-xs font-medium ${statusColor}`}>{status}</p>
            </div>
        );
    }
    return null;
};

export default function SentenceLengthChart({ text }) {
    const sentences = text
        .split(/[.!?]+/)
        .map(s => s.trim())
        .filter(s => s.length > 0);

    const data = sentences.map((s, i) => ({
        name: i + 1,
        words: s.split(/\s+/).filter(w => w.length > 0).length,
        sentence: s.slice(0, 50) + (s.length > 50 ? '...' : '')
    }));

    const avgLength = data.length > 0 
        ? Math.round(data.reduce((sum, d) => sum + d.words, 0) / data.length) 
        : 0;

    const longSentences = data.filter(d => d.words > 25).length;
    const shortSentences = data.filter(d => d.words < 8).length;
    const variation = data.length > 1 
        ? Math.round(Math.sqrt(data.reduce((sum, d) => sum + Math.pow(d.words - avgLength, 2), 0) / data.length))
        : 0;

    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-32 text-slate-400 text-sm">
                Enter text to see sentence analysis
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
        >
            {/* Mini stats */}
            <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-slate-600">Avg: <strong>{avgLength}</strong> words</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-slate-600">Variation: <strong>{variation}</strong></span>
                </div>
                {longSentences > 0 && (
                    <div className="flex items-center gap-1 text-amber-600">
                        <AlertTriangle className="w-3 h-3" />
                        <span>{longSentences} long</span>
                    </div>
                )}
            </div>

            {/* Chart */}
            <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                        <defs>
                            <linearGradient id="sentenceGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#94a3b8' }}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#94a3b8' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <ReferenceLine y={20} stroke="#10b981" strokeDasharray="3 3" strokeOpacity={0.5} />
                        <Area 
                            type="monotone" 
                            dataKey="words" 
                            stroke="#3b82f6" 
                            strokeWidth={2}
                            fill="url(#sentenceGradient)"
                            dot={{ fill: '#3b82f6', strokeWidth: 0, r: 3 }}
                            activeDot={{ r: 5, fill: '#2563eb' }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Insight */}
            <div className="flex items-start gap-2 p-2 bg-blue-50 rounded-lg">
                {variation > 8 ? (
                    <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                        <p className="text-xs text-slate-600">Good sentence variety keeps readers engaged.</p>
                    </>
                ) : (
                    <>
                        <TrendingUp className="w-4 h-4 text-blue-500 mt-0.5" />
                        <p className="text-xs text-slate-600">Try varying sentence length for better rhythm.</p>
                    </>
                )}
            </div>
        </motion.div>
    );
}