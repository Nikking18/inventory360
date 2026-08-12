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
  Target,
  MousePointerClick,
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
    title: 'Executive Dashboard & Live Metrics',
    tabKey: 'home',
    badge: 'Overview',
    icon: LayoutDashboard,
    description: 'Track gross revenue, net profit, low stock warnings, and transaction metrics in real time.',
    actionText: 'View Dashboard Metrics',
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
    description: 'Process fast transactions with barcode/SKU search, category filtering, cart boundaries, and receipt printing.',
    actionText: 'Try POS Terminal',
    highlights: [
      'Cart boundary prevents stock over-selling',
      'Instant customer CRM selection & tax rates',
      'Multi-payment methods & receipt printing'
    ],
    proTip: 'Check Returns & Refunds under the Sell tab to view past transactions and process refunds.'
  },
  {
    id: 'catalog',
    stepNumber: '03',
    title: 'Product Catalog & Variant Control',
    tabKey: 'catalog',
    subTabKey: 'products',
    badge: 'Catalog',
    icon: Package,
    description: 'Manage master products with SKU/Barcode validation, cost vs retail pricing, and supplier records.',
    actionText: 'Explore Product Catalog',
    highlights: [
      'Duplicate SKU & Barcode validation',
      'Category & Supplier lookup tables',
      'Automatic stock status badges'
    ],
    proTip: 'Set a realistic Reorder Point to receive automatic restocking alerts before stock runs out.'
  },
  {
    id: 'inventory',
    stepNumber: '04',
    title: 'Multi-Outlet Stock & Transfer Hub',
    tabKey: 'inventory',
    subTabKey: 'low-stock',
    badge: 'Stock Hub',
    icon: Boxes,
    description: 'Control multi-location stock levels, execute inter-outlet transfers, and customize purchase orders.',
    actionText: 'View Stock Alerts & POs',
    highlights: [
      'Low Stock alerts & Purchase Order modal',
      'Inter-outlet transfers with dual location balances',
      'Complete stock movement history log'
    ],
    proTip: 'Click "Create PO" on any low-stock alert to set order quantity and destination outlet.'
  },
  {
    id: 'crm',
    stepNumber: '05',
    title: 'Customer Relationship Management',
    tabKey: 'customers',
    badge: 'CRM',
    icon: Users,
    description: 'Track customer lifetime purchase revenue, total orders, outstanding balances, and last purchase date.',
    actionText: 'Open CRM Profiles',
    highlights: [
      'Automatic customer revenue & order count sync',
      'Revenue adjustments on sales refunds',
      'Customer search by name or contact details'
    ],
    proTip: 'Select customers at checkout to build individual lifetime value profiles.'
  },
  {
    id: 'reporting',
    stepNumber: '06',
    title: 'Executive Analytics & Financial Reports',
    tabKey: 'reporting',
    badge: 'Analytics',
    icon: BarChart3,
    description: 'Gain financial insights with date-range filters ("Today", "Week", "Month", "Year") and 1-click exports.',
    actionText: 'Run Financial Reports',
    highlights: [
      'Filtered analytical charts by date range',
      'Product performance breakdown (Revenue, COGS, Profit)',
      '1-click export to CSV, Excel, and PDF'
    ],
    proTip: 'Use the Export menu in the header to download printable audit reports for your accountant.'
  },
  {
    id: 'setup',
    stepNumber: '07',
    title: 'System Setup & Offline Data Backups',
    tabKey: 'setup',
    subTabKey: 'general',
    badge: 'Settings',
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
  const { t } = useTranslation();

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

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 font-mono transition-all duration-300 ease-out select-none">
      {/* Sleek Floating Spotlight Card Container */}
      <div className="w-[calc(100vw-2rem)] sm:w-[460px] bg-neutral-950/95 border border-neutral-700/80 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl transition-all">
        {/* Minimized Compact Bar Mode */}
        {isMinimized ? (
          <div className="p-3 flex items-center justify-between bg-neutral-900/90 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                Tour: Step {currentStep.stepNumber} of 07 - {currentStep.badge}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsMinimized(false)}
                className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-white text-[10px] uppercase font-bold flex items-center gap-1"
                title="Expand Tour Popup"
              >
                <span>Expand</span>
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
          /* Full Professional Hovering Spotlight Card */
          <div>
            {/* Header Spotlight Bar with Step Dots */}
            <div className="px-5 py-3.5 bg-neutral-900/90 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold uppercase tracking-widest shrink-0">
                  {currentStep.stepNumber} / 07
                </div>
                <span className="text-xs font-bold uppercase text-neutral-300 tracking-wider">
                  {currentStep.badge}
                </span>
              </div>

              {/* Step Navigation Dots */}
              <div className="hidden sm:flex items-center gap-1.5">
                {TOUR_STEPS.map((step, idx) => (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStepIndex(idx)}
                    className={`h-1.5 transition-all ${
                      idx === currentStepIndex
                        ? 'w-5 bg-white'
                        : 'w-1.5 bg-neutral-700 hover:bg-neutral-500'
                    }`}
                    title={step.title}
                  />
                ))}
              </div>

              {/* Minimize & Close Actions */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(true)}
                  className="p-1 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                  title="Minimize Popup"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="p-1 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                  title="Exit Tour"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Card Content Area */}
            <div className="p-5 space-y-4 text-xs text-neutral-300">
              {/* Title & Icon Header */}
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

              {/* Key Features Bullet List */}
              <div className="p-3 bg-neutral-900/80 border border-neutral-800 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>Key Highlights</span>
                </div>
                <div className="space-y-1.5">
                  {currentStep.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] text-neutral-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pro Tip Note */}
              <div className="p-2.5 bg-amber-950/20 border border-amber-900/40 text-[10px] text-amber-300 flex items-start gap-2">
                <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-400 uppercase">Tip: </span>
                  <span>{currentStep.proTip}</span>
                </div>
              </div>
            </div>

            {/* Hovering Popup Action & Navigation Controls */}
            <div className="p-4 bg-neutral-900/90 border-t border-neutral-800 flex items-center justify-between gap-3">
              {/* Interactive Try Feature Trigger */}
              <button
                onClick={() => onNavigateTab(currentStep.tabKey, currentStep.subTabKey)}
                className="px-3 py-1.5 bg-neutral-950 border border-neutral-700 hover:border-white text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shrink-0"
              >
                <MousePointerClick className="w-3.5 h-3.5 text-emerald-400" />
                <span>{currentStep.actionText}</span>
              </button>

              {/* Step Navigation Controls */}
              <div className="flex items-center gap-2">
                {currentStepIndex > 0 && (
                  <button
                    onClick={() => setCurrentStepIndex((prev) => prev - 1)}
                    className="p-1.5 bg-neutral-950 border border-neutral-800 hover:border-neutral-600 text-white transition-all"
                    title="Previous Feature"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}

                {currentStepIndex < TOUR_STEPS.length - 1 ? (
                  <button
                    onClick={() => setCurrentStepIndex((prev) => prev + 1)}
                    className="px-3.5 py-1.5 bg-white text-black hover:bg-neutral-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-all"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={onClose}
                    className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-all"
                  >
                    <span>Finish</span>
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
