import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in ErrorBoundary:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-6">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="font-display text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="text-muted-foreground max-w-md mb-8">
            An unexpected error occurred. Don't worry, your roommates and matches are safe!
          </p>
          {this.state.error && (
            <div className="bg-muted p-4 rounded-lg mb-8 max-w-lg text-left text-xs font-mono overflow-auto max-h-48 border">
              {this.state.error.toString()}
            </div>
          )}
          <Button onClick={this.handleReset} className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Back to Home
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
