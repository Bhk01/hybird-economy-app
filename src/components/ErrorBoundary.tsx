import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, ErrorBoundaryState> {
  constructor(props: {}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    console.error('Unhandled error caught by ErrorBoundary:', error, info);
    try {
      localStorage.setItem('lastClientError', JSON.stringify({ message: error.message, stack: error.stack, info }));
    } catch (e) {
      // ignore
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-6">
          <div className="max-w-2xl w-full bg-white border rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-600 mb-2">An unexpected error occurred</h2>
            <p className="text-sm text-muted-foreground mb-4">The app encountered an error. Details are shown below and saved to localStorage (key: lastClientError).</p>
            <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto" style={{ whiteSpace: 'pre-wrap' }}>
              {this.state.error?.message}
              {this.state.error?.stack && <>
                {'\n\n'}
                {this.state.error?.stack}
              </>}
            </pre>
            <div className="mt-4 flex gap-2 justify-end">
              <button className="px-3 py-2 bg-red-600 text-white rounded" onClick={() => location.reload()}>Reload</button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
