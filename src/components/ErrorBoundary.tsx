import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error caught by ErrorBoundary:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="w-full min-h-[400px] bg-[#030303] border border-red-550/30 p-8 flex flex-col items-center justify-center text-center gap-6 my-12">
          <div className="w-12 h-12 rounded-none bg-red-500/10 border border-red-550/40 flex items-center justify-center text-red-500 animate-pulse">
            <AlertTriangle size={22} />
          </div>
          <div className="flex flex-col gap-2 max-w-md">
            <h3 className="font-mono text-xs font-black uppercase text-red-500 tracking-wider">
              [ TERMINAL RENDER_FAULT ]
            </h3>
            <p className="text-zinc-500 text-[11px] font-mono leading-relaxed">
              An exception occurred while drawing this streetwear module. This could be due to invalid/corrupted dynamic product properties.
            </p>
            {this.state.error && (
              <pre className="mt-2 bg-black border border-zinc-900 p-3 text-[9px] font-mono text-[#EFFF00] text-left overflow-x-auto max-w-full">
                {this.state.error.message}
              </pre>
            )}
          </div>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 font-mono text-[9px] tracking-widest bg-zinc-950 border border-zinc-800 hover:border-[#EFFF00] px-5 py-2.5 uppercase hover:text-[#EFFF00] transition-colors cursor-pointer"
          >
            <RefreshCw size={10} className="animate-spin" />
            RELOAD SYSTEM INTERFACE
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
