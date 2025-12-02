import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import ErrorBoundary from '@/components/ErrorBoundary'
import '@/index.css'
import '@/lib/env' // Validate environment variables on startup

// Performance monitoring and analytics
if (import.meta.env.PROD) {
    // Report Web Vitals
    import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
        const sendToAnalytics = (metric) => {
            // Send to Google Analytics if configured
            if (window.gtag && import.meta.env.VITE_GA_TRACKING_ID) {
                window.gtag('event', metric.name, {
                    event_category: 'Web Vitals',
                    event_label: metric.id,
                    value: Math.round(metric.value),
                    non_interaction: true,
                    custom_map: { metric_value: metric.value }
                });
            }

            // Log to console in development
            if (import.meta.env.DEV) {
                console.log('Web Vital:', metric);
            }
        };

        onCLS(sendToAnalytics);
        onFID(sendToAnalytics);
        onFCP(sendToAnalytics);
        onLCP(sendToAnalytics);
        onTTFB(sendToAnalytics);
    }).catch((error) => {
        console.warn('Web Vitals tracking failed to load:', error);
    });

    // Google Analytics initialization
    if (import.meta.env.VITE_GA_TRACKING_ID) {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${import.meta.env.VITE_GA_TRACKING_ID}`;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        window.gtag = function() { window.dataLayer.push(arguments); };
        window.gtag('js', new Date());
        window.gtag('config', import.meta.env.VITE_GA_TRACKING_ID, {
            anonymize_ip: true,
            allow_google_signals: false,
            allow_ad_features: false,
        });

        // Track page views for SPA
        window.gtag('config', import.meta.env.VITE_GA_TRACKING_ID, {
            page_title: document.title,
            page_location: window.location.href
        });
    }
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    </React.StrictMode>
)
