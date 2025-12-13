import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Trash2, Star, StarOff, ChevronRight, FileText, Search, X, Loader2, LogIn, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format } from 'date-fns';
import { toast } from "sonner";

// Local storage key for history
const LOCAL_HISTORY_KEY = 'textalyzer_local_history';

// Get local history from localStorage
function getLocalHistory() {
    try {
        const stored = localStorage.getItem(LOCAL_HISTORY_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

// Save to local history
function saveToLocalHistory(analysis) {
    try {
        const history = getLocalHistory();
        const newEntry = {
            id: `local_${Date.now()}`,
            ...analysis,
            created_date: new Date().toISOString(),
            is_favorite: false,
            is_local: true
        };
        history.unshift(newEntry);
        // Keep only last 20 items
        const trimmed = history.slice(0, 20);
        localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(trimmed));
        return newEntry;
    } catch {
        return null;
    }
}

// Delete from local history
function deleteFromLocalHistory(id) {
    try {
        const history = getLocalHistory();
        const filtered = history.filter(h => h.id !== id);
        localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(filtered));
    } catch {
        // Ignore errors
    }
}

// Toggle favorite in local history
function toggleLocalFavorite(id) {
    try {
        const history = getLocalHistory();
        const updated = history.map(h => 
            h.id === id ? { ...h, is_favorite: !h.is_favorite } : h
        );
        localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(updated));
    } catch {
        // Ignore errors
    }
}

export default function HistoryPanel({ analyses = [], onLoad, onDelete, onToggleFavorite, isLoading, isAuthenticated }) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [localHistory, setLocalHistory] = useState([]);

    // Load local history on mount
    useEffect(() => {
        setLocalHistory(getLocalHistory());
    }, [open]);

    // Combine cloud and local analyses
    const allAnalyses = isAuthenticated 
        ? analyses 
        : localHistory;

    const filteredAnalyses = allAnalyses
        .filter(a => {
            const matchesSearch = a.title?.toLowerCase().includes(search.toLowerCase()) ||
                a.original_text?.toLowerCase().includes(search.toLowerCase());
            const matchesFilter = filter === 'all' || (filter === 'favorites' && a.is_favorite);
            return matchesSearch && matchesFilter;
        })
        .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

    const handleLoad = (analysis) => {
        onLoad(analysis);
        setOpen(false);
        toast.success('Analysis loaded');
    };

    const handleDelete = (id, isLocal) => {
        if (isLocal) {
            deleteFromLocalHistory(id);
            setLocalHistory(getLocalHistory());
            toast.success('Deleted from local history');
        } else {
            onDelete(id);
        }
    };

    const handleToggleFavorite = (analysis) => {
        if (analysis.is_local) {
            toggleLocalFavorite(analysis.id);
            setLocalHistory(getLocalHistory());
        } else {
            onToggleFavorite(analysis);
        }
    };

    const totalCount = allAnalyses.length;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 relative"
                    title="History"
                >
                    <History className="w-4 h-4" />
                    {totalCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-indigo-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                            {totalCount > 9 ? '9+' : totalCount}
                        </span>
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[85vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <History className="w-5 h-5 text-indigo-500" />
                        Analysis History
                        {!isAuthenticated && (
                            <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                Local only
                            </span>
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        {isAuthenticated 
                            ? 'View and load your saved analyses'
                            : 'Recent analyses stored locally on this device'
                        }
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Search and Filter */}
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <Input
                                placeholder="Search analyses..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 rounded-xl"
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <Button
                            variant={filter === 'favorites' ? 'default' : 'outline'}
                            size="icon"
                            onClick={() => setFilter(filter === 'favorites' ? 'all' : 'favorites')}
                            className="rounded-xl"
                        >
                            <Star className={`w-4 h-4 ${filter === 'favorites' ? 'fill-current' : ''}`} />
                        </Button>
                    </div>

                    {/* History List */}
                    <ScrollArea className="h-[350px] pr-4">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-32">
                                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                            </div>
                        ) : filteredAnalyses.length === 0 ? (
                            <div className="text-center py-12 text-slate-500">
                                <Clock className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                <p className="font-medium">{search ? 'No matching analyses found' : 'No history yet'}</p>
                                <p className="text-sm mt-1">
                                    {!isAuthenticated && 'Your recent analyses will appear here'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <AnimatePresence>
                                    {filteredAnalyses.map((analysis) => (
                                        <motion.div
                                            key={analysis.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            className="group p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                                            onClick={() => handleLoad(analysis)}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-medium text-slate-800 truncate">
                                                            {analysis.title || 'Untitled Analysis'}
                                                        </h4>
                                                        {analysis.is_favorite && (
                                                            <Star className="w-3 h-3 text-amber-500 fill-current flex-shrink-0" />
                                                        )}
                                                        {analysis.is_local && (
                                                            <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                                                                Local
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-slate-500 truncate mb-1">
                                                        {analysis.original_text?.slice(0, 60)}...
                                                    </p>
                                                    <div className="flex items-center gap-3 text-xs text-slate-400">
                                                        <span>{analysis.stats?.totalWords || 0} words</span>
                                                        <span>•</span>
                                                        <span>{format(new Date(analysis.created_date), 'MMM d, yyyy')}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleToggleFavorite(analysis);
                                                        }}
                                                    >
                                                        {analysis.is_favorite ? (
                                                            <StarOff className="w-4 h-4 text-slate-400" />
                                                        ) : (
                                                            <Star className="w-4 h-4 text-slate-400" />
                                                        )}
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <Trash2 className="w-4 h-4 text-red-400" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete Analysis</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to delete this analysis? This action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleDelete(analysis.id, analysis.is_local)}
                                                                    className="bg-red-600 hover:bg-red-700"
                                                                >
                                                                    Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                    <ChevronRight className="w-4 h-4 text-slate-400" />
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </ScrollArea>

                    {/* Sign in prompt for non-authenticated users */}
                    {!isAuthenticated && (
                        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-center">
                            <p className="text-xs text-indigo-700 mb-2">
                                Sign in to save your analyses to the cloud
                            </p>
                            <Button
                                size="sm"
                                variant="outline"
                                className="text-xs h-7 border-indigo-200 text-indigo-600 hover:bg-indigo-100"
                                onClick={() => {
                                    try {
                                        const { base44 } = require('@/api/base44Client');
                                        base44.auth.redirectToLogin();
                                    } catch {
                                        toast.error('Sign in unavailable');
                                    }
                                }}
                            >
                                <LogIn className="w-3 h-3 mr-1" />
                                Sign In
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Export helper for saving to local history from outside
export { saveToLocalHistory, getLocalHistory };
