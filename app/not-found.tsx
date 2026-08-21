import React from 'react';
import Link from 'next/link';
import { AlertOctagon, Home, ShoppingBag } from 'lucide-react';
import type { Metadata } from 'next';
import { GlobalFooter } from '../components/common/GlobalFooter';

export const metadata: Metadata = {
  title: '404 - Page Not Found | Inventory 360',
  description: 'The requested system page or resource could not be found in Inventory 360 database.',
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-mono flex flex-col justify-between p-6 sm:p-12">
      {/* Top Header Status */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-rose-500 animate-ping rounded-full" />
          <span className="text-xs font-bold text-slate-900 uppercase tracking-widest">
            INVENTORY 360 // ERROR_404_NOT_FOUND
          </span>
        </div>
        <span className="text-[10px] text-slate-500 uppercase font-semibold">
          Status: Resource Missing
        </span>
      </div>

      {/* Main 404 Terminal Card */}
      <div className="max-w-2xl mx-auto w-full my-12 bg-white border border-slate-200 p-8 sm:p-12 text-center space-y-6 shadow-xl">
        <div className="w-16 h-16 bg-rose-50 border border-rose-200 text-rose-600 mx-auto flex items-center justify-center">
          <AlertOctagon className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight">404</h1>
          <h2 className="text-sm sm:text-base font-bold text-slate-700 uppercase tracking-widest">
            Page or Terminal Route Not Found
          </h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed pt-2">
            The destination URL you requested does not exist or has been moved. All active retail databases and POS registers remain securely synced in your browser storage.
          </p>
        </div>

        {/* System Diagnostics Box */}
        <div className="p-4 bg-slate-50 border border-slate-200 text-left text-[11px] text-slate-600 space-y-1 font-mono">
          <p><span className="text-slate-500">DIAGNOSTIC_CODE:</span> ERR_HTTP_404_ROUTE_NULL</p>
          <p><span className="text-slate-500">STORAGE_STATUS:</span> Local-First IndexedDB [ONLINE]</p>
          <p><span className="text-slate-500">RECOVERY_ACTION:</span> Return to Primary Operations Hub</p>
        </div>

        {/* Action Navigation Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            <Home className="w-4 h-4" />
            <span>Return to Portal</span>
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 bg-white border border-slate-300 text-slate-800 font-bold text-xs uppercase tracking-wider hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
            <span>Launch POS Terminal</span>
          </Link>
        </div>
      </div>

      {/* Bottom Footer Record */}
      <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 gap-2 font-mono">
        <span>© {new Date().getFullYear()} Inventory 360 Enterprise. Local-First Architecture.</span>
        <div className="flex items-center gap-4">
          <Link href="/privacy" className="hover:text-slate-800 underline">Privacy Policy</Link>
          <Link href="/" className="hover:text-slate-800 underline">System Status</Link>
        </div>
      </div>

      <GlobalFooter className="border-t-0 -mx-6 sm:-mx-12 -mb-6 sm:-mb-12 mt-6" />
    </div>
  );
}
