'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ThreeErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Three.js/Canvas Error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center bg-neutral-900/50 border border-red-500/20 rounded-xl p-6 text-center">
                    <AlertTriangle className="w-10 h-10 text-red-500 mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">3D Visualization Error</h3>
                    <p className="text-neutral-400 text-sm max-w-md">
                        The 3D molecule engine encountered an issue.
                        <br />
                        {this.state.error?.message && <span className="text-red-400 font-mono text-xs block mt-2">{this.state.error.message}</span>}
                    </p>
                </div>
            );
        }

        return this.props.children;
    }
}
