import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899'];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-3 shadow-xl">
                <p className="font-semibold text-slate-800">{label || payload[0].name}</p>
                <p className="text-indigo-600 font-bold text-lg">{payload[0].value.toLocaleString()}</p>
            </div>
        );
    }
    return null;
};

export default function StatsChart({ stats }) {
    const data = [
        { name: 'Words', value: stats.totalWords, color: '#6366f1' },
        { name: 'Sentences', value: stats.totalSentences, color: '#10b981' },
        { name: 'Paragraphs', value: stats.totalParagraphs, color: '#f59e0b' },
        { name: 'Unique Words', value: stats.uniqueWords, color: '#ec4899' }
    ];

    const hasData = data.some(item => item.value > 0);

    if (!hasData) {
        return (
            <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center h-full flex flex-col items-center justify-center">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-7 h-7 text-slate-400" />
                </div>
                <p className="text-slate-500">Enter text to see visualization</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden h-full"
        >
            <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-slate-800">Visualization</h3>
                        <p className="text-xs text-slate-500">Summary chart</p>
                    </div>
                </div>
            </div>
            
            <div className="p-5">
                <Tabs defaultValue="bar" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4 bg-slate-100 p-1 rounded-xl">
                        <TabsTrigger value="bar" className="rounded-lg data-[state=active]:bg-white text-xs">
                            <BarChart3 className="w-3 h-3 mr-1.5" /> Bar
                        </TabsTrigger>
                        <TabsTrigger value="pie" className="rounded-lg data-[state=active]:bg-white text-xs">
                            <PieChartIcon className="w-3 h-3 mr-1.5" /> Pie
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="bar" className="mt-0">
                        <div className="h-[220px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                    <XAxis 
                                        dataKey="name" 
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748b', fontSize: 11 }}
                                    />
                                    <YAxis 
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748b', fontSize: 11 }}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
                                    <Bar 
                                        dataKey="value" 
                                        radius={[6, 6, 0, 0]}
                                        maxBarSize={50}
                                    >
                                        {data.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </TabsContent>

                    <TabsContent value="pie" className="mt-0">
                        <div className="h-[220px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={3}
                                        dataKey="value"
                                    >
                                        {data.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </TabsContent>
                </Tabs>
                
                <div className="flex flex-wrap justify-center gap-4 mt-3">
                    {data.map((item) => (
                        <div key={item.name} className="flex items-center gap-1.5">
                            <div 
                                className="w-2.5 h-2.5 rounded-full" 
                                style={{ backgroundColor: item.color }}
                            />
                            <span className="text-xs text-slate-600">{item.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}