import { useEffect } from 'react';
import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';

export default function useAnalytics() {
  useEffect(() => {
    const GA_ID = import.meta.env.VITE_GA_TRACKING_ID;
    if (!GA_ID) return;

    // Load GA script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, {
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_features: false,
    });

    // Track SPA page views
    window.gtag('config', GA_ID, {
      page_title: document.title,
      page_location: window.location.href,
    });

    // Web Vitals tracking
    const sendToAnalytics = (metric) => {
      if (window.gtag) {
        window.gtag('event', metric.name, {
          event_category: 'Web Vitals',
          event_label: metric.id,
          value: Math.round(metric.value),
          non_interaction: true,
        });
      }
      if (import.meta.env.DEV) {
        console.log('Web Vital:', metric);
      }
    };

    onCLS(sendToAnalytics);
    onINP(sendToAnalytics);
    onFCP(sendToAnalytics);
    onLCP(sendToAnalytics);
    onTTFB(sendToAnalytics);

    return () => {
      document.head.removeChild(script);
    };
  }, []);
}
