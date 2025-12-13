import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    CheckCircle2, 
    AlertTriangle, 
    Lightbulb, 
    X, 
    ChevronDown,
    Zap,
    Eye,
    EyeOff,
    Sparkles,
    MousePointerClick,
    Loader2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const ISSUE_CONFIG = {
    grammar: { 
        color: 'text-red-600 dark:text-red-400', 
        bg: 'bg-red-50 dark:bg-red-950/50', 
        border: 'border-red-200 dark:border-red-800',
        dotColor: 'bg-red-500',
        label: 'Grammar',
        hoverBg: 'hover:bg-red-100 dark:hover:bg-red-900/50'
    },
    style: { 
        color: 'text-amber-600 dark:text-amber-400', 
        bg: 'bg-amber-50 dark:bg-amber-950/50', 
        border: 'border-amber-200 dark:border-amber-800',
        dotColor: 'bg-amber-500',
        label: 'Style',
        hoverBg: 'hover:bg-amber-100 dark:hover:bg-amber-900/50'
    },
    clarity: { 
        color: 'text-blue-600 dark:text-blue-400', 
        bg: 'bg-blue-50 dark:bg-blue-950/50', 
        border: 'border-blue-200 dark:border-blue-800',
        dotColor: 'bg-blue-500',
        label: 'Clarity',
        hoverBg: 'hover:bg-blue-100 dark:hover:bg-blue-900/50'
    },
    tone: { 
        color: 'text-purple-600 dark:text-purple-400', 
        bg: 'bg-purple-50 dark:bg-purple-950/50', 
        border: 'border-purple-200 dark:border-purple-800',
        dotColor: 'bg-purple-500',
        label: 'Tone',
        hoverBg: 'hover:bg-purple-100 dark:hover:bg-purple-900/50'
    },
    structure: { 
        color: 'text-emerald-600 dark:text-emerald-400', 
        bg: 'bg-emerald-50 dark:bg-emerald-950/50', 
        border: 'border-emerald-200 dark:border-emerald-800',
        dotColor: 'bg-emerald-500',
        label: 'Structure',
        hoverBg: 'hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
    }
};

function SuggestionItem({ issue, onFix, onDismiss, isExpanded, onToggle, isFixing }) {
    const config = ISSUE_CONFIG[issue.type] || ISSUE_CONFIG.style;
    const isFixable = issue.suggested !== undefined && issue.start !== undefined && issue.end !== undefined;

    const handleClick = () => {
        if (isFixable && !isFixing) {
            onFix(issue);
        } else if (!isFixing) {
            onToggle();
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20, height: 0 }}
            className={`rounded-xl border-2 ${config.border} ${config.bg} overflow-hidden transition-all duration-200 ${isFixable && !isFixing ? 'cursor-pointer ' + config.hoverBg + ' hover:shadow-md hover:scale-[1.01]' : ''} ${isFixing ? 'opacity-50' : ''}`}
            onClick={handleClick}
        >
            <div className="flex items-start gap-3 p-3">
                <div className={`w-2.5 h-2.5 rounded-full ${config.dotColor} mt-1.5 flex-shrink-0 ${isFixable && !isFixing ? 'animate-pulse' : ''}`} />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${config.color} border-current font-semibold`}>
                            {config.label}
                        </Badge>
                        {issue.severity === 'high' && (
                            <Badge className="text-[10px] px-1.5 py-0 bg-red-500 text-white">Important</Badge>
                        )}
                    </div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{issue.title}</p>
                    {issue.original && (
                        <p className="text-xs text-slate-500 mt-1">
                            <span className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded line-through">
                                {issue.original.slice(0, 40)}{issue.original.length > 40 ? '...' : ''}
                            </span>
                            {issue.suggested !== undefined && (
                                <>
                                    <span className="mx-1.5">→</span>
                                    <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">
                                        {issue.suggested ? (issue.suggested.slice(0, 40) + (issue.suggested.length > 40 ? '...' : '')) : '(remove)'}
                                    </span>
                                </>
                            )}
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                    {isFixing ? (
                        <div className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-400 text-white text-xs font-semibold rounded-lg">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Fixing...
                        </div>
                    ) : isFixable ? (
                        <motion.div
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <MousePointerClick className="w-3.5 h-3.5" />
                            Fix
                        </motion.div>
                    ) : (
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    )}
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => { e.stopPropagation(); onDismiss(issue.id); }}
                        className="h-7 w-7 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50"
                        disabled={isFixing}
                    >
                        <X className="w-3.5 h-3.5" />
                    </Button>
                </div>
            </div>
            
            <AnimatePresence>
                {isExpanded && !isFixable && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-current/10 px-3 pb-3 pt-2"
                    >
                        {issue.original && issue.suggested !== undefined && (
                            <div className="space-y-1.5 mb-2">
                                <div className="flex items-start gap-2">
                                    <span className="text-[10px] text-slate-400 w-12 pt-1">Before:</span>
                                    <p className="text-xs text-red-700 bg-red-100/50 px-2 py-1 rounded line-through flex-1">
                                        {issue.original}
                                    </p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="text-[10px] text-slate-400 w-12 pt-1">After:</span>
                                    <p className="text-xs text-emerald-700 bg-emerald-100/50 px-2 py-1 rounded font-medium flex-1">
                                        {issue.suggested || '(remove)'}
                                    </p>
                                </div>
                            </div>
                        )}
                        {issue.explanation && (
                            <div className="flex items-start gap-1.5 text-xs text-slate-500 bg-white/50 p-2 rounded-lg">
                                <Lightbulb className="w-3 h-3 mt-0.5 flex-shrink-0 text-amber-500" />
                                {issue.explanation}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default function QuickFixSuggestions({ suggestions = [], onApplyFix, onApplyAllFixes }) {
    const [dismissed, setDismissed] = useState([]);
    const [expandedId, setExpandedId] = useState(null);
    const [showAll, setShowAll] = useState(true);
    const [isFixingAll, setIsFixingAll] = useState(false);
    const [fixingId, setFixingId] = useState(null);

    const activeSuggestions = suggestions.filter(s => !dismissed.includes(s.id));
    const fixableSuggestions = activeSuggestions.filter(s => s.suggested !== undefined && s.start !== undefined && s.end !== undefined);

    const handleDismiss = (id) => {
        setDismissed([...dismissed, id]);
    };

    const handleFix = useCallback(async (issue) => {
        setFixingId(issue.id);
        
        // Small delay for visual feedback
        await new Promise(resolve => setTimeout(resolve, 50));
        
        onApplyFix?.(issue);
        handleDismiss(issue.id);
        
        setFixingId(null);
        toast.success(
            <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span>Fixed: <strong>{issue.title}</strong></span>
            </div>
        );
    }, [onApplyFix]);

    const handleFixAll = useCallback(async () => {
        if (fixableSuggestions.length === 0) return;
        
        setIsFixingAll(true);
        
        // Use the batch fix handler if available
        if (onApplyAllFixes) {
            // Sort by position (end to start) to maintain correct positions
            const sortedFixes = [...fixableSuggestions].sort((a, b) => (b.start || 0) - (a.start || 0));
            onApplyAllFixes(sortedFixes);
            setDismissed([...dismissed, ...fixableSuggestions.map(s => s.id)]);
        } else {
            // Fallback: Apply fixes one by one from end to start
            const sortedFixes = [...fixableSuggestions].sort((a, b) => (b.start || 0) - (a.start || 0));
            
            for (const issue of sortedFixes) {
                onApplyFix?.(issue);
                await new Promise(resolve => setTimeout(resolve, 30)); // Small delay for visual effect
            }
            
            setDismissed([...dismissed, ...fixableSuggestions.map(s => s.id)]);
        }
        
        setIsFixingAll(false);
        
        toast.success(
            <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-500" />
                <span>Applied <strong>{fixableSuggestions.length}</strong> fixes!</span>
            </div>
        );
    }, [fixableSuggestions, onApplyFix, onApplyAllFixes, dismissed]);

    // Group by type
    const grouped = activeSuggestions.reduce((acc, s) => {
        acc[s.type] = acc[s.type] || [];
        acc[s.type].push(s);
        return acc;
    }, {});

    if (activeSuggestions.length === 0) {
        return (
            <motion.div 
                className="text-center py-12"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">Perfect!</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">No issues found in your text</p>
            </motion.div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Header with actions */}
            <div className="flex items-center justify-between bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-3">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        {activeSuggestions.length} suggestion{activeSuggestions.length !== 1 ? 's' : ''}
                    </span>
                    {/* Type counts */}
                    <div className="flex gap-1 ml-2">
                        {Object.entries(grouped).map(([type, items]) => (
                            <div 
                                key={type}
                                className={`w-2.5 h-2.5 rounded-full ${ISSUE_CONFIG[type]?.dotColor || 'bg-slate-400'}`}
                                title={`${items.length} ${type}`}
                            />
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAll(!showAll)}
                        className="h-8 text-xs"
                    >
                        {showAll ? <EyeOff className="w-3.5 h-3.5 mr-1" /> : <Eye className="w-3.5 h-3.5 mr-1" />}
                        {showAll ? 'Collapse' : 'Expand'}
                    </Button>
                    {fixableSuggestions.length > 0 && (
                        <Button
                            size="sm"
                            onClick={handleFixAll}
                            disabled={isFixingAll}
                            className="h-8 text-xs bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-lg shadow-md shadow-emerald-500/20"
                        >
                            {isFixingAll ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                                    Fixing...
                                </>
                            ) : (
                                <>
                                    <Zap className="w-3.5 h-3.5 mr-1" />
                                    Fix All ({fixableSuggestions.length})
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>

            {/* Hint message */}
            {fixableSuggestions.length > 0 && showAll && (
                <motion.div 
                    className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <MousePointerClick className="w-4 h-4 flex-shrink-0" />
                    <span><strong>Tip:</strong> Click any suggestion to apply the fix instantly, or use "Fix All" to apply all at once!</span>
                </motion.div>
            )}

            {/* Suggestions list */}
            <AnimatePresence mode="popLayout">
                {showAll && activeSuggestions.map((issue) => (
                    <SuggestionItem
                        key={issue.id}
                        issue={issue}
                        onFix={handleFix}
                        onDismiss={handleDismiss}
                        isExpanded={expandedId === issue.id}
                        onToggle={() => setExpandedId(expandedId === issue.id ? null : issue.id)}
                        isFixing={fixingId === issue.id || isFixingAll}
                    />
                ))}
            </AnimatePresence>

            {/* Dismissed count */}
            {dismissed.length > 0 && (
                <motion.div 
                    className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <span>{dismissed.length} fixed/dismissed</span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDismissed([])}
                        className="h-6 text-xs text-slate-500 hover:text-slate-700"
                    >
                        Restore all
                    </Button>
                </motion.div>
            )}
        </div>
    );
}
