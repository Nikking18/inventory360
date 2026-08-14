import React from 'react';
import Link from 'next/link';
import { AlertOctagon, ArrowLeft, Home, ShoppingBag, ShieldAlert } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 - Page Not Found | Inventory 360',
  description: 'The requested system page or resource could not be found in Inventory 360 database.',
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-mono flex flex-col justify-between p-6 sm:p-12">
      {/* Top Header Status */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-rose-500 animate-ping rounded-full" />
          <span className="text-xs font-bold text-white uppercase tracking-widest">
            INVENTORY 360 // ERROR_404_NOT_FOUND
          </span>
        </div>
        <span className="text-[10px] text-neutral-500 uppercase">
          Status: Resource Missing
        </span>
      </div>

      {/* Main 404 Terminal Card */}
      <div className="max-w-2xl mx-auto w-full my-12 bg-neutral-900 border border-neutral-800 p-8 sm:p-12 text-center space-y-6 shadow-2xl">
        <div className="w-16 h-16 bg-rose-950/60 border border-rose-800 text-rose-400 mx-auto flex items-center justify-center">
          <AlertOctagon className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">404</h1>
          <h2 className="text-sm sm:text-base font-bold text-neutral-300 uppercase tracking-widest">
            Page or Terminal Route Not Found
          </h2>
          <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed pt-2">
            The destination URL you requested does not exist or has been moved. All active retail databases and POS registers remain securely synced in your browser storage.
          </p>
        </div>

        {/* System Diagnostics Box */}
        <div className="p-4 bg-neutral-950 border border-neutral-800 text-left text-[11px] text-neutral-400 space-y-1 font-mono">
          <p><span className="text-neutral-500">DIAGNOSTIC_CODE:</span> ERR_HTTP_404_ROUTE_NULL</p>
          <p><span className="text-neutral-500">STORAGE_STATUS:</span> Local-First IndexedDB [ONLINE]</p>
          <p><span className="text-neutral-500">RECOVERY_ACTION:</span> Return to Primary Operations Hub</p>
        </div>

        {/* Action Navigation Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 bg-neutral-950 border border-neutral-700 text-neutral-200 font-bold text-xs uppercase tracking-wider hover:border-white transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
            <span>Launch POS Terminal</span>
          </Link>
        </div>
      </div>

      {/* Bottom Footer Record */}
      <div className="border-t border-neutral-800 pt-4 flex flex-col sm:flex-row items-center justify-between text-[10px] text-neutral-500 gap-2">
        <span>© {new Date().getFullYear()} Inventory 360 Enterprise. Local-First Architecture.</span>
        <div className="flex items-center gap-4">
          <Link href="/privacy" className="hover:text-neutral-300 underline">Privacy Policy</Link>
          <Link href="/" className="hover:text-neutral-300 underline">System Status</Link>
        </div>
      </div>
    </div>
  );
}
