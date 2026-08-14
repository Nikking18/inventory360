import React from 'react';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, ShieldCheck, Database, Zap, BookOpen } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Thank You | Inventory 360 Enterprise',
  description: 'Thank you for choosing Inventory 360. Your local-first retail operations workspace is configured and ready.',
};

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-mono flex flex-col justify-between p-6 sm:p-12">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-xs font-bold text-white uppercase tracking-widest">
            INVENTORY 360 // ONBOARDING_SUCCESS
          </span>
        </div>
        <span className="text-[10px] text-emerald-400 uppercase font-bold bg-emerald-950/60 border border-emerald-800 px-2 py-0.5">
          ● Status: Operational
        </span>
      </div>

      {/* Thank You Card */}
      <div className="max-w-2xl mx-auto w-full my-12 bg-neutral-900 border border-neutral-800 p-8 sm:p-12 text-center space-y-6 shadow-2xl">
        <div className="w-16 h-16 bg-emerald-950/60 border border-emerald-800 text-emerald-400 mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-white uppercase tracking-tight">
            Thank You for Choosing Inventory 360
          </h1>
          <p className="text-xs text-neutral-400 max-w-lg mx-auto leading-relaxed pt-1">
            Your local-first retail workspace is active. Your product catalog, sales POS registers, and inventory balances are encrypted directly inside your browser IndexedDB engine.
          </p>
        </div>

        {/* 3 Quick Start Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left pt-2">
          <div className="p-3.5 bg-neutral-950 border border-neutral-800 space-y-1.5">
            <span className="text-[10px] font-bold text-emerald-400 uppercase">Step 01</span>
            <h4 className="text-xs font-bold text-white">Add Products</h4>
            <p className="text-[10px] text-neutral-400">Configure master catalog SKUs, barcode values, and reorder levels.</p>
          </div>

          <div className="p-3.5 bg-neutral-950 border border-neutral-800 space-y-1.5">
            <span className="text-[10px] font-bold text-emerald-400 uppercase">Step 02</span>
            <h4 className="text-xs font-bold text-white">Process POS Sale</h4>
            <p className="text-[10px] text-neutral-400">Scan barcodes, apply discounts, and print thermal sales receipts.</p>
          </div>

          <div className="p-3.5 bg-neutral-950 border border-neutral-800 space-y-1.5">
            <span className="text-[10px] font-bold text-emerald-400 uppercase">Step 03</span>
            <h4 className="text-xs font-bold text-white">Export Backups</h4>
            <p className="text-[10px] text-neutral-400">Save 1-click encrypted JSON and CSV backups to your local drive.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2"
          >
            <span>Launch Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/privacy"
            className="w-full sm:w-auto px-6 py-3 bg-neutral-950 border border-neutral-700 text-neutral-200 font-bold text-xs uppercase tracking-wider hover:border-white transition-colors flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Review Privacy Policy</span>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-neutral-800 pt-4 flex flex-col sm:flex-row items-center justify-between text-[10px] text-neutral-500 gap-2">
        <span>© {new Date().getFullYear()} Inventory 360 Enterprise. 100% Offline-Ready & Private.</span>
        <div className="flex items-center gap-4">
          <Link href="/" className="hover:text-neutral-300 underline">Home</Link>
          <Link href="/privacy" className="hover:text-neutral-300 underline">Privacy & Data Policy</Link>
        </div>
      </div>
    </div>
  );
}
