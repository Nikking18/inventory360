'use client';

import React from 'react';
import { ArrowRight, CheckCircle2, ShieldCheck, Database, Zap } from 'lucide-react';

interface LandingViewProps {
  onStartDemo: () => void;
  onStartFresh: () => void;
  onOpenTour?: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onStartDemo, onStartFresh, onOpenTour }) => {
  return (
    <div className="max-w-5xl mx-auto space-y-12 py-6 text-neutral-200 font-mono">
      {/* Hero Header Section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-900 border border-neutral-800 text-neutral-300 text-[10px] font-mono uppercase tracking-[0.2em]">
          <Zap className="w-3.5 h-3.5 text-white" />
          <span>Local-First Inventory System</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-white font-heading tracking-tight leading-[1.1]">
          INVENTORY & POS SYSTEM <br />
          <span className="text-neutral-400 font-mono text-2xl uppercase tracking-wider">Geometric Balance Architecture</span>
        </h1>

        <p className="text-neutral-400 text-xs leading-relaxed max-w-2xl mx-auto font-mono">
          Precision stock tracking, quick-sale POS terminal, purchase order workflows, and multi-outlet analytics. Powered by browser IndexedDB.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={onStartDemo}
            className="px-6 py-3 bg-white hover:bg-neutral-200 text-black font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 rounded-none"
          >
            <span>Explore Demo System (ACME)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          {onOpenTour && (
            <button
              onClick={onOpenTour}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs border border-emerald-400 uppercase tracking-wider transition-all rounded-none flex items-center gap-2"
            >
              <Zap className="w-4 h-4 fill-black" />
              <span>Interactive Product Tour</span>
            </button>
          )}
          <button
            onClick={onStartFresh}
            className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 font-bold text-xs border border-neutral-800 uppercase tracking-wider transition-all rounded-none"
          >
            Start Fresh System
          </button>
        </div>
      </div>

      {/* Interactive App Preview Showcase Card */}
      <div className="bg-neutral-900 border border-neutral-800 p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-white rotate-45" />
            <span className="text-xs font-mono text-neutral-400">inventory360.local/system</span>
          </div>
          <span className="text-[10px] font-mono text-white bg-neutral-950 px-2.5 py-1 border border-neutral-800 uppercase">
            ● System Ready
          </span>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="p-4 bg-neutral-950 border border-neutral-800 space-y-2">
            <Database className="w-5 h-5 text-white" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-white">IndexedDB Storage</h3>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Instant load times and complete offline durability without cloud server lock-in.
            </p>
          </div>

          <div className="p-4 bg-neutral-950 border border-neutral-800 space-y-2">
            <Zap className="w-5 h-5 text-white" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-white">Quick Sale POS</h3>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Integrated barcode scanner support, custom discount rates, and auto tax generation.
            </p>
          </div>

          <div className="p-4 bg-neutral-950 border border-neutral-800 space-y-2">
            <ShieldCheck className="w-5 h-5 text-white" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-white">Multi-Store Outlets</h3>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Seamless inter-outlet stock transfers, reorder triggers, and supplier PO generation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
