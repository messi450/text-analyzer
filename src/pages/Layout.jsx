import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Github, Twitter, Mail, Shield, FileText, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Layout({ children, currentPageName }) {
    const location = useLocation();
    const isLegalPage = ['/privacy', '/terms'].includes(location.pathname);
    
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
            {/* Skip to main content for accessibility */}
            <a 
                href="#main-content" 
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-lg"
            >
                Skip to main content
            </a>
            
            {/* Main Content */}
            <main id="main-content" className="flex-1">
                {children}
            </main>
            
            {/* Footer */}
            <footer className="border-t border-slate-200/60 bg-white/80 backdrop-blur-md">
                <div className="max-w-6xl mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {/* Brand */}
                        <div className="md:col-span-2">
                            <Link to="/" className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                    <Sparkles className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-lg font-bold bg-gradient-to-r from-indigo-700 to-purple-600 bg-clip-text text-transparent">
                                    Textalyzer
                                </span>
                            </Link>
                            <p className="text-sm text-slate-600 max-w-md mb-4">
                                AI-powered text analyzer that helps you improve your writing with readability scores, 
                                sentiment analysis, grammar suggestions, and professional writing improvements.
                            </p>
                            <div className="flex items-center gap-3">
                                <a 
                                    href="https://twitter.com/Javlonbek_sk" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 transition-colors"
                                    aria-label="Follow us on Twitter"
                                >
                                    <Twitter className="w-4 h-4" />
                                </a>
                                <a 
                                    href="https://github.com/messi450" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 transition-colors"
                                    aria-label="View our GitHub"
                                >
                                    <Github className="w-4 h-4" />
                                </a>
                                <a 
                                    href="mailto:orozovjavlon28@gmail.com"
                                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 transition-colors"
                                    aria-label="Contact us via email"
                                >
                                    <Mail className="w-4 h-4" />
                                </a>
                            </div>
                        </div>
                        
                        {/* Features */}
                        <div>
                            <h3 className="text-sm font-semibold text-slate-800 mb-3">Features</h3>
                            <ul className="space-y-2 text-sm text-slate-600">
                                <li>
                                    <span className="hover:text-indigo-600 transition-colors cursor-default">
                                        Readability Analysis
                                    </span>
                                </li>
                                <li>
                                    <span className="hover:text-indigo-600 transition-colors cursor-default">
                                        Sentiment Analysis
                                    </span>
                                </li>
                                <li>
                                    <span className="hover:text-indigo-600 transition-colors cursor-default">
                                        Grammar Checker
                                    </span>
                                </li>
                                <li>
                                    <span className="hover:text-indigo-600 transition-colors cursor-default">
                                        AI Writing Assistant
                                    </span>
                                </li>
                                <li>
                                    <span className="hover:text-indigo-600 transition-colors cursor-default">
                                        Export Reports
                                    </span>
                                </li>
                            </ul>
                        </div>
                        
                        {/* Legal */}
                        <div>
                            <h3 className="text-sm font-semibold text-slate-800 mb-3">Legal</h3>
                            <ul className="space-y-2 text-sm text-slate-600">
                                <li>
                                    <Link 
                                        to="/privacy" 
                                        className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors"
                                    >
                                        <Shield className="w-3.5 h-3.5" />
                                        Privacy Policy
                                    </Link>
                                </li>
                                <li>
                                    <Link 
                                        to="/terms" 
                                        className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors"
                                    >
                                        <FileText className="w-3.5 h-3.5" />
                                        Terms of Service
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                    
                    {/* Bottom Bar */}
                    <div className="mt-8 pt-6 border-t border-slate-200/60">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-xs text-slate-500">
                                © {new Date().getFullYear()} Textalyzer. All rights reserved.
                            </p>
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                                Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for better writing
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
