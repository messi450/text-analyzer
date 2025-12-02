import React, { useState, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Type, Upload, Trash2, AlertCircle, FileType, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from "sonner";
import { sanitize } from '@/utils/sanitization';

// PDF.js worker setup
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Import mammoth for Word documents
import mammoth from 'mammoth';

// Supported file types
const SUPPORTED_TYPES = {
    'text/plain': { ext: '.txt', name: 'Text' },
    'application/pdf': { ext: '.pdf', name: 'PDF' },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { ext: '.docx', name: 'Word' },
    'application/msword': { ext: '.doc', name: 'Word (Legacy)' }
};

export default function TextInputWithHighlights({ 
    onTextChange, 
    text, 
    issues = [],
}) {
    const [fileName, setFileName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const textareaRef = useRef(null);
    const highlightRef = useRef(null);

    // Extract text from PDF
    const extractTextFromPDF = async (file) => {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';
            
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items
                    .map(item => item.str)
                    .join(' ');
                fullText += pageText + '\n\n';
            }
            
            return fullText.trim();
        } catch (error) {
            console.error('PDF extraction error:', error);
            throw new Error('Failed to extract text from PDF. The file might be corrupted or password-protected.');
        }
    };

    // Extract text from Word document
    const extractTextFromWord = async (file) => {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.extractRawText({ arrayBuffer });
            return result.value.trim();
        } catch (error) {
            console.error('Word extraction error:', error);
            throw new Error('Failed to extract text from Word document. The file might be corrupted.');
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file using sanitization utility
        const validation = sanitize.validateFile(file);
        if (!validation.isValid) {
            toast.error(`File upload failed: ${validation.errors.join(', ')}`);
            return;
        }

        const fileType = file.type;
        const fileName = file.name;

        // Additional type checking for supported formats
        const isSupported = SUPPORTED_TYPES[fileType] ||
                           fileName.endsWith('.txt') ||
                           fileName.endsWith('.pdf') ||
                           fileName.endsWith('.docx') ||
                           fileName.endsWith('.doc');

        if (!isSupported) {
            toast.error('Unsupported file type. Please upload a TXT, PDF, or Word document.');
            return;
        }

        setIsLoading(true);
        setFileName(sanitize.filename(fileName));

        try {
            let extractedText = '';

            if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
                // Plain text file
                const reader = new FileReader();
                extractedText = await new Promise((resolve, reject) => {
                    reader.onload = (event) => resolve(event.target.result);
                    reader.onerror = () => reject(new Error('Failed to read text file'));
                    reader.readAsText(file);
                });
            } else if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
                // PDF file
                extractedText = await extractTextFromPDF(file);
            } else if (fileType.includes('wordprocessingml') || fileType === 'application/msword' || fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
                // Word document
                extractedText = await extractTextFromWord(file);
            }

            if (extractedText) {
                // Sanitize extracted text for security
                const sanitizedText = sanitize.text(extractedText);
                onTextChange(sanitizedText);

                // Show warning if content was modified
                if (sanitizedText.length < extractedText.length) {
                    toast.warning('Some content was sanitized for security reasons');
                }

                toast.success(`Successfully loaded ${fileName}`, {
                    description: `Extracted ${sanitizedText.split(/\s+/).filter(w => w).length} words`
                });
            } else {
                toast.error('No text found in the file');
            }
        } catch (error) {
            toast.error(error.message || 'Failed to process file');
            setFileName('');
        } finally {
            setIsLoading(false);
            // Reset input so same file can be selected again
            e.target.value = '';
        }
    };

    const clearText = () => {
        onTextChange('');
        setFileName('');
    };

    // Sync scroll between textarea and highlight layer
    const handleScroll = () => {
        if (highlightRef.current && textareaRef.current) {
            highlightRef.current.scrollTop = textareaRef.current.scrollTop;
        }
    };

    // Create highlighted text with non-overlapping issues
    const getHighlightedText = () => {
        if (!text || issues.length === 0) return null;

        // Filter issues with valid positions and sort by start
        const validIssues = issues
            .filter(i => i.start !== undefined && i.end !== undefined)
            .sort((a, b) => a.start - b.start);

        // Remove overlapping issues - keep only non-overlapping ones
        const nonOverlapping = [];
        let lastEnd = -1;
        validIssues.forEach(issue => {
            if (issue.start >= lastEnd) {
                nonOverlapping.push(issue);
                lastEnd = issue.end;
            }
        });

        if (nonOverlapping.length === 0) return null;

        let result = [];
        let lastIndex = 0;

        const issueColors = {
            grammar: 'bg-red-200/80 dark:bg-red-900/50 border-b-2 border-red-400 dark:border-red-500',
            style: 'bg-amber-200/80 dark:bg-amber-900/50 border-b-2 border-amber-400 dark:border-amber-500',
            clarity: 'bg-blue-200/80 dark:bg-blue-900/50 border-b-2 border-blue-400 dark:border-blue-500',
            tone: 'bg-purple-200/80 dark:bg-purple-900/50 border-b-2 border-purple-400 dark:border-purple-500',
            structure: 'bg-emerald-200/80 dark:bg-emerald-900/50 border-b-2 border-emerald-400 dark:border-emerald-500'
        };

        nonOverlapping.forEach((issue, idx) => {
            if (issue.start > lastIndex) {
                result.push(<span key={`t-${idx}`} className="text-slate-900 dark:text-slate-100">{text.slice(lastIndex, issue.start)}</span>);
            }
            result.push(
                <mark 
                    key={`i-${idx}`}
                    className={`${issueColors[issue.type] || 'bg-yellow-200/80 dark:bg-yellow-900/50 border-b-2 border-yellow-400 dark:border-yellow-500'} rounded-sm text-slate-900 dark:text-slate-100`}
                    title={issue.title}
                >
                    {text.slice(issue.start, issue.end)}
                </mark>
            );
            lastIndex = issue.end;
        });

        if (lastIndex < text.length) {
            result.push(<span key="end" className="text-slate-900 dark:text-slate-100">{text.slice(lastIndex)}</span>);
        }

        return result;
    };

    const issueCount = issues.length;
    const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    const charCount = text.length;
    const hasHighlights = !!getHighlightedText();

    return (
        <div className="space-y-3">
            {/* Text Input with Tabs */}
            <Tabs defaultValue="type" className="w-full">
                <div className="flex items-center justify-between mb-2">
                    <TabsList className="bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg h-8">
                        <TabsTrigger value="type" className="rounded text-xs h-7 px-3 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">
                            <Type className="w-3 h-3 mr-1" /> Type
                        </TabsTrigger>
                        <TabsTrigger value="upload" className="rounded text-xs h-7 px-3 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">
                            <Upload className="w-3 h-3 mr-1" /> Upload
                        </TabsTrigger>
                    </TabsList>
                    
                    {/* Stats - only show when there's content */}
                    {text && (
                        <motion.div 
                            className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <span className="font-medium">{wordCount} words</span>
                            <span className="text-slate-300 dark:text-slate-600">•</span>
                            <span>{charCount} chars</span>
                            {issueCount > 0 && (
                                <Badge variant="outline" className="text-xs text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 ml-1">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    {issueCount} {issueCount === 1 ? 'issue' : 'issues'}
                                </Badge>
                            )}
                        </motion.div>
                    )}
                </div>

                <TabsContent value="type" className="mt-0">
                    <div className="relative">
                        {/* Underlay with highlights */}
                        <div
                            ref={highlightRef}
                            aria-hidden="true"
                            className="absolute inset-0 p-3 text-sm leading-relaxed overflow-hidden whitespace-pre-wrap break-words pointer-events-none bg-white dark:bg-slate-900 rounded-xl border border-transparent text-slate-900 dark:text-slate-100"
                        >
                            {getHighlightedText() || <span className="text-transparent">{text}</span>}
                        </div>
                        {/* Textarea on top */}
                        <textarea
                            ref={textareaRef}
                            placeholder="Start typing or paste your text here to analyze..."
                            value={text}
                            onChange={(e) => onTextChange(sanitize.text(e.target.value))}
                            onScroll={handleScroll}
                            className={`w-full min-h-[220px] p-3 text-sm leading-relaxed resize-none border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 focus:border-indigo-400 dark:focus:border-indigo-600 transition-all bg-transparent relative z-10 placeholder:text-slate-400 dark:placeholder:text-slate-500 ${
                                hasHighlights 
                                    ? 'text-transparent caret-slate-800 dark:caret-slate-200' 
                                    : 'text-slate-900 dark:text-slate-100 caret-slate-800 dark:caret-slate-200'
                            }`}
                        />
                        {text && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={clearText}
                                className="absolute bottom-3 right-3 h-8 px-3 text-xs font-semibold bg-red-500 hover:bg-red-600 text-white border-red-500 hover:border-red-600 shadow-md hover:shadow-lg transition-all z-20 gap-1.5"
                            >
                                <Trash2 className="w-3.5 h-3.5" /> Clear All
                            </Button>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="upload" className="mt-0">
                    <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/30 transition-colors">
                        <input 
                            type="file" 
                            accept=".txt,.pdf,.doc,.docx,text/plain,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
                            onChange={handleFileUpload} 
                            className="hidden" 
                            id="file-upload"
                            disabled={isLoading}
                        />
                        <label htmlFor="file-upload" className={`cursor-pointer ${isLoading ? 'pointer-events-none' : ''}`}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-10 h-10 text-indigo-500 mx-auto mb-3 animate-spin" />
                                    <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">Processing {fileName}...</p>
                                    <p className="text-xs text-slate-400 mt-1">Extracting text from document</p>
                                </>
                            ) : (
                                <>
                                    <div className="flex justify-center gap-2 mb-3">
                                        <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                                        <FileType className="w-8 h-8 text-red-300 dark:text-red-800" />
                                        <FileText className="w-8 h-8 text-blue-300 dark:text-blue-800" />
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                                        {fileName || 'Click to upload a document'}
                                    </p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                        Supports: <span className="font-medium">.txt</span>, <span className="font-medium text-red-500">.pdf</span>, <span className="font-medium text-blue-500">.docx</span>
                                    </p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">or drag and drop</p>
                                </>
                            )}
                        </label>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
