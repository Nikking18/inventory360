import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, Lock, Database, HardDrive, FileCheck, CheckCircle2 } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy & Data Security | Inventory 360',
  description: 'Learn how Inventory 360 protects your business privacy using zero-tracking, 100% local-first IndexedDB storage architecture.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-mono p-6 sm:p-12 space-y-8 max-w-4xl mx-auto">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-white hover:text-emerald-400 transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Application</span>
        </Link>
        <span className="text-[10px] text-neutral-500 uppercase">
          Document Version: 2026.1 // LOCAL_FIRST_POLICY
        </span>
      </div>

      {/* Page Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-900 border border-neutral-800 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Local-First Zero Cloud Telemetry</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white uppercase tracking-tight">
          Privacy Policy & Data Storage Protocol
        </h1>
        <p className="text-xs text-neutral-400 leading-relaxed max-w-2xl">
          Inventory 360 is engineered as a local-first enterprise tool. Your financial data, customer profiles, product costs, and transaction receipts never leave your browser storage.
        </p>
      </div>

      {/* Policy Clauses */}
      <div className="space-y-6">
        {/* Clause 1: Architecture */}
        <div className="p-6 bg-neutral-900 border border-neutral-800 space-y-3">
          <div className="flex items-center gap-3 text-white">
            <Database className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider">1. Local-First Database Architecture</h2>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            All data records — including master product catalogs, sales registers, barcodes, suppliers, customers, and business configuration settings — are stored locally inside your browser using the high-performance <strong>W3C IndexedDB standard</strong>.
          </p>
          <div className="p-3 bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-400 space-y-1">
            <p>✓ No central server database storing your records.</p>
            <p>✓ Complete offline operability during network or power disruptions.</p>
            <p>✓ Zero third-party behavioral tracking or telemetry scripts.</p>
          </div>
        </div>

        {/* Clause 2: Data Ownership */}
        <div className="p-6 bg-neutral-900 border border-neutral-800 space-y-3">
          <div className="flex items-center gap-3 text-white">
            <HardDrive className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider">2. 100% User Data Ownership & Backups</h2>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            You maintain 100% unilateral ownership of all records entered into the application. We recommend regularly exporting offline JSON or CSV backups from <strong>Setup &gt; Data &amp; Backup</strong> to ensure long-term redundancy across devices.
          </p>
        </div>

        {/* Clause 3: Cookies & Analytics */}
        <div className="p-6 bg-neutral-900 border border-neutral-800 space-y-3">
          <div className="flex items-center gap-3 text-white">
            <Lock className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider">3. Zero Third-Party Advertising Cookies</h2>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Inventory 360 does not deploy commercial advertising cookies, cross-site trackers, or data-broker pixels. Any optional analytics (such as Google Analytics) are strictly limited to anonymized pageview counts to improve application reliability.
          </p>
        </div>

        {/* Clause 4: Data Erasure */}
        <div className="p-6 bg-neutral-900 border border-neutral-800 space-y-3">
          <div className="flex items-center gap-3 text-white">
            <FileCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider">4. Right to Immediate Data Erasure</h2>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            You can completely erase all local databases, sales histories, and catalog records at any time by navigating to <strong>Setup &gt; Data &amp; Backup &gt; Clear All Data</strong>, or by clearing your browser cache.
          </p>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="border-t border-neutral-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs gap-4">
        <Link
          href="/"
          className="px-5 py-2.5 bg-white text-black font-bold uppercase tracking-wider hover:bg-neutral-200 transition-colors"
        >
          Launch Inventory 360
        </Link>
        <span className="text-[10px] text-neutral-500">
          Last updated: August 2026 • Verified Local-First Privacy Compliance
        </span>
      </div>
    </div>
  );
}
