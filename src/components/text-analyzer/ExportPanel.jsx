import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileJson, FileText, FileSpreadsheet, Loader2, FileType, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { jsPDF } from 'jspdf';

// ==========================================
// ADVANCED SCORING ALGORITHM
// Based on educational assessment best practices
// ==========================================

function calculateOverallScore(stats, readability, sentiment, suggestions = []) {
    if (!stats || stats.totalWords === 0) return 0;
    
    let score = 0;
    const breakdown = {};
    
    // ==========================================
    // 1. READABILITY (25 points max)
    // Ideal Flesch score: 50-70 for general audience
    // ==========================================
    if (readability?.fleschReading !== undefined) {
        const flesch = readability.fleschReading;
        let readabilityScore = 0;
        
        if (flesch >= 50 && flesch <= 70) {
            // Perfect range - full points
            readabilityScore = 25;
        } else if (flesch >= 40 && flesch <= 80) {
            // Good range
            readabilityScore = 22;
        } else if (flesch >= 30 && flesch <= 90) {
            // Acceptable
            readabilityScore = 18;
        } else if (flesch > 90) {
            // Too simple
            readabilityScore = 15;
        } else {
            // Too complex
            readabilityScore = Math.max(10, 25 - Math.abs(50 - flesch) * 0.3);
        }
        
        score += readabilityScore;
        breakdown.readability = readabilityScore;
    } else {
        score += 15; // Default if no readability data
        breakdown.readability = 15;
    }
    
    // ==========================================
    // 2. SENTENCE STRUCTURE (20 points max)
    // Evaluates sentence length variety and average
    // ==========================================
    if (readability?.avgSentenceLength && stats.totalSentences > 0) {
        const avgLen = readability.avgSentenceLength;
        let sentenceScore = 0;
        
        // Ideal average sentence length: 15-20 words
        if (avgLen >= 12 && avgLen <= 22) {
            sentenceScore = 20;
        } else if (avgLen >= 8 && avgLen <= 28) {
            sentenceScore = 16;
        } else if (avgLen < 8) {
            sentenceScore = 12; // Too choppy
        } else {
            sentenceScore = 10; // Too long
        }
        
        score += sentenceScore;
        breakdown.sentenceStructure = sentenceScore;
    } else {
        score += 15;
        breakdown.sentenceStructure = 15;
    }
    
    // ==========================================
    // 3. VOCABULARY RICHNESS (20 points max)
    // Type-Token Ratio (TTR) - unique words / total words
    // ==========================================
    if (stats.totalWords > 0 && stats.uniqueWords > 0) {
        const ttr = stats.uniqueWords / stats.totalWords;
        let vocabScore = 0;
        
        // TTR naturally decreases with longer texts
        // Adjust expectations based on text length
        const lengthAdjustedTTR = ttr * Math.sqrt(stats.totalWords / 100);
        
        if (stats.totalWords < 50) {
            // Short text - TTR should be high
            vocabScore = ttr >= 0.7 ? 20 : ttr >= 0.5 ? 16 : 12;
        } else if (stats.totalWords < 200) {
            // Medium text
            vocabScore = ttr >= 0.5 ? 20 : ttr >= 0.4 ? 17 : ttr >= 0.3 ? 14 : 10;
        } else {
            // Longer text - use adjusted TTR
            vocabScore = lengthAdjustedTTR >= 0.6 ? 20 : lengthAdjustedTTR >= 0.45 ? 17 : lengthAdjustedTTR >= 0.3 ? 14 : 10;
        }
        
        score += vocabScore;
        breakdown.vocabulary = vocabScore;
    } else {
        score += 10;
        breakdown.vocabulary = 10;
    }
    
    // ==========================================
    // 4. CLARITY & STYLE (20 points max)
    // Based on detected issues
    // ==========================================
    const issueCount = suggestions.length;
    const wordsPerIssue = stats.totalWords / Math.max(1, issueCount);
    let clarityScore = 0;
    
    if (issueCount === 0) {
        clarityScore = 20; // Perfect
    } else if (wordsPerIssue >= 100) {
        clarityScore = 18; // Very few issues (1 per 100 words or less)
    } else if (wordsPerIssue >= 50) {
        clarityScore = 15; // Few issues
    } else if (wordsPerIssue >= 25) {
        clarityScore = 12; // Some issues
    } else if (wordsPerIssue >= 15) {
        clarityScore = 9; // Many issues
    } else {
        clarityScore = 6; // Too many issues
    }
    
    score += clarityScore;
    breakdown.clarity = clarityScore;
    
    // ==========================================
    // 5. CONTENT DEPTH (15 points max)
    // Based on text length and paragraph structure
    // ==========================================
    let depthScore = 0;
    
    if (stats.totalWords >= 100) {
        depthScore += 5; // Minimum length met
    }
    if (stats.totalWords >= 200) {
        depthScore += 3;
    }
    if (stats.totalWords >= 300) {
        depthScore += 2;
    }
    if (stats.totalParagraphs >= 2) {
        depthScore += 2; // Multiple paragraphs
    }
    if (stats.totalParagraphs >= 3) {
        depthScore += 2;
    }
    if (stats.totalSentences >= 5) {
        depthScore += 1;
    }
    
    depthScore = Math.min(15, depthScore);
    score += depthScore;
    breakdown.depth = depthScore;
    
    // ==========================================
    // BONUS POINTS (up to 5 extra)
    // ==========================================
    let bonus = 0;
    
    // Bonus for good sentiment balance
    if (sentiment?.score !== undefined) {
        const sentimentScore = sentiment.score;
        if (sentimentScore >= -0.2 && sentimentScore <= 0.3) {
            bonus += 2; // Balanced/slightly positive tone
        }
    }
    
    // Bonus for having keywords (indicates focused writing)
    if (stats.uniqueWords >= 20) {
        bonus += 1;
    }
    
    // Bonus for varied sentence structure (if we have data)
    if (readability?.complexWordPercent !== undefined) {
        if (readability.complexWordPercent >= 10 && readability.complexWordPercent <= 30) {
            bonus += 2; // Good balance of simple and complex words
        }
    }
    
    score += Math.min(5, bonus);
    breakdown.bonus = Math.min(5, bonus);
    
    // Final score (capped at 100)
    const finalScore = Math.min(100, Math.max(0, Math.round(score)));
    
    return { score: finalScore, breakdown };
}

// Get score color and label
function getScoreColor(score) {
    if (score >= 90) return { color: '#059669', label: 'Outstanding', bg: '#D1FAE5', emoji: '🌟' };
    if (score >= 80) return { color: '#10B981', label: 'Excellent', bg: '#D1FAE5', emoji: '✨' };
    if (score >= 70) return { color: '#22C55E', label: 'Very Good', bg: '#DCFCE7', emoji: '👍' };
    if (score >= 60) return { color: '#84CC16', label: 'Good', bg: '#ECFCCB', emoji: '👌' };
    if (score >= 50) return { color: '#EAB308', label: 'Fair', bg: '#FEF9C3', emoji: '📝' };
    if (score >= 40) return { color: '#F97316', label: 'Needs Improvement', bg: '#FFEDD5', emoji: '📚' };
    return { color: '#EF4444', label: 'Needs Work', bg: '#FEE2E2', emoji: '✏️' };
}

export default function ExportPanel({ text, stats, wordFrequency, readability, sentiment, keywords, suggestions = [] }) {
    const [exporting, setExporting] = useState(null);

    const scoreResult = calculateOverallScore(stats, readability, sentiment, suggestions);
    const overallScore = typeof scoreResult === 'object' ? scoreResult.score : scoreResult;
    const scoreBreakdown = typeof scoreResult === 'object' ? scoreResult.breakdown : null;
    const scoreInfo = getScoreColor(overallScore);

    const generateReport = () => {
        const topWords = Object.entries(wordFrequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        return {
            generatedAt: new Date().toISOString(),
            textPreview: text.slice(0, 200) + (text.length > 200 ? '...' : ''),
            fullText: text,
            overallScore,
            scoreBreakdown,
            statistics: {
                totalCharacters: stats.totalChars,
                charactersWithoutSpaces: stats.totalCharsNoSpaces,
                totalWords: stats.totalWords,
                totalSentences: stats.totalSentences,
                totalParagraphs: stats.totalParagraphs,
                uniqueWords: stats.uniqueWords,
                readingTimeMinutes: Math.ceil(stats.totalWords / 200),
                speakingTimeMinutes: Math.ceil(stats.totalWords / 130)
            },
            readability: readability || {},
            sentiment: sentiment || {},
            keywords: keywords?.map(k => k.word) || [],
            topWords: topWords.map(([word, count]) => ({ word, count })),
            suggestions: suggestions || []
        };
    };

    const exportAsPDF = async () => {
        setExporting('pdf');
        
        try {
            const report = generateReport();
            const doc = new jsPDF('p', 'mm', 'a4');
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 15;
            let y = margin;

            const checkPageBreak = (neededSpace) => {
                if (y + neededSpace > pageHeight - margin) {
                    doc.addPage();
                    y = margin;
                    return true;
                }
                return false;
            };

            // =====================
            // PAGE 1: HEADER & SCORE
            // =====================
            
            // Header background
            doc.setFillColor(79, 70, 229);
            doc.rect(0, 0, pageWidth, 50, 'F');
            
            // Logo
            doc.setFillColor(255, 255, 255);
            doc.roundedRect(margin, 12, 26, 26, 4, 4, 'F');
            doc.setFontSize(18);
            doc.setTextColor('#4F46E5');
            doc.setFont('helvetica', 'bold');
            doc.text('T', margin + 9, 29);
            
            // Title
            doc.setTextColor('#FFFFFF');
            doc.setFontSize(24);
            doc.text('Text Analysis Report', margin + 35, 24);
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { 
                year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
            })}`, margin + 35, 35);

            y = 60;

            // =====================
            // OVERALL SCORE SECTION
            // =====================
            doc.setFillColor(scoreInfo.bg);
            doc.roundedRect(margin, y, pageWidth - margin * 2, 45, 4, 4, 'F');
            
            // Score circle
            doc.setFillColor(255, 255, 255);
            doc.circle(margin + 25, y + 22, 18, 'F');
            doc.setDrawColor(scoreInfo.color);
            doc.setLineWidth(3);
            doc.circle(margin + 25, y + 22, 18, 'S');
            
            // Score number
            doc.setFontSize(22);
            doc.setTextColor(scoreInfo.color);
            doc.setFont('helvetica', 'bold');
            doc.text(String(overallScore), margin + 25, y + 26, { align: 'center' });
            
            // Score label
            doc.setFontSize(16);
            doc.setTextColor('#1E293B');
            doc.text(`${scoreInfo.emoji} ${scoreInfo.label}`, margin + 52, y + 18);
            
            doc.setFontSize(11);
            doc.setTextColor('#64748B');
            doc.setFont('helvetica', 'normal');
            doc.text('Overall Writing Score', margin + 52, y + 28);
            
            // Score breakdown
            if (scoreBreakdown) {
                doc.setFontSize(8);
                const breakdownText = `Readability: ${scoreBreakdown.readability}/25 | Structure: ${scoreBreakdown.sentenceStructure}/20 | Vocabulary: ${scoreBreakdown.vocabulary}/20 | Clarity: ${scoreBreakdown.clarity}/20 | Depth: ${scoreBreakdown.depth}/15`;
                doc.text(breakdownText, margin + 52, y + 38);
            }

            y += 55;

            // =====================
            // STATISTICS GRID
            // =====================
            doc.setFontSize(14);
            doc.setTextColor('#1E293B');
            doc.setFont('helvetica', 'bold');
            doc.text('Statistics Overview', margin, y);
            y += 8;
            
            doc.setDrawColor('#E2E8F0');
            doc.setLineWidth(0.5);
            doc.line(margin, y, pageWidth - margin, y);
            y += 8;

            const statsData = [
                ['Words', report.statistics.totalWords.toLocaleString()],
                ['Characters', report.statistics.totalCharacters.toLocaleString()],
                ['Sentences', report.statistics.totalSentences.toLocaleString()],
                ['Paragraphs', report.statistics.totalParagraphs.toLocaleString()],
                ['Unique Words', report.statistics.uniqueWords.toLocaleString()],
                ['Reading Time', `${report.statistics.readingTimeMinutes} min`],
            ];

            const colWidth = (pageWidth - margin * 2) / 3;
            statsData.forEach((stat, i) => {
                const col = i % 3;
                const row = Math.floor(i / 3);
                const x = margin + col * colWidth;
                const yPos = y + row * 18;
                
                doc.setFillColor('#F8FAFC');
                doc.roundedRect(x, yPos, colWidth - 5, 15, 2, 2, 'F');
                
                doc.setFontSize(8);
                doc.setTextColor('#64748B');
                doc.setFont('helvetica', 'normal');
                doc.text(stat[0], x + 5, yPos + 5);
                
                doc.setFontSize(12);
                doc.setTextColor('#1E293B');
                doc.setFont('helvetica', 'bold');
                doc.text(stat[1], x + 5, yPos + 12);
            });

            y += 42;

            // =====================
            // READABILITY METRICS
            // =====================
            checkPageBreak(50);
            doc.setFontSize(14);
            doc.setTextColor('#1E293B');
            doc.setFont('helvetica', 'bold');
            doc.text('Readability Analysis', margin, y);
            y += 8;
            doc.setDrawColor('#E2E8F0');
            doc.line(margin, y, pageWidth - margin, y);
            y += 8;

            const readabilityData = [
                ['Flesch Reading Ease', `${report.readability.fleschReading || 'N/A'}/100`],
                ['Grade Level', report.readability.gradeLevel || 'N/A'],
                ['Audience', report.readability.audienceLevel || 'N/A'],
                ['Avg. Word Length', `${report.readability.avgWordLength || 'N/A'} chars`],
                ['Avg. Sentence Length', `${report.readability.avgSentenceLength || 'N/A'} words`],
                ['Complex Words', `${report.readability.complexWordPercent || 0}%`],
            ];

            readabilityData.forEach((item, i) => {
                const col = i % 2;
                const row = Math.floor(i / 2);
                const x = margin + col * ((pageWidth - margin * 2) / 2);
                const yPos = y + row * 10;
                
                doc.setFontSize(9);
                doc.setTextColor('#64748B');
                doc.setFont('helvetica', 'normal');
                doc.text(item[0] + ':', x, yPos);
                
                doc.setTextColor('#1E293B');
                doc.setFont('helvetica', 'bold');
                doc.text(item[1], x + 50, yPos);
            });

            y += 38;

            // =====================
            // ISSUES SECTION
            // =====================
            if (suggestions.length > 0) {
                checkPageBreak(50);
                
                doc.setFontSize(14);
                doc.setTextColor('#1E293B');
                doc.setFont('helvetica', 'bold');
                doc.text(`Identified Issues (${suggestions.length})`, margin, y);
                y += 8;
                doc.setDrawColor('#E2E8F0');
                doc.line(margin, y, pageWidth - margin, y);
                y += 8;

                const issueColors = {
                    grammar: { fill: '#FEE2E2', text: '#DC2626', badge: '#EF4444' },
                    style: { fill: '#FEF3C7', text: '#D97706', badge: '#F59E0B' },
                    clarity: { fill: '#DBEAFE', text: '#2563EB', badge: '#3B82F6' },
                    tone: { fill: '#F3E8FF', text: '#7C3AED', badge: '#8B5CF6' },
                    structure: { fill: '#D1FAE5', text: '#059669', badge: '#10B981' }
                };

                suggestions.slice(0, 8).forEach((issue, i) => {
                    checkPageBreak(20);
                    
                    const colors = issueColors[issue.type] || issueColors.style;
                    
                    // Issue background
                    doc.setFillColor(colors.fill);
                    doc.roundedRect(margin, y, pageWidth - margin * 2, 16, 2, 2, 'F');
                    
                    // Type badge
                    doc.setFillColor(colors.badge);
                    doc.roundedRect(margin + 3, y + 3, 20, 5, 1, 1, 'F');
                    doc.setFontSize(6);
                    doc.setTextColor('#FFFFFF');
                    doc.setFont('helvetica', 'bold');
                    doc.text((issue.type || 'ISSUE').toUpperCase(), margin + 5, y + 6.5);
                    
                    // Issue title
                    doc.setFontSize(9);
                    doc.setTextColor(colors.text);
                    doc.setFont('helvetica', 'bold');
                    doc.text(issue.title || 'Issue', margin + 26, y + 7);
                    
                    // Original text
                    if (issue.original) {
                        doc.setFontSize(8);
                        doc.setTextColor('#64748B');
                        doc.setFont('helvetica', 'normal');
                        const originalText = `"${issue.original.slice(0, 50)}${issue.original.length > 50 ? '...' : ''}"`;
                        doc.text(originalText, margin + 26, y + 13);
                    }
                    
                    y += 19;
                });

                if (suggestions.length > 8) {
                    doc.setFontSize(9);
                    doc.setTextColor('#64748B');
                    doc.setFont('helvetica', 'italic');
                    doc.text(`... and ${suggestions.length - 8} more issues`, margin, y);
                    y += 8;
                }
            }

            // =====================
            // PAGE 2+: ANALYZED TEXT WITH HIGHLIGHTS
            // =====================
            doc.addPage();
            y = margin;

            doc.setFontSize(16);
            doc.setTextColor('#1E293B');
            doc.setFont('helvetica', 'bold');
            doc.text('Your Text with Highlighted Issues', margin, y);
            y += 6;
            
            doc.setFontSize(9);
            doc.setTextColor('#EF4444');
            doc.setFont('helvetica', 'normal');
            doc.text('Red underlined text indicates issues that need attention', margin, y);
            y += 10;
            
            doc.setDrawColor('#E2E8F0');
            doc.line(margin, y, pageWidth - margin, y);
            y += 8;

            // Prepare issues map for highlighting
            const validIssues = suggestions
                .filter(s => s.start !== undefined && s.end !== undefined)
                .sort((a, b) => a.start - b.start);

            // Remove overlapping issues
            const nonOverlapping = [];
            let lastEnd = -1;
            validIssues.forEach(issue => {
                if (issue.start >= lastEnd) {
                    nonOverlapping.push(issue);
                    lastEnd = issue.end;
                }
            });

            // Render text with highlighting
            doc.setFontSize(10);
            const lineHeight = 5;
            const maxWidth = pageWidth - margin * 2;
            
            // Process text character by character with issue tracking
            let currentX = margin;
            let charIndex = 0;
            
            const getIssueAtIndex = (idx) => {
                return nonOverlapping.find(issue => idx >= issue.start && idx < issue.end);
            };

            // Split into words for better line handling
            const words = text.split(/(\s+)/);
            let globalIndex = 0;

            words.forEach(word => {
                if (!word) return;
                
                const wordWidth = doc.getTextWidth(word);
                
                // Check if we need a new line
                if (currentX + wordWidth > pageWidth - margin && word.trim()) {
                    currentX = margin;
                    y += lineHeight;
                    checkPageBreak(lineHeight);
                }
                
                // Check if this word contains any issues
                const wordStart = globalIndex;
                const wordEnd = globalIndex + word.length;
                const issueInWord = nonOverlapping.find(
                    issue => (issue.start < wordEnd && issue.end > wordStart)
                );
                
                if (issueInWord && word.trim()) {
                    // Draw word with red underline
                    doc.setTextColor('#1E293B');
                    doc.text(word, currentX, y);
                    
                    // Draw red wavy underline
                    doc.setDrawColor('#EF4444');
                    doc.setLineWidth(0.5);
                    
                    const underlineY = y + 1;
                    // Simple underline
                    doc.line(currentX, underlineY, currentX + wordWidth, underlineY);
                    
                    // Double underline for emphasis
                    doc.setLineWidth(0.3);
                    doc.line(currentX, underlineY + 0.8, currentX + wordWidth, underlineY + 0.8);
                } else {
                    // Normal text
                    doc.setTextColor('#334155');
                    doc.text(word, currentX, y);
                }
                
                currentX += wordWidth;
                globalIndex += word.length;
            });

            // =====================
            // ISSUE LEGEND AT BOTTOM
            // =====================
            y += 20;
            checkPageBreak(30);
            
            doc.setDrawColor('#E2E8F0');
            doc.line(margin, y, pageWidth - margin, y);
            y += 8;
            
            doc.setFontSize(10);
            doc.setTextColor('#1E293B');
            doc.setFont('helvetica', 'bold');
            doc.text('Issue Legend:', margin, y);
            y += 6;
            
            const legendItems = [
                { type: 'grammar', label: 'Grammar Issues', color: '#EF4444' },
                { type: 'style', label: 'Style Improvements', color: '#F59E0B' },
                { type: 'clarity', label: 'Clarity Suggestions', color: '#3B82F6' },
            ];
            
            legendItems.forEach((item, i) => {
                const x = margin + i * 60;
                doc.setFillColor(item.color);
                doc.circle(x + 2, y + 1, 2, 'F');
                doc.setFontSize(8);
                doc.setTextColor('#64748B');
                doc.setFont('helvetica', 'normal');
                doc.text(item.label, x + 6, y + 2);
            });

            // =====================
            // FOOTER ON ALL PAGES
            // =====================
            const totalPages = doc.internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor('#94A3B8');
                doc.setFont('helvetica', 'normal');
                doc.text(
                    `Textalyzer Report • Page ${i} of ${totalPages} • Score: ${overallScore}/100 ${scoreInfo.emoji}`,
                    pageWidth / 2,
                    pageHeight - 8,
                    { align: 'center' }
                );
            }

            // Add PDF metadata for security and trust
            doc.setProperties({
                title: 'Textalyzer Analysis Report',
                subject: 'Text Analysis Report',
                author: 'Textalyzer',
                keywords: 'text analysis, readability, grammar, writing',
                creator: 'Textalyzer - textalyzer.app'
            });

            // Save PDF with timestamp for unique filename
            const timestamp = new Date().toISOString().slice(0, 10);
            const filename = `textalyzer-report-${timestamp}.pdf`;
            
            // Get PDF as blob for better download handling
            const pdfBlob = doc.output('blob');
            downloadBlob(pdfBlob, filename);
            
            toast.success('PDF report exported successfully!');
        } catch (error) {
            console.error('PDF export error:', error);
            toast.error('Failed to export PDF. Please try again.');
        } finally {
            setExporting(null);
        }
    };

    const exportAsJSON = () => {
        setExporting('json');
        const report = generateReport();
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        downloadBlob(blob, 'text-analysis.json');
        toast.success('Exported as JSON');
        setExporting(null);
    };

    const exportAsCSV = () => {
        setExporting('csv');
        const report = generateReport();
        
        let csv = 'Metric,Value\n';
        csv += `Overall Score,${report.overallScore}/100 (${scoreInfo.label})\n`;
        if (scoreBreakdown) {
            csv += `Readability Score,${scoreBreakdown.readability}/25\n`;
            csv += `Structure Score,${scoreBreakdown.sentenceStructure}/20\n`;
            csv += `Vocabulary Score,${scoreBreakdown.vocabulary}/20\n`;
            csv += `Clarity Score,${scoreBreakdown.clarity}/20\n`;
            csv += `Depth Score,${scoreBreakdown.depth}/15\n`;
        }
        csv += `Total Characters,${report.statistics.totalCharacters}\n`;
        csv += `Characters (no spaces),${report.statistics.charactersWithoutSpaces}\n`;
        csv += `Total Words,${report.statistics.totalWords}\n`;
        csv += `Total Sentences,${report.statistics.totalSentences}\n`;
        csv += `Total Paragraphs,${report.statistics.totalParagraphs}\n`;
        csv += `Unique Words,${report.statistics.uniqueWords}\n`;
        csv += `Reading Time (min),${report.statistics.readingTimeMinutes}\n`;
        csv += `Flesch Reading Ease,${report.readability.fleschReading || 'N/A'}\n`;
        csv += `Grade Level,${report.readability.gradeLevel || 'N/A'}\n`;
        csv += `Sentiment,${report.sentiment.label || 'N/A'}\n`;
        csv += `Issues Found,${report.suggestions.length}\n`;
        csv += '\nWord,Frequency\n';
        report.topWords.forEach(({ word, count }) => {
            csv += `${word},${count}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        downloadBlob(blob, 'text-analysis.csv');
        toast.success('Exported as CSV');
        setExporting(null);
    };

    const exportAsTXT = () => {
        setExporting('txt');
        const report = generateReport();
        
        let txt = `TEXTALYZER - TEXT ANALYSIS REPORT
Generated: ${new Date().toLocaleString()}
${'═'.repeat(60)}

OVERALL SCORE: ${report.overallScore}/100 ${scoreInfo.emoji} (${scoreInfo.label})
`;
        
        if (scoreBreakdown) {
            txt += `
Score Breakdown:
  • Readability: ${scoreBreakdown.readability}/25
  • Sentence Structure: ${scoreBreakdown.sentenceStructure}/20
  • Vocabulary Richness: ${scoreBreakdown.vocabulary}/20
  • Clarity & Style: ${scoreBreakdown.clarity}/20
  • Content Depth: ${scoreBreakdown.depth}/15
`;
        }

        txt += `
${'─'.repeat(60)}
STATISTICS
${'─'.repeat(60)}
Total Characters: ${report.statistics.totalCharacters.toLocaleString()}
Characters (no spaces): ${report.statistics.charactersWithoutSpaces.toLocaleString()}
Total Words: ${report.statistics.totalWords.toLocaleString()}
Total Sentences: ${report.statistics.totalSentences.toLocaleString()}
Total Paragraphs: ${report.statistics.totalParagraphs.toLocaleString()}
Unique Words: ${report.statistics.uniqueWords.toLocaleString()}
Reading Time: ~${report.statistics.readingTimeMinutes} min
Speaking Time: ~${report.statistics.speakingTimeMinutes} min

${'─'.repeat(60)}
READABILITY
${'─'.repeat(60)}
Flesch Reading Ease: ${report.readability.fleschReading || 'N/A'}/100
Grade Level: ${report.readability.gradeLevel || 'N/A'}
Audience Level: ${report.readability.audienceLevel || 'N/A'}
Avg Word Length: ${report.readability.avgWordLength || 'N/A'} chars
Avg Sentence Length: ${report.readability.avgSentenceLength || 'N/A'} words
Complex Words: ${report.readability.complexWordPercent || 0}%

${'─'.repeat(60)}
SENTIMENT
${'─'.repeat(60)}
Overall: ${report.sentiment.label || 'N/A'}
Score: ${report.sentiment.score || 'N/A'}
Positive Words: ${report.sentiment.positive || 0}
Negative Words: ${report.sentiment.negative || 0}

${'─'.repeat(60)}
ISSUES FOUND: ${report.suggestions.length}
${'─'.repeat(60)}
${report.suggestions.map((s, i) => `${i + 1}. [${(s.type || 'ISSUE').toUpperCase()}] ${s.title}\n   "${(s.original || '').slice(0, 50)}..."`).join('\n\n')}

${'─'.repeat(60)}
TOP 10 WORDS
${'─'.repeat(60)}
${report.topWords.map(({ word, count }, i) => `${i + 1}. ${word}: ${count}`).join('\n')}

${'═'.repeat(60)}
FULL TEXT:
${'─'.repeat(60)}
${report.fullText}
`;

        const blob = new Blob([txt], { type: 'text/plain' });
        downloadBlob(blob, 'text-analysis.txt');
        toast.success('Exported as TXT');
        setExporting(null);
    };

    const downloadBlob = (blob, filename) => {
        // Create a more trusted download experience
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        a.setAttribute('rel', 'noopener noreferrer');
        
        // Adding to body and using setTimeout helps avoid security warnings
        document.body.appendChild(a);
        
        // Small delay to ensure browser recognizes the user action
        setTimeout(() => {
            a.click();
            // Clean up after a delay
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
        }, 0);
    };

    if (stats.totalWords === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                        title="Export Analysis"
                    >
                        <Download className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-2">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-slate-700">Export Analysis</p>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full`} style={{ backgroundColor: scoreInfo.bg, color: scoreInfo.color }}>
                                {scoreInfo.emoji} {overallScore}/100
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{scoreInfo.label}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={exportAsPDF} className="cursor-pointer">
                        {exporting === 'pdf' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileType className="w-4 h-4 mr-2 text-red-500" />}
                        <span className="flex-1">Export as PDF</span>
                        <Sparkles className="w-3 h-3 text-amber-500" />
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={exportAsJSON} className="cursor-pointer">
                        {exporting === 'json' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileJson className="w-4 h-4 mr-2 text-amber-500" />}
                        Export as JSON
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={exportAsCSV} className="cursor-pointer">
                        {exporting === 'csv' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileSpreadsheet className="w-4 h-4 mr-2 text-emerald-500" />}
                        Export as CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={exportAsTXT} className="cursor-pointer">
                        {exporting === 'txt' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2 text-blue-500" />}
                        Export as TXT
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </motion.div>
    );
}

// Export scoring function for use elsewhere
export { calculateOverallScore, getScoreColor };
