'use client';

import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  experimentName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error boundary for sandbox experiments.
 * Prevents experiment crashes from propagating to the entire /sandbox route.
 * Shows a friendly fallback UI with error details and recovery options.
 */
export class SandboxErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for debugging (could be sent to error tracking service)
    console.error('[SandboxErrorBoundary] Caught error:', error);
    console.error('[SandboxErrorBoundary] Component stack:', errorInfo.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/sandbox';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
          <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            {/* Icon */}
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Sandbox Experiment Error
            </h2>

            {/* Description */}
            <p className="text-gray-600 mb-4">
              {this.props.experimentName
                ? `The "${this.props.experimentName}" experiment encountered an error.`
                : 'This experiment encountered an error.'}
            </p>

            {/* Error Details */}
            {this.state.error && (
              <div className="mb-6">
                <details className="text-left">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 mb-2">
                    Show error details
                  </summary>
                  <pre className="text-xs bg-gray-100 p-4 rounded-lg overflow-auto max-h-40 text-left text-red-700">
                    {this.state.error.message}
                    {this.state.error.stack && (
                      <>
                        {'\n\n'}
                        {this.state.error.stack}
                      </>
                    )}
                  </pre>
                </details>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                Reload
              </button>
              <button
                onClick={this.handleGoHome}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                <Home className="w-4 h-4" />
                Back to Sandbox
              </button>
            </div>

            {/* Hint */}
            <p className="mt-6 text-xs text-gray-500">
              If this error persists, check the browser console for more details.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
