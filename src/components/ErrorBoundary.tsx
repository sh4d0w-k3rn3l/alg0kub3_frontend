'use client';

import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallbackMessage?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div data-testid="error-boundary" className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center" style={{ backgroundColor: '#0d1117' }}>
          <div className="w-12 h-12 rounded-full bg-[#ef444420] flex items-center justify-center mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-white text-lg font-bold mb-2">Something went wrong</h2>
          <p className="text-[#8b949e] text-sm mb-4 max-w-md">
            {this.props.fallbackMessage || 'An unexpected error occurred. Please try refreshing the page.'}
          </p>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); }}
            className="px-4 py-2 bg-[#22c55e] text-white text-sm font-medium rounded-lg hover:bg-[#16a34a] transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
