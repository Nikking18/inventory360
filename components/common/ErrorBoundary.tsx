'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Download, Database } from 'lucide-react';
import { downloadWorkspaceJSON } from '../../lib/exportImport';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
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
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  private handleEmergencyExport = async () => {
    try {
      await downloadWorkspaceJSON('inventory360_emergency_recovery_backup.json');
    } catch (err) {
      console.error('Emergency export failed:', err);
      alert('Unable to export data automatically. Please refresh the application.');
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 font-mono text-slate-900">
          <div className="max-w-lg w-full bg-white border-2 border-rose-300 shadow-xl p-6 sm:p-8 space-y-5 rounded-xs">
            <div className="flex items-center gap-3 border-b border-rose-100 pb-4">
              <div className="w-10 h-10 rounded-xs bg-rose-100 border border-rose-300 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-rose-600">
                  Resilience Safeguard
                </span>
                <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide font-heading">
                  {this.props.fallbackTitle || 'Component Recovered Gracefully'}
                </h2>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              An unexpected runtime error occurred in this view. Your offline database in IndexedDB remains safe and intact.
            </p>

            {this.state.error && (
              <div className="p-3 bg-slate-900 text-emerald-400 text-[11px] rounded-xs overflow-x-auto max-h-32 font-mono">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                <span>Reload View</span>
              </button>

              <button
                type="button"
                onClick={this.handleEmergencyExport}
                className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Emergency Backup JSON</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
