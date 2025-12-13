import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        
        // Log error to console in development
        if (import.meta.env.DEV) {
            console.error('Error caught by boundary:', error, errorInfo);
        }
        
        // In production, you could send this to an error tracking service
        // Example: sendToErrorTracking(error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-4">
                    <div className="max-w-md w-full bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-8 shadow-lg text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/20">
                            <AlertTriangle className="w-8 h-8 text-white" />
                        </div>
                        
                        <h1 className="text-2xl font-bold text-slate-800 mb-2">
                            Oops! Something went wrong
                        </h1>
                        
                        <p className="text-slate-600 mb-6">
                            We're sorry, but something unexpected happened. 
                            Please try refreshing the page or return to the home page.
                        </p>
                        
                        {import.meta.env.DEV && this.state.error && (
                            <details className="mb-6 text-left">
                                <summary className="text-sm text-slate-500 cursor-pointer hover:text-slate-700 mb-2">
                                    Technical Details (Development Only)
                                </summary>
                                <div className="bg-slate-100 rounded-lg p-4 overflow-auto max-h-40">
                                    <pre className="text-xs text-red-600 whitespace-pre-wrap">
                                        {this.state.error.toString()}
                                    </pre>
                                    {this.state.errorInfo && (
                                        <pre className="text-xs text-slate-600 mt-2 whitespace-pre-wrap">
                                            {this.state.errorInfo.componentStack}
                                        </pre>
                                    )}
                                </div>
                            </details>
                        )}
                        
                        <div className="flex gap-3 justify-center">
                            <Button 
                                onClick={this.handleReload}
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Refresh Page
                            </Button>
                            <Button 
                                variant="outline" 
                                onClick={this.handleGoHome}
                            >
                                <Home className="w-4 h-4 mr-2" />
                                Go Home
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

