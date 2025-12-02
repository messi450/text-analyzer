import React, { useState, useEffect, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Type, Upload, Trash2, Sparkles, Globe, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { sanitize } from '@/utils/sanitization';
import { toast } from "sonner";

const WRITING_STYLES = [
    { value: 'academic', label: 'Academic', icon: '🎓' },
    { value: 'business', label: 'Business', icon: '💼' },
    { value: 'casual', label: 'Casual', icon: '💬' },
    { value: 'creative', label: 'Creative', icon: '✨' },
    { value: 'technical', label: 'Technical', icon: '⚙️' }
];

const LANGUAGES = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'it', label: 'Italian' },
    { value: 'pt', label: 'Portuguese' }
];

export default function TextInput({ 
    onTextChange, 
    text, 
    writingStyle, 
    onStyleChange, 
    language, 
    onLanguageChange,
    autoAnalyze,
    fontSize 
}) {
    const [fileName, setFileName] = useState('');
    const [charCount, setCharCount] = useState(0);
    const [wordCount, setWordCount] = useState(0);
    const textareaRef = useRef(null);

    useEffect(() => {
        setCharCount(text.length);
        const words = text.trim().split(/\s+/).filter(w => w.length > 0);
        setWordCount(words.length);
    }, [text]);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file
        const validation = sanitize.validateFile(file);
        if (!validation.isValid) {
            toast.error(`File upload failed: ${validation.errors.join(', ')}`);
            return;
        }

        // Sanitize filename
        const safeFileName = sanitize.filename(file.name);
        setFileName(safeFileName);

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                // Sanitize file content
                const sanitizedContent = sanitize.text(event.target.result);
                onTextChange(sanitizedContent);

                if (sanitizedContent.length < event.target.result.length) {
                    toast.warning('Some content was sanitized for security reasons');
                }
            } catch (error) {
                console.error('Error processing file:', error);
                toast.error('Error processing file. Please try again.');
                setFileName('');
            }
        };

        reader.onerror = () => {
            toast.error('Error reading file. Please try again.');
            setFileName('');
        };

        reader.readAsText(file);
    };

    const clearText = () => {
        onTextChange('');
        setFileName('');
    };

    const fontSizeClass = {
        small: 'text-sm',
        medium: 'text-base',
        large: 'text-lg'
    }[fontSize] || 'text-base';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full"
        >
            {/* Style & Language Selection - Non-intrusive, above input */}
            <div className="flex flex-wrap gap-3 mb-4">
                <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-slate-400" />
                    <Select value={writingStyle} onValueChange={onStyleChange}>
                        <SelectTrigger className="w-40 h-9 border-slate-200 rounded-xl text-sm">
                            <SelectValue placeholder="Writing Style" />
                        </SelectTrigger>
                        <SelectContent>
                            {WRITING_STYLES.map(style => (
                                <SelectItem key={style.value} value={style.value}>
                                    <span className="flex items-center gap-2">
                                        <span>{style.icon}</span>
                                        {style.label}
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-slate-400" />
                    <Select value={language} onValueChange={onLanguageChange}>
                        <SelectTrigger className="w-32 h-9 border-slate-200 rounded-xl text-sm">
                            <SelectValue placeholder="Language" />
                        </SelectTrigger>
                        <SelectContent>
                            {LANGUAGES.map(lang => (
                                <SelectItem key={lang.value} value={lang.value}>
                                    {lang.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                {autoAnalyze && (
                    <Badge variant="outline" className="h-9 px-3 border-green-200 text-green-700 bg-green-50 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Real-time analysis
                    </Badge>
                )}
            </div>

            <Tabs defaultValue="type" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4 bg-slate-100/80 p-1 rounded-2xl">
                    <TabsTrigger 
                        value="type" 
                        className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2 py-3 transition-all duration-300"
                    >
                        <Type className="w-4 h-4" />
                        Type or Paste
                    </TabsTrigger>
                    <TabsTrigger 
                        value="upload"
                        className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2 py-3 transition-all duration-300"
                    >
                        <Upload className="w-4 h-4" />
                        Upload File
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="type" className="mt-0">
                    <div className="relative">
                        <Textarea
                            ref={textareaRef}
                            placeholder="Start typing or paste your text here... Your writing stays yours – we just help polish it."
                            value={text}
                            onChange={(e) => onTextChange(sanitize.text(e.target.value))}
                            className={`min-h-[260px] ${fontSizeClass} leading-relaxed resize-none border-2 border-slate-200 focus:border-indigo-400 rounded-2xl p-5 pb-12 bg-white/70 backdrop-blur-sm transition-all duration-300 focus:ring-4 focus:ring-indigo-100`}
                        />
                        
                        {/* Bottom bar - non-intrusive stats */}
                        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-5 py-3 bg-gradient-to-t from-white via-white/95 to-transparent rounded-b-2xl">
                            <div className="flex items-center gap-4 text-xs text-slate-400">
                                <span>{charCount.toLocaleString()} characters</span>
                                <span>•</span>
                                <span>{wordCount.toLocaleString()} words</span>
                            </div>
                            <AnimatePresence>
                                {text && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                    >
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={clearText}
                                            className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl h-8 px-3 text-xs"
                                        >
                                            <Trash2 className="w-3 h-3 mr-1" />
                                            Clear
                                        </Button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="upload" className="mt-0">
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center bg-gradient-to-br from-slate-50/50 to-indigo-50/30 hover:border-indigo-300 transition-all duration-300">
                        <input
                            type="file"
                            accept=".txt"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="file-upload"
                        />
                        <label htmlFor="file-upload" className="cursor-pointer">
                            <div className="mx-auto w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-200">
                                <FileText className="w-7 h-7 text-white" />
                            </div>
                            <p className="text-base font-medium text-slate-700 mb-1">
                                {fileName || 'Drop your file here or click to browse'}
                            </p>
                            <p className="text-sm text-slate-400">
                                Supports .txt files only
                            </p>
                        </label>
                        {fileName && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium"
                            >
                                <FileText className="w-4 h-4" />
                                {fileName}
                                <button onClick={clearText} className="ml-2 hover:text-red-500">
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </motion.div>
                        )}
                    </div>
                    {text && (
                        <div className="mt-5">
                            <p className="text-sm text-slate-500 mb-2">Preview:</p>
                            <div className={`bg-slate-50 rounded-xl p-4 max-h-32 overflow-y-auto ${fontSizeClass} text-slate-600 border border-slate-100`}>
                                {text.slice(0, 400)}{text.length > 400 && '...'}
                            </div>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </motion.div>
    );
}