import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[InteriorG ErrorBoundary] Uncaught React rendering error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleHardReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          for (const reg of registrations) reg.unregister();
        });
      }
      if ('caches' in window) {
        caches.keys().then(names => {
          for (const name of names) caches.delete(name);
        });
      }
    } catch (e) {
      console.warn('Reset error:', e);
    }
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          backgroundColor: '#ffffff',
          color: '#0a192f',
          fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '540px',
            width: '100%',
            padding: '2.5rem 2rem',
            borderRadius: '16px',
            border: '1.5px solid #cbdceb',
            backgroundColor: '#f0f5fc',
            boxShadow: '0 12px 30px rgba(10, 25, 47, 0.08)'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#0f2444',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              fontSize: '22px'
            }}>
              🏛️
            </div>

            <h2 style={{
              margin: '0 0 0.5rem',
              fontSize: '1.5rem',
              fontWeight: 600,
              color: '#0a192f',
              fontFamily: "'Playfair Display', Georgia, serif",
              fontStyle: 'italic'
            }}>
              InteriorG Studio
            </h2>

            <p style={{ margin: '0 0 1.5rem', fontSize: '0.88rem', color: '#536b88', lineHeight: 1.5 }}>
              A client interface error occurred during render. You can reload the page or perform a clean reset.
            </p>

            {this.state.error && (
              <div style={{
                textAlign: 'left',
                padding: '0.75rem 1rem',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '0.75rem',
                color: '#b91c1c',
                fontFamily: 'monospace',
                overflowX: 'auto',
                marginBottom: '1.5rem',
                maxHeight: '120px'
              }}>
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => window.location.reload()}
                style={{
                  padding: '0.65rem 1.4rem',
                  backgroundColor: '#0f2444',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                Reload Page
              </button>

              <button
                type="button"
                onClick={this.handleHardReset}
                style={{
                  padding: '0.65rem 1.4rem',
                  backgroundColor: '#ffffff',
                  color: '#0f2444',
                  border: '1.5px solid #0f2444',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                Clear Cache & Reset
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
