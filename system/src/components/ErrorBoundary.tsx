import { Component, ReactNode } from "react";
import { RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error("Unhandled error caught by ErrorBoundary:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-bg px-6">
          <div className="max-w-md text-center bg-surface rounded-xl border border-border/10 shadow-sm p-8">
            <h1 className="font-display text-xl font-semibold text-heading">Something went wrong</h1>
            <p className="mt-3 text-body text-sm">
              An unexpected error occurred. Refreshing the page usually resolves it, if it keeps happening, let your admin know what you were doing right before it showed up.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 mt-6 rounded-md bg-brand-orange px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
            >
              <RefreshCw size={16} /> Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
