'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../context/I18nContext';
import { NavItemKey } from '../Sidebar';
import {
  Sparkles,
  X,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  LayoutDashboard,
  ShoppingBag,
  Package,
  Boxes,
  Users,
  BarChart3,
  Settings,
  CheckCircle2,
  Play,
  ArrowRight,
  BookOpen,
  MousePointerClick,
  Compass,
} from 'lucide-react';

export interface TourStep {
  id: string;
  stepNumber: string;
  title: string;
  tabKey: NavItemKey;
  subTabKey?: string;
  badge: string;
  icon: React.ElementType;
  description: string;
  actionText: string;
  highlights: string[];
  proTip: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    stepNumber: '01',
    title: 'Executive Dashboard & Metrics',
    tabKey: 'home',
    badge: 'Overview Hub',
    icon: LayoutDashboard,
    description: 'Track gross revenue, net profit, stock warning badges, and transaction logs in real time.',
    actionText: 'Explore Dashboard Metrics',
    highlights: [
      'Interactive revenue area charts',
      'Stock health status counters',
      'Per-outlet inventory valuation'
    ],
    proTip: 'Use the location filter in the top bar to inspect individual store outlets.'
  },
  {
    id: 'pos',
    stepNumber: '02',
    title: 'Point of Sale (POS Terminal)',
    tabKey: 'sell',
    subTabKey: 'quick-sale',
    badge: 'Sales POS',
    icon: ShoppingBag,
    description: 'Process fast transactions with SKU search, category tabs, cart limits, and thermal receipt printing.',
    actionText: 'Test POS Checkout',
    highlights: [
      'Cart boundary prevents selling out-of-stock items',
      'Instant customer CRM selection & tax rates',
      'Multi-payment options & receipt printing'
    ],
    proTip: 'Check Returns & Refunds under the Sell tab to view past transactions and process refunds.'
  },
  {
    id: 'catalog',
    stepNumber: '03',
    title: 'Product Catalog & Variants',
    tabKey: 'catalog',
    subTabKey: 'products',
    badge: 'Product Master',
    icon: Package,
    description: 'Manage master products with strict SKU/Barcode collision checks, profit margins, and supplier links.',
    actionText: 'Manage Product Master',
    highlights: [
      'Duplicate SKU & Barcode collision checks',
      'Category & Supplier lookup master records',
      'Automatic stock status badges'
    ],
    proTip: 'Set a realistic Reorder Point to receive automatic restocking alerts before stock runs out.'
  },
  {
    id: 'inventory',
    stepNumber: '04',
    title: 'Multi-Outlet Stock & Transfers',
    tabKey: 'inventory',
    subTabKey: 'low-stock',
    badge: 'Inventory Hub',
    icon: Boxes,
    description: 'Control multi-location stock levels, execute inter-outlet transfers, and customize purchase orders.',
    actionText: 'View Stock Alerts & POs',
    highlights: [
      'Low Stock alerts with custom PO generator modal',
      'Inter-outlet transfers with dual location balances',
      'Complete stock movement history log'
    ],
    proTip: 'Click "Create PO" on any low-stock alert to set order quantity and target destination.'
  },
  {
    id: 'crm',
    stepNumber: '05',
    title: 'Customer Relationship CRM',
    tabKey: 'customers',
    badge: 'Customer CRM',
    icon: Users,
    description: 'Track customer lifetime purchase revenue, total orders, outstanding balances, and purchase history.',
    actionText: 'Open Customer Profiles',
    highlights: [
      'Automatic customer revenue & order count sync',
      'Revenue adjustments on sales returns',
      'Customer search by name or contact details'
    ],
    proTip: 'Select customers at checkout to build individual lifetime value profiles.'
  },
  {
    id: 'reporting',
    stepNumber: '06',
    title: 'Financial Analytics & Reports',
    tabKey: 'reporting',
    badge: 'Executive Reports',
    icon: BarChart3,
    description: 'Gain financial insights with date-range filters ("Today", "Week", "Month", "Year") and 1-click exports.',
    actionText: 'Run Financial Reports',
    highlights: [
      'Filtered analytical charts by date range',
      'Product performance breakdown (Revenue, COGS, Profit)',
      '1-click export to CSV, Excel, and PDF'
    ],
    proTip: 'Use the Export menu in the top header to download printable audit reports for your accountant.'
  },
  {
    id: 'setup',
    stepNumber: '07',
    title: 'Workspace Setup & Backups',
    tabKey: 'setup',
    subTabKey: 'general',
    badge: 'System Settings',
    icon: Settings,
    description: 'Customize business profile, toggle dark/light theme, select currency/language, and backup IndexedDB data.',
    actionText: 'Configure Workspace',
    highlights: [
      'Multi-currency & 6-language translation engine',
      'IndexedDB browser storage (100% private & offline)',
      'Schema-validated JSON workspace export/restore'
    ],
    proTip: 'Regularly export a JSON backup from Setup > Data to save an offline copy of your entire database.'
  }
];

interface ProductTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: NavItemKey, subTab?: string) => void;
}

export const ProductTourModal: React.FC<ProductTourModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);

  const currentStep = TOUR_STEPS[currentStepIndex];

  // Sync background application tab when step changes
  useEffect(() => {
    if (isOpen && currentStep) {
      onNavigateTab(currentStep.tabKey, currentStep.subTabKey);
    }
  }, [isOpen, currentStepIndex]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        if (currentStepIndex < TOUR_STEPS.length - 1) {
          setCurrentStepIndex((prev) => prev + 1);
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentStepIndex > 0) {
          setCurrentStepIndex((prev) => prev - 1);
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIndex, onClose]);

  if (!isOpen) return null;

  const IconComponent = currentStep.icon;
  const progressPercent = ((currentStepIndex + 1) / TOUR_STEPS.length) * 100;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 font-mono select-none max-w-2xl w-[calc(100vw-2rem)] transition-all duration-300">
      {/* Sleek Centered Dock Banner Container */}
      <div className="bg-neutral-950/95 border border-neutral-700/80 shadow-[0_25px_60px_rgba(0,0,0,0.85)] backdrop-blur-2xl transition-all overflow-hidden">
        {/* Top Glowing Emerald Progress Line */}
        <div className="w-full bg-neutral-900 h-1 relative">
          <div
            className="h-full bg-emerald-400 transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Minimized Compact Dock Bar */}
        {isMinimized ? (
          <div className="px-4 py-3 flex items-center justify-between bg-neutral-900/90 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <span className="font-bold text-white uppercase tracking-wider text-[11px] truncate">
                Interactive Tour: Step {currentStep.stepNumber} of 07 - {currentStep.title}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsMinimized(false)}
                className="px-2.5 py-1 bg-white text-black hover:bg-neutral-200 text-[10px] uppercase font-bold flex items-center gap-1 transition-colors"
                title="Expand Interactive Tour Dock"
              >
                <span>Expand Dock</span>
                <ChevronUp className="w-3 h-3" />
              </button>
              <button
                onClick={onClose}
                className="p-1 text-neutral-400 hover:text-white"
                title="Close Tour"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Full Centered Floating Spotlight Card */
          <div>
            {/* Header Controls Bar */}
            <div className="px-5 py-3 bg-neutral-900/90 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="px-2.5 py-0.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold uppercase tracking-widest shrink-0">
                  Step {currentStep.stepNumber} of 07
                </div>
                <span className="text-xs font-bold uppercase text-neutral-300 tracking-wider hidden sm:inline">
                  {currentStep.badge}
                </span>
              </div>

              {/* Interactive Step Progress Navigation Pills */}
              <div className="flex items-center gap-1.5">
                {TOUR_STEPS.map((step, idx) => (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStepIndex(idx)}
                    className={`h-2 transition-all ${
                      idx === currentStepIndex
                        ? 'w-6 bg-white'
                        : 'w-2 bg-neutral-700 hover:bg-neutral-500'
                    }`}
                    title={`Go to ${step.title}`}
                  />
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(true)}
                  className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                  title="Minimize Dock"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                  title="Exit Tour"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Main Dock Body Content */}
            <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-5 text-xs text-neutral-300">
              {/* Left Column: Title & Description */}
              <div className="md:col-span-7 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-neutral-900 border border-neutral-800 text-white shrink-0 mt-0.5">
                    <IconComponent className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider leading-snug">
                      {currentStep.title}
                    </h3>
                    <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                      {currentStep.description}
                    </p>
                  </div>
                </div>

                {/* Pro Tip Box */}
                <div className="p-2.5 bg-amber-950/20 border border-amber-900/40 text-[10px] text-amber-300 flex items-start gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-400 uppercase">Pro Tip: </span>
                    <span>{currentStep.proTip}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Key Highlights & Live Trigger */}
              <div className="md:col-span-5 flex flex-col justify-between space-y-3 bg-neutral-900/70 border border-neutral-800 p-3">
                <div className="space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 border-b border-neutral-800 pb-1">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>Feature Highlights</span>
                  </div>
                  <div className="space-y-1.5">
                    {currentStep.highlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-2 text-[11px] text-neutral-300 leading-tight">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Direct Action Trigger */}
                <button
                  onClick={() => onNavigateTab(currentStep.tabKey, currentStep.subTabKey)}
                  className="w-full py-1.5 px-2 bg-neutral-950 border border-neutral-700 hover:border-white text-white text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all mt-auto"
                >
                  <MousePointerClick className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{currentStep.actionText}</span>
                </button>
              </div>
            </div>

            {/* Bottom Footer Navigation */}
            <div className="px-5 py-3 bg-neutral-900/90 border-t border-neutral-800 flex items-center justify-between">
              <span className="text-[10px] text-neutral-500 uppercase tracking-widest hidden sm:inline">
                Use ← → keys to navigate
              </span>

              <div className="flex items-center gap-2 ml-auto">
                {currentStepIndex > 0 && (
                  <button
                    onClick={() => setCurrentStepIndex((prev) => prev - 1)}
                    className="px-3 py-1.5 bg-neutral-950 border border-neutral-800 hover:border-neutral-600 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Prev</span>
                  </button>
                )}

                {currentStepIndex < TOUR_STEPS.length - 1 ? (
                  <button
                    onClick={() => setCurrentStepIndex((prev) => prev + 1)}
                    className="px-4 py-1.5 bg-white text-black hover:bg-neutral-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-all"
                  >
                    <span>Next Feature</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={onClose}
                    className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-all"
                  >
                    <span>Finish Tour</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
