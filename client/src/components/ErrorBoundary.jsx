import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          width: '100%', height: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: '16px',
          background: '#000', color: '#fff',
          fontFamily: 'Geist, sans-serif',
          padding: '24px', textAlign: 'center',
        }}>
          <span style={{ fontSize: '40px', marginBottom: '8px' }}>⚠️</span>
          <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Something went wrong</h3>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.href = '/';
            }}
            style={{
              padding: '10px 24px', borderRadius: '99px',
              border: '1px solid rgba(249,115,22,0.3)',
              background: 'rgba(249,115,22,0.1)',
              color: '#f97316', cursor: 'pointer',
              fontWeight: '600', fontFamily: 'Geist, sans-serif',
              marginTop: '8px',
            }}
          >
            Go Home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
