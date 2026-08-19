'use client';

import React, { useState, useEffect } from 'react';
import { NavItemKey } from '../Sidebar';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  Minimize2,
  Maximize2,
  LayoutDashboard,
  ShoppingBag,
  Globe,
  Package,
  Boxes,
  Users,
  Settings,
  Lightbulb,
  CheckCircle2,
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
  const [isMinimized, setIsMinimized] = useState(false);

  // When tour opens, navigate to current step
  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
      setIsMinimized(false);
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

  // Minimized Floating Widget Pill
  if (isMinimized) {
    return (
      <div className="fixed bottom-5 right-5 z-50 font-mono animate-in fade-in slide-in-from-bottom-2">
        <div className="flex items-center gap-2 bg-slate-900 text-white border border-slate-700 shadow-2xl p-2.5 rounded-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsMinimized(false)}>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
              Tour {currentStep.stepNumber}/07:
            </span>
            <span className="text-xs font-bold text-white uppercase tracking-wider truncate max-w-[160px]">
              {currentStep.title}
            </span>
          </div>

          <div className="flex items-center gap-1 border-l border-slate-700 pl-2">
            <button
              type="button"
              onClick={() => setIsMinimized(false)}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Expand Tour Guide"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              title="Close Tour"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Full Floating Speech Bubble Widget (Zero Fullscreen Dimming Overlay)
  return (
    <div className="fixed bottom-5 right-5 z-50 font-mono max-w-md w-[calc(100vw-2.5rem)] animate-in fade-in slide-in-from-bottom-3 duration-200">
      <div className="bg-slate-900 text-white border-2 border-slate-700 shadow-2xl overflow-hidden rounded-xs">
        {/* Top Progress Track */}
        <div className="w-full bg-slate-800 h-1">
          <div
            className="bg-emerald-400 h-1 transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="p-4 sm:p-5 space-y-3.5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xs bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                <StepIcon className="w-3.5 h-3.5" />
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
                <h3 className="font-bold text-xs sm:text-sm text-white uppercase tracking-wider font-heading mt-0.5">
                  {currentStep.title}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setIsMinimized(true)}
                className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Minimize Tour"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                title="Close Tour (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-slate-300 leading-relaxed">
            {currentStep.description}
          </p>

          {/* Highlights checklist */}
          <div className="space-y-1 pt-0.5">
            {currentStep.highlights.map((h, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="truncate">{h}</span>
              </div>
            ))}
          </div>

          {/* Pro-Tip Box */}
          <div className="p-2.5 bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2 rounded-xs">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-[10.5px] leading-snug">
              <span className="font-bold uppercase tracking-wider text-amber-400 mr-1">Tip:</span>
              <span className="text-amber-200/90">{currentStep.proTip}</span>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
            {/* Step Dots */}
            <div className="flex items-center gap-1">
              {TOUR_STEPS.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleGoToStep(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    currentStepIndex === idx
                      ? 'bg-emerald-400 w-4'
                      : 'bg-slate-700 hover:bg-slate-500 w-1.5'
                  }`}
                  title={`Go to Step ${idx + 1}`}
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={isFirstStep}
                onClick={handlePrev}
                className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider flex items-center gap-1 border transition-colors ${
                  isFirstStep
                    ? 'opacity-30 cursor-not-allowed border-slate-800 text-slate-600'
                    : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-600'
                }`}
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Prev</span>
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="px-3.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1 shadow-sm transition-colors"
              >
                <span>{isLastStep ? 'Finish' : 'Next'}</span>
                {isLastStep ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : (
                  <ArrowRight className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
