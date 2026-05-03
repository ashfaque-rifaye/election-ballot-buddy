/**
 * Error Boundary Component
 * Built with Google Antigravity & Vertex AI
 *
 * Catches React rendering errors and displays a fallback UI
 * instead of crashing the entire application.
 */
import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('[ErrorBoundary] Uncaught error:', error.message);
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div role="alert" aria-live="assertive" style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: '100vh', padding: '2rem', backgroundColor: 'var(--surface-dim, #F5F5F5)',
          color: 'var(--on-surface, #1A1A1A)', textAlign: 'center',
        }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Something went wrong</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--on-surface-secondary, #5F6368)', marginBottom: '1.5rem', maxWidth: '400px' }}>
            The application encountered an unexpected error. Please refresh the page to try again.
          </p>
          <button onClick={() => window.location.reload()} aria-label="Refresh page"
            style={{ padding: '10px 24px', backgroundColor: 'var(--primary, #FF9933)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
