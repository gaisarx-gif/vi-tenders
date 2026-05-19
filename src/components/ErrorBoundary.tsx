import React, { ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center space-y-6 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center text-destructive">
            <AlertCircle className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
              Something went wrong
            </h2>
            <p className="text-sm text-slate-500 font-medium max-w-md mx-auto">
              An unexpected error occurred in this part of the application.
              {this.state.error && (
                <span className="block mt-2 font-mono text-[10px] bg-white p-2 rounded border">
                  {this.state.error.message}
                </span>
              )}
            </p>
          </div>
          <Button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="rounded-full px-8 bg-primary text-white font-bold shadow-lg shadow-primary/20"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
