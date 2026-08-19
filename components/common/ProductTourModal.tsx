'use client';

import React, { useState, useEffect } from 'react';
import { NavItemKey } from '../Sidebar';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  LayoutDashboard,
  ShoppingBag,
  Globe,
  Package,
  Boxes,
  Users,
  Settings,
  Lightbulb,
  CheckCircle2,
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
  proTip: string;
  highlights: string[];
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'dashboard',
    stepNumber: '01',
    title: 'Executive Dashboard & Live Metrics',
    tabKey: 'home',
    subTabKey: 'retail-dashboard',
    badge: 'Overview Hub',
    icon: LayoutDashboard,
    description:
      'Monitor your business performance in real time. Track gross revenue, net profit, inventory valuation, recent transactions, and low stock alert counters.',
    proTip: 'Use the outlet filter dropdown in the top bar to inspect metrics for specific store locations.',
    highlights: ['Real-time revenue & gross profit', 'Inventory & retail valuation', 'Quick POS launch & recent sales'],
  },
  {
    id: 'pos',
    stepNumber: '02',
    title: 'Lightning Point of Sale (POS Terminal)',
    tabKey: 'sell',
    subTabKey: 'quick-sale',
    badge: 'Sales POS',
    icon: ShoppingBag,
    description:
      'Process high-speed sales with sub-50ms barcode lookup, category filters, custom discounts, individual item tax calculations, and instant thermal receipt printing.',
    proTip: 'Cashiers can apply individual tax rates or custom discounts directly on the checkout sidebar.',
    highlights: ['Barcode/SKU instant search', 'Split payment & change calculator', '58mm, 80mm & A4 receipt printing'],
  },
  {
    id: 'fulfillment',
    stepNumber: '03',
    title: 'Omnichannel Orders & Fulfillment',
    tabKey: 'fulfillment',
    subTabKey: 'all-orders',
    badge: 'Channels & Dispatch',
    icon: Globe,
    description:
      'Manage multi-channel orders from Shopify, Amazon, WooCommerce, and In-Store POS. Generate print-ready pick lists and update courier tracking numbers.',
    proTip: 'Click "Generate Pick List" in Pending Dispatch to print a consolidated warehouse picking slip.',
    highlights: ['Multi-channel order sync', 'Batch pick list PDF generation', 'Courier tracking & dispatch flow'],
  },
  {
    id: 'catalog',
    stepNumber: '04',
    title: 'Master Catalog, Variants & Pricing',
    tabKey: 'catalog',
    subTabKey: 'products',
    badge: 'Product Master',
    icon: Package,
    description:
      'Maintain your entire SKU catalog with cost prices, retail prices, gross profit margins, suppliers, categories, and individual item tax rules.',
    proTip: 'Set realistic Reorder Points so the system can alert you before popular items run out of stock.',
    highlights: ['Real-time profit margin calculator', 'Strict SKU/Barcode validation', 'CSV bulk import & export'],
  },
  {
    id: 'inventory',
    stepNumber: '05',
    title: 'Multi-Outlet Stock & Purchase Orders',
    tabKey: 'inventory',
    subTabKey: 'stock-levels',
    badge: 'Inventory Hub',
    icon: Boxes,
    description:
      'Keep track of stock quantities across multiple warehouse and retail outlets. Execute internal stock transfers and create supplier purchase orders (POs).',
    proTip: 'Generate restock POs with 1 click directly from the low-stock alert screen.',
    highlights: ['Multi-location inventory tracking', 'Inter-outlet stock transfers', 'Supplier POs & stock receiving'],
  },
  {
    id: 'customers',
    stepNumber: '06',
    title: 'Customer Directory & Order History',
    tabKey: 'customers',
    badge: 'Customer CRM',
    icon: Users,
    description:
      'Build client relationships by tracking lifetime spend, total order frequency, contact details, and past transaction ledgers for walk-in and VIP accounts.',
    proTip: 'Select or create a customer at checkout to automatically update their purchase history profile.',
    highlights: ['Customer lifetime value tracking', 'Quick contact directory', 'Individual sales ledger'],
  },
  {
    id: 'setup',
    stepNumber: '07',
    title: 'Data Sovereignty, Auto-Save & Settings',
    tabKey: 'setup',
    subTabKey: 'data',
    badge: 'Local Control',
    icon: Settings,
    description:
      'Full data sovereignty. Configure automated background JSON backups directly into your local machine folder on a schedule (30m, 1h, 24h) without prompt popups.',
    proTip: 'Link a local folder under Setup > Data & Backup to enable silent automated backups.',
    highlights: ['Automated local JSON backups', '1-click full database restore', 'Tax ID, currency & branding setup'],
  },
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

  // When tour opens, navigate to the first step
  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
      const step = TOUR_STEPS[0];
      onNavigateTab(step.tabKey, step.subTabKey);
    }
  }, [isOpen]);

  // Keyboard accessibility
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        if (currentStepIndex < TOUR_STEPS.length - 1) {
          handleGoToStep(currentStepIndex + 1);
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentStepIndex > 0) {
          handleGoToStep(currentStepIndex - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIndex]);

  if (!isOpen) return null;

  const currentStep = TOUR_STEPS[currentStepIndex];
  const StepIcon = currentStep.icon;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;
  const progressPercent = ((currentStepIndex + 1) / TOUR_STEPS.length) * 100;

  const handleGoToStep = (index: number) => {
    if (index < 0 || index >= TOUR_STEPS.length) return;
    setCurrentStepIndex(index);
    const step = TOUR_STEPS[index];
    onNavigateTab(step.tabKey, step.subTabKey);
  };

  const handleNext = () => {
    if (isLastStep) {
      onClose();
    } else {
      handleGoToStep(currentStepIndex + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      handleGoToStep(currentStepIndex - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex flex-col justify-end p-3 sm:p-6 lg:p-8 font-mono">
      {/* Background Soft Dim Overlay (Click to close safely) */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-[1.5px] pointer-events-auto transition-opacity duration-200"
        onClick={onClose}
        title="Click to dismiss tour"
      />

      {/* Floating Guided Tour Spotlight Card */}
      <div className="relative z-10 pointer-events-auto max-w-xl w-full mx-auto bg-slate-900 text-white border border-slate-700 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
        {/* Top Progress Track */}
        <div className="w-full bg-slate-800 h-1">
          <div
            className="bg-emerald-400 h-1 transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          {/* Card Header */}
          <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xs bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                <StepIcon className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">
                    STEP {currentStep.stepNumber} OF 07
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                    {currentStep.badge}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-white uppercase tracking-wider font-heading mt-0.5">
                  {currentStep.title}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
              title="Close Tour (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Step Description */}
          <p className="text-xs text-slate-300 leading-relaxed">
            {currentStep.description}
          </p>

          {/* Key Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            {currentStep.highlights.map((h, i) => (
              <div
                key={i}
                className="p-2 bg-slate-800/70 border border-slate-700/60 flex items-center gap-1.5 text-[10px] text-slate-200"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="truncate">{h}</span>
              </div>
            ))}
          </div>

          {/* Pro-Tip Alert Box */}
          <div className="p-3 bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-[11px] leading-snug">
              <span className="font-bold uppercase tracking-wider text-amber-400 block">Pro-Tip:</span>
              <span className="text-amber-200/90">{currentStep.proTip}</span>
            </div>
          </div>

          {/* Card Footer Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800">
            {/* Step Dots */}
            <div className="flex items-center gap-1.5">
              {TOUR_STEPS.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleGoToStep(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    currentStepIndex === idx
                      ? 'bg-emerald-400 w-5'
                      : 'bg-slate-700 hover:bg-slate-500'
                  }`}
                  title={`Go to Step ${idx + 1}`}
                />
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 bg-transparent hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Skip Tour
              </button>

              <button
                type="button"
                disabled={isFirstStep}
                onClick={handlePrev}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1 border transition-colors ${
                  isFirstStep
                    ? 'opacity-40 cursor-not-allowed border-slate-800 text-slate-600'
                    : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-600'
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <span>{isLastStep ? 'Finish Tour' : 'Next'}</span>
                {isLastStep ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <ArrowRight className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
