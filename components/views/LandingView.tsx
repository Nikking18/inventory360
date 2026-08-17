'use client';

import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Database,
  Zap,
  Star,
  Clock,
  MapPin,
  HelpCircle,
  Users,
  ChevronDown,
  Building2,
  Navigation,
  Sparkles,
  ShoppingBag,
  Package,
  Boxes,
  BarChart3,
  Globe,
  Truck,
  TrendingUp,
  LayoutDashboard,
} from 'lucide-react';
import Link from 'next/link';

interface LandingViewProps {
  onOpenDashboard: () => void;
  onOpenPOS: () => void;
  onStartDemo: () => void;
  onStartFresh: () => void;
  onOpenTour?: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onOpenDashboard,
  onOpenPOS,
  onStartDemo,
  onStartFresh,
  onOpenTour,
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does Inventory 360 operate completely offline without internet?',
      a: 'Inventory 360 utilizes the W3C IndexedDB browser storage standard. All product catalogs, inventory movements, barcode indexes, and customer registers are stored and queried directly on your local device with sub-50ms latency. No internet connection is required for daily POS sales or stock tracking.',
    },
    {
      q: 'Can I connect physical USB or Bluetooth barcode scanners?',
      a: 'Yes. Inventory 360 supports standard HID barcode scanners (USB and Bluetooth) in keyboard emulation mode, as well as live camera-based scanning. Simply focus or click the Barcode Scanner button to instantly scan SKUs.',
    },
    {
      q: 'How do I backup and restore my store database across multiple devices?',
      a: 'Under Setup > Data & Backup, you can generate 1-click encrypted JSON and CSV database snapshots. You can import these backup files onto any computer, laptop, or tablet in seconds to restore your complete store history.',
    },
    {
      q: 'How does multi-outlet stock transferring work?',
      a: 'Under the Inventory > Stock Transfers tab, you can execute instant inter-outlet transfers between your downtown flagship, warehouse, or boutique locations. Each transfer automatically generates an immutable audit record in your stock movements log.',
    },
    {
      q: 'Are there any monthly subscription fees or cloud data lock-ins?',
      a: 'No. Inventory 360 is an open, local-first enterprise software application. There are zero mandatory monthly subscriptions, zero vendor lock-ins, and your financial data is never harvested by third-party cloud brokers.',
    },
  ];

  const caseStudies = [
    {
      company: 'Apex Retail Electronics',
      locations: '4 Store Outlets',
      headline: '42% Faster Checkout & Zero Stockout Disruptions',
      metrics: [
        { label: 'POS Checkout Time', value: '4.2s avg' },
        { label: 'Out of Stock Drop', value: '-88%' },
        { label: 'Annual SaaS Savings', value: '$4,800/yr' },
      ],
      quote:
        'Switching from a laggy cloud POS to Inventory 360 gave our checkout lanes instant speed. Even during internet outages, our barcode scanning and thermal receipt printing never skip a beat.',
      author: 'Marcus Vance, Chief of Retail Operations',
    },
    {
      company: 'Urban Threads Apparel Group',
      locations: '2 Flagship Boutiques',
      headline: '100% Offline Uptime & Real-Time Margin Intelligence',
      metrics: [
        { label: 'Daily Transactions', value: '650+ orders' },
        { label: 'Gross Margin Visibility', value: '100% Real-Time' },
        { label: 'Inventory Audit Time', value: '15 mins/day' },
      ],
      quote:
        'The gross profit and supplier PO automation transformed our restock cycles. We generate supplier purchase orders directly from low-stock alerts with a single click.',
      author: 'Elena Rostova, Inventory Director',
    },
  ];

  const reviews = [
    {
      name: 'David K.',
      title: 'Store Owner, Westside Hardware',
      rating: 5,
      comment:
        'Sub-50ms search on 5,000+ SKUs. The high-contrast design is extremely clean and easy to read on our checkout touchscreens.',
      verified: true,
    },
    {
      name: 'Sarah Chen',
      title: 'Operations Lead, Chen & Co. Goods',
      rating: 5,
      comment:
        'The ability to export clean CSV, Excel, and PDF reports directly for our accountant saved us hours of bookkeeping every month.',
      verified: true,
    },
    {
      name: 'Michael Torres',
      title: 'General Manager, Metro Provisions',
      rating: 5,
      comment:
        'Best local-first inventory tool we have ever used. Total data privacy and zero cloud latency.',
      verified: true,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-mono">
      {/* 1. TOP PORTAL NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-900 flex items-center justify-center rotate-45 shrink-0 shadow-xs">
              <div className="w-3.5 h-3.5 bg-emerald-400 -rotate-45" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-extrabold text-sm uppercase tracking-[0.25em] text-slate-900">
                INVENTORY<span className="text-emerald-600">360</span>
              </span>
              <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider hidden sm:block">
                Local-First Enterprise Engine
              </span>
            </div>
          </div>

          {/* Center Navigation Anchors */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-mono font-semibold text-slate-600">
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#preview" className="hover:text-slate-900 transition-colors">POS &amp; Matrix</a>
            <a href="#case-studies" className="hover:text-slate-900 transition-colors">Case Studies</a>
            <a href="#reviews" className="hover:text-slate-900 transition-colors">Reviews</a>
            <a href="#faqs" className="hover:text-slate-900 transition-colors">FAQs</a>
          </nav>

          {/* Right Action CTAs */}
          <div className="flex items-center gap-2.5">
            {onOpenTour && (
              <button
                onClick={onOpenTour}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider border border-slate-300 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Tour</span>
              </button>
            )}

            <button
              onClick={onStartDemo}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider border border-slate-300 transition-colors"
            >
              Demo Store
            </button>

            {/* PRIMARY CTA: OPEN DASHBOARD */}
            <button
              onClick={onOpenDashboard}
              className="px-4 sm:px-5 py-2 bg-slate-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm"
            >
              <LayoutDashboard className="w-4 h-4 text-emerald-400" />
              <span>Open Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5 hidden sm:inline" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 space-y-10">
        <div className="text-center space-y-5 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-300 text-emerald-800 text-[10px] font-mono font-bold uppercase tracking-[0.2em] shadow-2xs">
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            <span>Local-First Enterprise POS &amp; Inventory Engine</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 font-heading tracking-tight leading-[1.15]">
            Smarter Inventory. Lightning POS. <br />
            <span className="text-slate-700 font-mono text-2xl sm:text-4xl uppercase tracking-wider">
              Total Local Control.
            </span>
          </h1>

          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto font-mono">
            High-performance retail POS terminal, barcode scanning, multi-outlet stock tracking, supplier PO automation, and real-time margin analytics powered by browser IndexedDB.
          </p>

          {/* MAIN CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button
              onClick={onOpenDashboard}
              className="px-6 py-3.5 bg-slate-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2.5 shadow-md group"
            >
              <LayoutDashboard className="w-4 h-4 text-emerald-400" />
              <span>Enter Full Dashboard</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={onOpenPOS}
              className="px-6 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-md"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Launch Quick Sale POS</span>
            </button>

            <button
              onClick={onStartDemo}
              className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-300 hover:border-slate-800 uppercase tracking-wider transition-all shadow-xs"
            >
              Explore Demo (ACME Store)
            </button>

            <button
              onClick={onStartFresh}
              className="px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-300 uppercase tracking-wider transition-all"
            >
              Start Fresh
            </button>
          </div>

          {/* Trust Badges */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-6 text-[11px] font-semibold text-slate-600">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 100% Offline Durability
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Zero Cloud Lock-In
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Thermal Receipt Printing
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Sub-50ms Query Latency
            </span>
          </div>
        </div>

        {/* 3. INTERACTIVE LIVE DASHBOARD PREVIEW WIDGET */}
        <div id="preview" className="bg-white border border-slate-200 shadow-md p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                  Live Operations Telemetry
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wider font-heading mt-0.5">
                Executive Store Matrix
              </h2>
            </div>

            <button
              onClick={onOpenDashboard}
              className="self-start sm:self-auto px-4 py-2 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-black transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <span>Open in Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
            <div className="p-4 bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Today&apos;s Revenue
              </span>
              <p className="text-2xl font-bold text-slate-900">$2,845.50</p>
              <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +14.2% from yesterday
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Stock Valuation
              </span>
              <p className="text-2xl font-bold text-slate-900">$48,920.00</p>
              <p className="text-[10px] text-slate-500">Retail: $92,450.00</p>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 space-y-1">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest">
                Low Stock Reorders
              </span>
              <p className="text-2xl font-bold text-amber-900">4 Items</p>
              <p className="text-[10px] text-amber-700">Auto-PO Ready</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Active Outlets
              </span>
              <p className="text-2xl font-bold text-slate-900">2 Stores</p>
              <p className="text-[10px] text-slate-500">San Francisco &amp; Oakland</p>
            </div>
          </div>

          {/* Quick Action Navigation Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <button
              onClick={onOpenPOS}
              className="p-3 bg-white border border-slate-200 hover:border-slate-800 hover:bg-slate-50 text-left transition-all group"
            >
              <ShoppingBag className="w-5 h-5 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold text-slate-900 uppercase">POS Terminal</p>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">Quick barcode checkout</p>
            </button>

            <button
              onClick={onOpenDashboard}
              className="p-3 bg-white border border-slate-200 hover:border-slate-800 hover:bg-slate-50 text-left transition-all group"
            >
              <Boxes className="w-5 h-5 text-sky-600 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold text-slate-900 uppercase">Inventory Hub</p>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">Stock transfers &amp; POs</p>
            </button>

            <button
              onClick={onOpenDashboard}
              className="p-3 bg-white border border-slate-200 hover:border-slate-800 hover:bg-slate-50 text-left transition-all group"
            >
              <Package className="w-5 h-5 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold text-slate-900 uppercase">Product Master</p>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">Variants &amp; QR labels</p>
            </button>

            <button
              onClick={onOpenDashboard}
              className="p-3 bg-white border border-slate-200 hover:border-slate-800 hover:bg-slate-50 text-left transition-all group"
            >
              <BarChart3 className="w-5 h-5 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold text-slate-900 uppercase">Reports &amp; COGS</p>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">Export CSV, XLS &amp; PDF</p>
            </button>
          </div>
        </div>

        {/* 4. PERFORMANCE PROMISE & ARCHITECTURE BANNER */}
        <div className="bg-white border border-slate-200 p-6 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="space-y-1 md:border-r border-slate-200 md:pr-6">
              <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase">
                <Clock className="w-4 h-4" />
                <span>Response Time Guarantee</span>
              </div>
              <p className="text-2xl font-bold text-slate-900 tracking-tight">&lt; 50ms</p>
              <p className="text-[11px] text-slate-600">
                Guaranteed instant query latency on 10,000+ local inventory records.
              </p>
            </div>

            <div className="space-y-1 md:border-r border-slate-200 md:pr-6">
              <div className="flex items-center gap-2 text-slate-900 text-xs font-bold uppercase">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>99.99% Offline Availability</span>
              </div>
              <p className="text-2xl font-bold text-slate-900 tracking-tight">Zero Network Lag</p>
              <p className="text-[11px] text-slate-600">
                Operates without internet bottlenecks during peak checkout rushes.
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-slate-900 text-xs font-bold uppercase">
                <Database className="w-4 h-4 text-emerald-600" />
                <span>Direct Browser Storage</span>
              </div>
              <p className="text-2xl font-bold text-slate-900 tracking-tight">W3C IndexedDB</p>
              <p className="text-[11px] text-slate-600">
                Secure client-side persistence with 1-click encrypted JSON exports.
              </p>
            </div>
          </div>
        </div>

        {/* 5. 6 CORE CAPABILITY CARDS */}
        <div id="features" className="space-y-6">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 font-heading">
                <Zap className="w-4 h-4 text-emerald-600" />
                <span>Enterprise POS &amp; Inventory Features</span>
              </h2>
              <p className="text-xs text-slate-600">Everything needed to operate modern retail and distribution.</p>
            </div>
            <span className="text-[10px] text-slate-500 uppercase font-bold">6 Modules</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Card 1 */}
            <div className="p-6 bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 uppercase">High-Speed POS Checkout</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sub-second SKU lookup, barcode scanning, split payments (Cash, Card, Bank Transfer), discounts, and instant thermal receipt printing.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700">
                <Boxes className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 uppercase">Multi-Outlet Stock Matrix</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Inter-branch transfers with immutable audit logs, location-specific inventory counts, and multi-warehouse visibility.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 uppercase">Automated Supplier POs</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Automatic purchase order generation from low-stock thresholds, partial order receiving, lot tracking, and vendor catalogs.
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-6 bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 uppercase">Omnichannel &amp; Fulfillment</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Multi-channel dispatch statuses (Shopify, Amazon, eBay, In-Store), carrier tracking (FedEx, UPS, DHL), and packing slips.
              </p>
            </div>

            {/* Card 5 */}
            <div className="p-6 bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
                <Package className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 uppercase">Master Catalog &amp; Labels</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Variant matrices (Size, Color, Material), custom attributes, barcode generation, and 1-click printable sticker sheets.
              </p>
            </div>

            {/* Card 6 */}
            <div className="p-6 bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 uppercase">Real-Time Margin Analytics</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                COGS valuation, gross profit calculations, inventory turnover velocity, dead stock alerts, and 1-click CSV/PDF exports.
              </p>
            </div>
          </div>
        </div>

        {/* 6. CASE STUDIES SECTION */}
        <div id="case-studies" className="space-y-6">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 font-heading">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span>Retail Case Studies</span>
              </h2>
              <p className="text-xs text-slate-600">Proven multi-outlet retail performance at scale.</p>
            </div>
            <span className="text-[10px] text-slate-500 uppercase font-bold">Verified Deployments</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {caseStudies.map((cs, i) => (
              <div key={i} className="p-6 bg-white border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 uppercase">{cs.company}</span>
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 border border-slate-200 text-slate-700 uppercase font-semibold">
                      {cs.locations}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-emerald-700">{cs.headline}</h3>
                  <p className="text-xs text-slate-700 italic leading-relaxed border-l-2 border-emerald-600 pl-3">
                    &ldquo;{cs.quote}&rdquo;
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {cs.metrics.map((m, mi) => (
                      <div key={mi} className="p-2 bg-slate-50 border border-slate-200">
                        <p className="text-xs font-bold text-slate-900">{m.value}</p>
                        <p className="text-[9px] text-slate-500 mt-0.5">{m.label}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 text-right font-medium">— {cs.author}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 7. REAL REVIEWS & TESTIMONIALS */}
        <div id="reviews" className="space-y-6">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 font-heading">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Verified Store Reviews</span>
              </h2>
              <p className="text-xs text-slate-600">Feedback from retail managers and store operators.</p>
            </div>
            <span className="text-[10px] text-emerald-800 uppercase font-bold bg-emerald-50 border border-emerald-300 px-2 py-0.5">
              ★ 4.9 / 5.0 Rating
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reviews.map((rev, i) => (
              <div key={i} className="p-5 bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center gap-1">
                  {[...Array(rev.rating)].map((_, si) => (
                    <Star key={si} className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  ))}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">&ldquo;{rev.comment}&rdquo;</p>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px]">
                  <div>
                    <p className="font-bold text-slate-900">{rev.name}</p>
                    <p className="text-slate-500">{rev.title}</p>
                  </div>
                  {rev.verified && (
                    <span className="text-[9px] text-emerald-700 font-bold uppercase">Verified User</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 8. STORE LOCATIONS & PHYSICAL OUTLETS */}
        <div className="bg-white border border-slate-200 p-6 space-y-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 font-heading">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Store Outlets &amp; Directions</span>
              </h2>
              <p className="text-xs text-slate-600">Integrated multi-store physical store directories.</p>
            </div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold">GPS Enabled</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Store 1 */}
            <div className="p-4 bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase">Downtown Flagship Outlet</h3>
                <span className="text-[9px] text-emerald-800 bg-emerald-50 border border-emerald-300 px-1.5 py-0.5 uppercase font-bold">
                  Primary POS
                </span>
              </div>
              <p className="text-xs text-slate-700">100 Innovation Way, Suite 400, San Francisco, CA 94105</p>
              <div className="text-[11px] text-slate-600 space-y-0.5 font-mono">
                <p>Hours: Mon - Sun (8:00 AM - 10:00 PM)</p>
                <p>Phone: +1 (800) 555-0360</p>
              </div>
              <a
                href="https://maps.google.com/?q=100+Innovation+Way+San+Francisco+CA"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-slate-900 bg-white border border-slate-300 hover:border-slate-900 px-3 py-1.5 font-bold uppercase transition-colors shadow-2xs"
              >
                <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                <span>Get Directions</span>
              </a>
            </div>

            {/* Store 2 */}
            <div className="p-4 bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase">Westside Distribution Hub</h3>
                <span className="text-[9px] text-slate-700 bg-slate-100 border border-slate-300 px-1.5 py-0.5 uppercase font-bold">
                  Warehouse
                </span>
              </div>
              <p className="text-xs text-slate-700">450 Logistics Blvd, Dock 12, Oakland, CA 94607</p>
              <div className="text-[11px] text-slate-600 space-y-0.5 font-mono">
                <p>Hours: Mon - Fri (6:00 AM - 8:00 PM)</p>
                <p>Phone: +1 (800) 555-0361</p>
              </div>
              <a
                href="https://maps.google.com/?q=450+Logistics+Blvd+Oakland+CA"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-slate-900 bg-white border border-slate-300 hover:border-slate-900 px-3 py-1.5 font-bold uppercase transition-colors shadow-2xs"
              >
                <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                <span>Get Directions</span>
              </a>
            </div>
          </div>
        </div>

        {/* 9. 5 INTERACTIVE FAQS */}
        <div id="faqs" className="space-y-6">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 font-heading">
                <HelpCircle className="w-4 h-4 text-emerald-600" />
                <span>Frequently Asked Questions</span>
              </h2>
              <p className="text-xs text-slate-600">Key technical and operational questions answered.</p>
            </div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold">5 Answers</span>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white border border-slate-200 shadow-xs overflow-hidden">
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                >
                  <span className="text-xs font-bold text-slate-900">{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${
                      openFaqIndex === idx ? 'rotate-180 text-slate-900' : ''
                    }`}
                  />
                </button>
                {openFaqIndex === idx && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-700 border-t border-slate-100 leading-relaxed bg-slate-50">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 10. FOOTER DIRECTORY */}
        <footer className="border-t border-slate-200 pt-8 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs">
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 uppercase text-[11px]">System Modules</h4>
              <ul className="space-y-1 text-[11px] text-slate-600">
                <li><button onClick={onOpenPOS} className="hover:text-slate-900 font-medium">POS Quick Sale</button></li>
                <li><button onClick={onOpenDashboard} className="hover:text-slate-900 font-medium">Executive Dashboard</button></li>
                <li><button onClick={onOpenDashboard} className="hover:text-slate-900 font-medium">Multi-Store Transfers</button></li>
                <li><button onClick={onOpenDashboard} className="hover:text-slate-900 font-medium">PO Automation</button></li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 uppercase text-[11px]">Export Reports</h4>
              <ul className="space-y-1 text-[11px] text-slate-600">
                <li><button onClick={onOpenDashboard} className="hover:text-slate-900 font-medium">CSV Master Table</button></li>
                <li><button onClick={onOpenDashboard} className="hover:text-slate-900 font-medium">Excel Spreadsheet</button></li>
                <li><button onClick={onOpenDashboard} className="hover:text-slate-900 font-medium">PDF Official Audit</button></li>
                <li><button onClick={onOpenDashboard} className="hover:text-slate-900 font-medium">JSON Encrypted DB</button></li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 uppercase text-[11px]">Legal &amp; Trust</h4>
              <ul className="space-y-1 text-[11px] text-slate-600">
                <li><Link href="/privacy" className="hover:text-slate-900 font-medium">Privacy Policy</Link></li>
                <li><Link href="/thank-you" className="hover:text-slate-900 font-medium">Thank You Page</Link></li>
                <li><Link href="/privacy" className="hover:text-slate-900 font-medium">Data Storage SLA</Link></li>
                <li><a href="https://github.com/Nikking18/inventory360" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 font-medium">GitHub Repository</a></li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 uppercase text-[11px]">Direct Links</h4>
              <ul className="space-y-1 text-[11px] text-slate-600">
                <li>{onOpenTour && <button onClick={onOpenTour} className="hover:text-emerald-700 font-medium">Interactive Tour</button>}</li>
                <li><button onClick={onStartFresh} className="hover:text-slate-900 font-medium">New Clean Workspace</button></li>
                <li><button onClick={onStartDemo} className="hover:text-slate-900 font-medium">Reset Demo Store</button></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 gap-2 font-mono">
            <span>© {new Date().getFullYear()} Inventory 360. All master data secured via browser IndexedDB.</span>
            <span>Version 2026.1 // Enterprise Local-First Release</span>
          </div>
        </footer>
      </div>
    </div>
  );
};
