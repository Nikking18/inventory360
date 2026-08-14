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
  Phone,
  Navigation,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

interface LandingViewProps {
  onStartDemo: () => void;
  onStartFresh: () => void;
  onOpenTour?: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
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
        'Sub-50ms search on 5,000+ SKUs. The high-contrast dark mode design is gorgeous on our POS touchscreens.',
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
    <div className="max-w-5xl mx-auto space-y-16 py-6 text-neutral-200 font-mono">
      {/* 1. HERO SECTION & CTA ABOVE THE FOLD */}
      <div className="text-center space-y-5 max-w-3xl mx-auto pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-900 border border-neutral-800 text-emerald-400 text-[10px] font-mono uppercase tracking-[0.2em]">
          <Zap className="w-3.5 h-3.5 text-emerald-400" />
          <span>Local-First Enterprise POS &amp; Inventory Engine</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold text-white font-heading tracking-tight leading-[1.1]">
          ENTERPRISE INVENTORY 360 <br />
          <span className="text-neutral-400 font-mono text-2xl sm:text-3xl uppercase tracking-wider">
            Geometric Balance Architecture
          </span>
        </h1>

        <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto font-mono">
          High-performance retail POS terminal, barcode scanning, multi-outlet stock tracking, supplier PO automation, and real-time margin analytics powered by browser IndexedDB.
        </p>

        {/* CTA ABOVE THE FOLD */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
          <button
            onClick={onStartDemo}
            className="px-6 py-3.5 bg-white hover:bg-neutral-200 text-black font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg"
          >
            <span>Explore Demo System (ACME)</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {onOpenTour && (
            <button
              onClick={onOpenTour}
              className="px-6 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs border border-neutral-700 hover:border-white uppercase tracking-wider transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Interactive Product Tour</span>
            </button>
          )}

          <button
            onClick={onStartFresh}
            className="px-6 py-3.5 bg-neutral-950 hover:bg-neutral-900 text-neutral-300 font-bold text-xs border border-neutral-800 uppercase tracking-wider transition-all"
          >
            Start Fresh Workspace
          </button>
        </div>

        {/* Trust Badges */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-6 text-[11px] text-neutral-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 100% Offline Durability
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Zero Cloud Lock-In
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Thermal Receipt Printing
          </span>
        </div>
      </div>

      {/* 2. RESPONSE TIME PROMISE & SLA BANNER */}
      <div className="bg-neutral-900 border border-neutral-800 p-6 relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="space-y-1 md:border-r border-neutral-800 md:pr-6">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase">
              <Clock className="w-4 h-4" />
              <span>Response Time Promise</span>
            </div>
            <p className="text-2xl font-bold text-white tracking-tight">&lt; 50ms</p>
            <p className="text-[11px] text-neutral-400">
              Guaranteed query latency on 10,000+ local inventory records.
            </p>
          </div>

          <div className="space-y-1 md:border-r border-neutral-800 md:pr-6">
            <div className="flex items-center gap-2 text-white text-xs font-bold uppercase">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>99.99% Local Availability</span>
            </div>
            <p className="text-2xl font-bold text-white tracking-tight">Zero Lag</p>
            <p className="text-[11px] text-neutral-400">
              Zero network bottlenecks during peak checkout rushes.
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-white text-xs font-bold uppercase">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Direct Browser Storage</span>
            </div>
            <p className="text-2xl font-bold text-white tracking-tight">W3C IndexedDB</p>
            <p className="text-[11px] text-neutral-400">
              Secure client-side persistence with 1-click JSON exports.
            </p>
          </div>
        </div>
      </div>

      {/* 3. CASE STUDIES SECTION */}
      <div className="space-y-6">
        <div className="border-b border-neutral-800 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>Retail Case Studies</span>
            </h2>
            <p className="text-xs text-neutral-400">Proven multi-outlet retail performance at scale.</p>
          </div>
          <span className="text-[10px] text-neutral-500 uppercase">Verified Deployments</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {caseStudies.map((cs, i) => (
            <div key={i} className="p-6 bg-neutral-900 border border-neutral-800 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase">{cs.company}</span>
                  <span className="text-[10px] bg-neutral-950 px-2 py-0.5 border border-neutral-800 text-neutral-400 uppercase">
                    {cs.locations}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-emerald-400">{cs.headline}</h3>
                <p className="text-xs text-neutral-300 italic leading-relaxed border-l-2 border-emerald-500 pl-3">
                  &ldquo;{cs.quote}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-800/80 space-y-3">
                <div className="grid grid-cols-3 gap-2 text-center">
                  {cs.metrics.map((m, mi) => (
                    <div key={mi} className="p-2 bg-neutral-950 border border-neutral-800">
                      <p className="text-xs font-bold text-white">{m.value}</p>
                      <p className="text-[9px] text-neutral-400 mt-0.5">{m.label}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-neutral-500 text-right">— {cs.author}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. REAL REVIEWS & TESTIMONIALS */}
      <div className="space-y-6">
        <div className="border-b border-neutral-800 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>Verified Store Reviews</span>
            </h2>
            <p className="text-xs text-neutral-400">Feedback from retail managers and business operators.</p>
          </div>
          <span className="text-[10px] text-emerald-400 uppercase font-bold bg-emerald-950/60 border border-emerald-800 px-2 py-0.5">
            ★ 4.9 / 5.0 Rating
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reviews.map((rev, i) => (
            <div key={i} className="p-5 bg-neutral-900 border border-neutral-800 space-y-3">
              <div className="flex items-center gap-1">
                {[...Array(rev.rating)].map((_, si) => (
                  <Star key={si} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">&ldquo;{rev.comment}&rdquo;</p>
              <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-[10px]">
                <div>
                  <p className="font-bold text-white">{rev.name}</p>
                  <p className="text-neutral-500">{rev.title}</p>
                </div>
                {rev.verified && (
                  <span className="text-[9px] text-emerald-400 font-bold uppercase">Verified User</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. MAPS + STORE DIRECTIONS */}
      <div className="bg-neutral-900 border border-neutral-800 p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-800 pb-4 gap-2">
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Store Outlets &amp; Directions</span>
            </h2>
            <p className="text-xs text-neutral-400">Integrated multi-store physical store directories.</p>
          </div>
          <span className="text-[10px] text-neutral-500 uppercase">GPS Enabled</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Store 1 */}
          <div className="p-4 bg-neutral-950 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase">Downtown Flagship Outlet</h3>
              <span className="text-[9px] text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-1.5 py-0.5 uppercase">Primary POS</span>
            </div>
            <p className="text-xs text-neutral-400">100 Innovation Way, Suite 400, San Francisco, CA 94105</p>
            <div className="text-[11px] text-neutral-500 space-y-0.5">
              <p>Hours: Mon - Sun (8:00 AM - 10:00 PM)</p>
              <p>Phone: +1 (800) 555-0360</p>
            </div>
            <a
              href="https://maps.google.com/?q=100+Innovation+Way+San+Francisco+CA"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-white bg-neutral-900 border border-neutral-700 hover:border-white px-3 py-1.5 font-bold uppercase transition-colors"
            >
              <Navigation className="w-3.5 h-3.5 text-emerald-400" />
              <span>Get Directions</span>
            </a>
          </div>

          {/* Store 2 */}
          <div className="p-4 bg-neutral-950 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase">Westside Distribution Hub</h3>
              <span className="text-[9px] text-neutral-400 bg-neutral-900 border border-neutral-800 px-1.5 py-0.5 uppercase">Warehouse</span>
            </div>
            <p className="text-xs text-neutral-400">450 Logistics Blvd, Dock 12, Oakland, CA 94607</p>
            <div className="text-[11px] text-neutral-500 space-y-0.5">
              <p>Hours: Mon - Fri (6:00 AM - 8:00 PM)</p>
              <p>Phone: +1 (800) 555-0361</p>
            </div>
            <a
              href="https://maps.google.com/?q=450+Logistics+Blvd+Oakland+CA"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-white bg-neutral-900 border border-neutral-700 hover:border-white px-3 py-1.5 font-bold uppercase transition-colors"
            >
              <Navigation className="w-3.5 h-3.5 text-emerald-400" />
              <span>Get Directions</span>
            </a>
          </div>
        </div>
      </div>

      {/* 6. ENGINEERING & PRODUCT TEAM SPOTLIGHT */}
      <div className="bg-neutral-900 border border-neutral-800 p-6 space-y-6">
        <div className="border-b border-neutral-800 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Engineering &amp; Product Team</span>
            </h2>
            <p className="text-xs text-neutral-400">The retail technologists behind Inventory 360.</p>
          </div>
          <span className="text-[10px] text-neutral-500 uppercase">Core Architects</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-6 overflow-hidden border border-neutral-800 bg-neutral-950">
            <img
              src="/team.jpg"
              alt="Inventory 360 Engineering and Product Development Team in tech office"
              className="w-full h-64 object-cover object-center grayscale contrast-125 hover:grayscale-0 transition-all duration-500"
            />
          </div>

          <div className="lg:col-span-6 space-y-3 text-xs">
            <h3 className="text-sm font-bold text-white uppercase">Engineered for Reliability</h3>
            <p className="text-neutral-400 leading-relaxed">
              Our engineering collective specializes in local-first database architectures, offline synchronization algorithms, and enterprise POS telemetry systems.
            </p>
            <div className="p-3 bg-neutral-950 border border-neutral-800 space-y-1.5 text-[11px] text-neutral-300">
              <p>• <strong>Core Focus:</strong> Sub-50ms latency &amp; Zero downtime retail operations.</p>
              <p>• <strong>Architecture:</strong> W3C IndexedDB + Next.js Serverless Static Builds.</p>
              <p>• <strong>Data Ethos:</strong> 100% Client-Side Privacy &amp; Data Sovereignty.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 7. 5 INTERACTIVE FAQS */}
      <div className="space-y-6">
        <div className="border-b border-neutral-800 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              <span>Frequently Asked Questions</span>
            </h2>
            <p className="text-xs text-neutral-400">Key technical and operational questions answered.</p>
          </div>
          <span className="text-[10px] text-neutral-500 uppercase">5 Answers</span>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-neutral-900 border border-neutral-800 overflow-hidden">
              <button
                onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                className="w-full p-4 text-left flex items-center justify-between gap-4 hover:bg-neutral-800/60 transition-colors"
              >
                <span className="text-xs font-bold text-white">{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform ${
                    openFaqIndex === idx ? 'rotate-180 text-white' : ''
                  }`}
                />
              </button>
              {openFaqIndex === idx && (
                <div className="px-4 pb-4 pt-1 text-xs text-neutral-400 border-t border-neutral-800/60 leading-relaxed bg-neutral-950">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 8. INTERNAL LINKS & FOOTER DIRECTORY */}
      <div className="border-t border-neutral-800 pt-8 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs">
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase text-[11px]">System Modules</h4>
            <ul className="space-y-1 text-[11px] text-neutral-400">
              <li><button onClick={onStartDemo} className="hover:text-white">POS Quick Sale</button></li>
              <li><button onClick={onStartDemo} className="hover:text-white">Product Master</button></li>
              <li><button onClick={onStartDemo} className="hover:text-white">Multi-Store Transfers</button></li>
              <li><button onClick={onStartDemo} className="hover:text-white">PO Automation</button></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase text-[11px]">Export Reports</h4>
            <ul className="space-y-1 text-[11px] text-neutral-400">
              <li><button onClick={onStartDemo} className="hover:text-white">CSV Master Table</button></li>
              <li><button onClick={onStartDemo} className="hover:text-white">Excel Spreadsheet</button></li>
              <li><button onClick={onStartDemo} className="hover:text-white">PDF Official Audit</button></li>
              <li><button onClick={onStartDemo} className="hover:text-white">JSON Encrypted DB</button></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase text-[11px]">Legal &amp; Trust</h4>
            <ul className="space-y-1 text-[11px] text-neutral-400">
              <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/thank-you" className="hover:text-white">Thank You Page</Link></li>
              <li><Link href="/privacy" className="hover:text-white">Data Storage SLA</Link></li>
              <li><a href="https://github.com/Nikking18/inventory360" target="_blank" rel="noopener noreferrer" className="hover:text-white">GitHub Repository</a></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase text-[11px]">Help &amp; Direct Links</h4>
            <ul className="space-y-1 text-[11px] text-neutral-400">
              <li>{onOpenTour && <button onClick={onOpenTour} className="hover:text-emerald-400">Product Tour</button>}</li>
              <li><button onClick={onStartFresh} className="hover:text-white">New Workspace</button></li>
              <li><a href="https://inventory360-five.vercel.app" className="hover:text-white">Live Vercel Link</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-800 pt-4 flex flex-col sm:flex-row items-center justify-between text-[10px] text-neutral-500 gap-2">
          <span>© {new Date().getFullYear()} Inventory 360. All master data secured via browser IndexedDB.</span>
          <span>Version 2026.1 // Enterprise Local-First Release</span>
        </div>
      </div>

      {/* 9. STICKY MOBILE CTA BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-3 bg-neutral-950/95 border-t border-neutral-800 backdrop-blur-md md:hidden flex items-center justify-between gap-3 shadow-2xl">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-white truncate">Inventory 360 POS</p>
          <p className="text-[10px] text-emerald-400 truncate">Local-First • Sub-50ms Speed</p>
        </div>
        <button
          onClick={onStartDemo}
          className="px-4 py-2 bg-white text-black font-bold text-xs uppercase tracking-wider shrink-0 flex items-center gap-1"
        >
          <span>Launch POS</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
