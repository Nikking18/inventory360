import React from 'react';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Thank You | Inventory 360 Enterprise',
  description: 'Thank you for choosing Inventory 360. Your local-first retail operations workspace is configured and ready.',
  alternates: {
    canonical: 'https://www.inventory360.shop/thank-you',
  },
  openGraph: {
    title: 'Thank You | Inventory 360 Enterprise',
    description: 'Thank you for choosing Inventory 360. Your local-first retail operations workspace is configured and ready.',
    url: 'https://www.inventory360.shop/thank-you',
    siteName: 'Inventory 360',
    type: 'website',
    images: [{ url: 'https://www.inventory360.shop/og-image.png', width: 1200, height: 630, alt: 'Inventory 360 Enterprise' }],
  },
};

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-mono flex flex-col justify-between p-6 sm:p-12">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs font-bold text-slate-900 uppercase tracking-widest">
            INVENTORY 360 // ONBOARDING_SUCCESS
          </span>
        </div>
        <span className="text-[10px] text-emerald-800 uppercase font-bold bg-emerald-50 border border-emerald-300 px-2 py-0.5">
          ● Status: Operational
        </span>
      </div>

      {/* Thank You Card */}
      <div className="max-w-2xl mx-auto w-full my-12 bg-white border border-slate-200 p-8 sm:p-12 text-center space-y-6 shadow-xl">
        <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 text-emerald-700 mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 uppercase tracking-tight">
            Thank You for Choosing Inventory 360
          </h1>
          <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed pt-1">
            Your local-first retail workspace is active. Your product catalog, sales POS registers, and inventory balances are encrypted directly inside your browser IndexedDB engine.
          </p>
        </div>

        {/* 3 Quick Start Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left pt-2">
          <div className="p-3.5 bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="text-[10px] font-bold text-emerald-700 uppercase">Step 01</span>
            <h4 className="text-xs font-bold text-slate-900">Add Products</h4>
            <p className="text-[10px] text-slate-600">Configure master catalog SKUs, barcode values, and reorder levels.</p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="text-[10px] font-bold text-emerald-700 uppercase">Step 02</span>
            <h4 className="text-xs font-bold text-slate-900">Process POS Sale</h4>
            <p className="text-[10px] text-slate-600">Scan barcodes, apply discounts, and print thermal sales receipts.</p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="text-[10px] font-bold text-emerald-700 uppercase">Step 03</span>
            <h4 className="text-xs font-bold text-slate-900">Export Backups</h4>
            <p className="text-[10px] text-slate-600">Save 1-click encrypted JSON and CSV backups to your local drive.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            <span>Launch Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/privacy"
            className="w-full sm:w-auto px-6 py-3 bg-white border border-slate-300 text-slate-800 font-bold text-xs uppercase tracking-wider hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Review Privacy Policy</span>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 gap-2">
        <span>© {new Date().getFullYear()} Inventory 360 Enterprise. 100% Offline-Ready &amp; Private.</span>
        <div className="flex items-center gap-4">
          <Link href="/" className="hover:text-slate-800 underline">Home</Link>
          <Link href="/privacy" className="hover:text-slate-800 underline">Privacy &amp; Data Policy</Link>
        </div>
      </div>
    </div>
  );
}
