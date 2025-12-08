import React from 'react';
import { motion } from 'framer-motion';
import { FileText, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Helmet } from 'react-helmet-async';

export default function Terms() {
    return (
        <>
            <Helmet>
                <title>Terms of Service - Textalyzer | Usage Agreement</title>
                <meta name="description" content="Read Textalyzer's terms of service and usage agreement. Understand our service conditions, user responsibilities, and legal agreements." />
                <meta name="keywords" content="terms of service, terms and conditions, usage agreement, text analyzer terms, legal agreement" />
                <meta property="og:title" content="Terms of Service - Textalyzer" />
                <meta property="og:description" content="Read Textalyzer's terms of service and usage agreement." />
                <meta property="og:url" content="https://textalyzer.app/terms" />
                <meta name="twitter:title" content="Terms of Service - Textalyzer" />
                <meta name="twitter:description" content="Read Textalyzer's terms of service and usage agreement." />
                <link rel="canonical" href="https://textalyzer.app/terms" />
            </Helmet>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
            <div className="max-w-4xl mx-auto px-4 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Link to="/">
                        <Button variant="ghost" className="mb-8">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Textalyzer
                        </Button>
                    </Link>
                    
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-8 md:p-12 shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                <FileText className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Terms of Service</h1>
                                <p className="text-sm text-slate-500">Last updated: January 2025</p>
                            </div>
                        </div>
                        
                        <div className="prose prose-slate max-w-none">
                            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">1. Acceptance of Terms</h2>
                            <p className="text-slate-600 mb-4">
                                By accessing and using Textalyzer ("the Service"), you agree to be bound by these Terms of 
                                Service. If you do not agree to these terms, please do not use the Service.
                            </p>
                            
                            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">2. Description of Service</h2>
                            <p className="text-slate-600 mb-4">
                                Textalyzer is an AI-powered text analysis tool that provides:
                            </p>
                            <ul className="list-disc pl-6 text-slate-600 mb-4 space-y-2">
                                <li>Readability analysis and scoring</li>
                                <li>Sentiment analysis</li>
                                <li>Grammar and style suggestions</li>
                                <li>Keyword extraction</li>
                                <li>AI-powered writing assistance</li>
                                <li>Text export and reporting features</li>
                            </ul>
                            
                            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">3. User Responsibilities</h2>
                            <p className="text-slate-600 mb-4">
                                You agree to:
                            </p>
                            <ul className="list-disc pl-6 text-slate-600 mb-4 space-y-2">
                                <li>Use the Service only for lawful purposes</li>
                                <li>Not submit text containing illegal, harmful, or offensive content</li>
                                <li>Not attempt to circumvent security measures</li>
                                <li>Not use automated systems to access the Service without permission</li>
                                <li>Maintain the security of your account credentials</li>
                            </ul>
                            
                            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">4. Intellectual Property</h2>
                            <p className="text-slate-600 mb-4">
                                <strong>Your Content:</strong> You retain all rights to the text you submit for analysis. 
                                We do not claim ownership of your content.
                            </p>
                            <p className="text-slate-600 mb-4">
                                <strong>Our Service:</strong> The Textalyzer service, including its design, features, and 
                                technology, is protected by intellectual property laws. You may not copy, modify, or 
                                redistribute our service without permission.
                            </p>
                            
                            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">5. AI-Generated Content</h2>
                            <p className="text-slate-600 mb-4">
                                Our AI writing assistant provides suggestions and rewrites based on your input. While we 
                                strive for accuracy, AI-generated content should be reviewed before use. You are responsible 
                                for verifying the appropriateness and accuracy of any AI suggestions you choose to use.
                            </p>
                            
                            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">6. Disclaimer of Warranties</h2>
                            <p className="text-slate-600 mb-4">
                                The Service is provided "as is" without warranties of any kind. We do not guarantee that:
                            </p>
                            <ul className="list-disc pl-6 text-slate-600 mb-4 space-y-2">
                                <li>The Service will be uninterrupted or error-free</li>
                                <li>Analysis results will be 100% accurate</li>
                                <li>The Service will meet all your requirements</li>
                            </ul>
                            
                            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">7. Limitation of Liability</h2>
                            <p className="text-slate-600 mb-4">
                                To the maximum extent permitted by law, Textalyzer shall not be liable for any indirect, 
                                incidental, special, or consequential damages arising from your use of the Service.
                            </p>
                            
                            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">8. Changes to Terms</h2>
                            <p className="text-slate-600 mb-4">
                                We may update these Terms from time to time. Continued use of the Service after changes 
                                constitutes acceptance of the new terms. We will notify users of significant changes.
                            </p>
                            
                            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">9. Termination</h2>
                            <p className="text-slate-600 mb-4">
                                We reserve the right to terminate or suspend access to the Service for violations of these 
                                Terms or for any other reason at our discretion.
                            </p>
                            
                            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">10. Contact</h2>
                            <p className="text-slate-600 mb-4">
                                For questions about these Terms, contact us at:
                            </p>
                            <p className="text-slate-600">
                                <a href="mailto:orozovjavlon28@gmail.com" className="text-indigo-600 hover:underline">
                                    orozovjavlon28@gmail.com
                                </a>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
        </>
    );
}

