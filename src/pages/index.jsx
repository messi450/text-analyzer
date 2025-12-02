import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import Layout from './Layout.jsx';
import env from '@/lib/env';

// Lazy load pages for better performance
const TextAnalyzer = lazy(() => import('./TextAnalyzer'));
const Privacy = lazy(() => import('./Privacy'));
const Terms = lazy(() => import('./Terms'));

// Loading spinner component
const PageLoader = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-sm text-slate-500 animate-pulse">Loading Textalyzer...</p>
        </div>
    </div>
);

// Query client configuration with caching
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            cacheTime: 1000 * 60 * 30, // 30 minutes
            retry: 2,
            refetchOnWindowFocus: false,
        },
    },
});

const PAGES = {
    TextAnalyzer: TextAnalyzer,
    Privacy: Privacy,
    Terms: Terms,
};

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || 'TextAnalyzer';
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);

    // Track page views for analytics
    React.useEffect(() => {
        if (env.isProduction && window.gtag && env.GA_TRACKING_ID) {
            window.gtag('config', env.GA_TRACKING_ID, {
                page_title: document.title,
                page_location: window.location.href,
                page_path: location.pathname
            });
        }
    }, [location.pathname]);

    return (
        <Layout currentPageName={currentPage}>
            <Suspense fallback={<PageLoader />}>
                <Routes>
                    <Route path="/" element={<TextAnalyzer />} />
                    <Route path="/TextAnalyzer" element={<TextAnalyzer />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/terms" element={<Terms />} />
                    {/* 404 fallback - redirect to home */}
                    <Route path="*" element={<TextAnalyzer />} />
                </Routes>
            </Suspense>
        </Layout>
    );
}

export default function Pages() {
    return (
        <HelmetProvider>
            <QueryClientProvider client={queryClient}>
                <Router>
                    <PagesContent />
                </Router>
            </QueryClientProvider>
        </HelmetProvider>
    );
}
