import React from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Helmet } from 'react-helmet-async';

export default function Privacy() {
    return (
        <>
            <Helmet>
                <title>Privacy Policy - Textalyzer | Data Protection & Security</title>
                <meta name="description" content="Learn how Textalyzer protects your privacy and handles your data. Our comprehensive privacy policy explains data collection, usage, and security measures." />
                <meta name="keywords" content="privacy policy, data protection, GDPR, text analyzer privacy, data security, user privacy" />
                <meta property="og:title" content="Privacy Policy - Textalyzer" />
                <meta property="og:description" content="Learn how Textalyzer protects your privacy and handles your data." />
                <meta property="og:url" content="https://textalyzer.app/privacy" />
                <meta name="twitter:title" content="Privacy Policy - Textalyzer" />
                <meta name="twitter:description" content="Learn how Textalyzer protects your privacy and handles your data." />
                <link rel="canonical" href="https://textalyzer.app/privacy" />
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
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Privacy Policy</h1>
                                <p className="text-sm text-slate-500">Last updated: January 2025</p>
                            </div>
                        </div>
                        
                        <div className="prose prose-slate max-w-none">
                            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">1. Introduction</h2>
                            <p className="text-slate-600 mb-4">
                                Welcome to Textalyzer. We are committed to protecting your privacy and ensuring the security 
                                of your personal information. This Privacy Policy explains how we collect, use, and safeguard 
                                your data when you use our text analysis service.
                            </p>
                            
                            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">2. Information We Collect</h2>
                            <p className="text-slate-600 mb-4">
                                <strong>Text Content:</strong> When you use Textalyzer to analyze text, the text you input is 
                                processed to provide analysis results. We do not permanently store your text content unless 
                                you explicitly choose to save an analysis.
                            </p>
                            <p className="text-slate-600 mb-4">
                                <strong>Account Information:</strong> If you create an account, we collect your email address 
                                and any profile information you choose to provide.
                            </p>
                            <p className="text-slate-600 mb-4">
                                <strong>Usage Data:</strong> We collect anonymous usage statistics to improve our service, 
                                including page views, feature usage, and error reports.
                            </p>
                            
                            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">3. How We Use Your Information</h2>
                            <ul className="list-disc pl-6 text-slate-600 mb-4 space-y-2">
                                <li>To provide text analysis services</li>
                                <li>To save your analyses when requested</li>
                                <li>To improve and optimize our service</li>
                                <li>To communicate with you about updates or support</li>
                                <li>To ensure security and prevent abuse</li>
                            </ul>
                            
                            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">4. Data Security</h2>
                            <p className="text-slate-600 mb-4">
                                We implement industry-standard security measures to protect your data, including encryption 
                                in transit (HTTPS), secure data storage, and regular security audits. Your text is processed 
                                securely and is not shared with third parties except as necessary to provide our AI-powered 
                                analysis features.
                            </p>
                            
                            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">5. AI Processing</h2>
                            <p className="text-slate-600 mb-4">
                                Our AI writing assistant features use third-party AI services to analyze and improve your text. 
                                Text sent to AI services is processed according to their privacy policies. We do not use your 
                                text to train AI models.
                            </p>
                            
                            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">6. Cookies</h2>
                            <p className="text-slate-600 mb-4">
                                We use essential cookies to maintain your session and preferences. We do not use tracking 
                                cookies for advertising purposes.
                            </p>
                            
                            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">7. Your Rights</h2>
                            <p className="text-slate-600 mb-4">
                                You have the right to:
                            </p>
                            <ul className="list-disc pl-6 text-slate-600 mb-4 space-y-2">
                                <li>Access your personal data</li>
                                <li>Delete your account and associated data</li>
                                <li>Export your saved analyses</li>
                                <li>Opt out of non-essential communications</li>
                            </ul>
                            
                            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">8. Contact Us</h2>
                            <p className="text-slate-600 mb-4">
                                If you have any questions about this Privacy Policy or our data practices, please contact us at:
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

