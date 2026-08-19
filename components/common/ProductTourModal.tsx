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
  Bot,
  MessageSquare,
} from 'lucide-react';

export interface TourStep {
  id: string;
  stepNumber: string;
  title: string;
  tabKey: NavItemKey;
  subTabKey?: string;
  badge: string;
  icon: React.ElementType;
  bubbleMessage: string;
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
    bubbleMessage:
      'Welcome to your central control room! Here you can monitor live gross revenue, net profit margins, inventory valuation, and urgent stock alert counters.',
    proTip: 'Use the outlet dropdown in the top bar to inspect performance for specific retail stores or warehouses.',
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
    bubbleMessage:
      'This is your high-speed checkout lane! Scan barcodes with sub-50ms latency, apply custom item taxes or discounts, and print instant thermal receipts.',
    proTip: 'Cashiers can easily split payments between Cash, Card, and Digital Wallets on the checkout sidebar.',
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
    bubbleMessage:
      'Manage all multi-channel sales from Shopify, Amazon, WooCommerce, and In-Store POS in one synchronized dispatch registry.',
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
    bubbleMessage:
      'Your master SKU registry. Track unit cost, retail price, real-time profit margins, barcode indexes, and automated low-stock reorder thresholds.',
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
    bubbleMessage:
      'Gain total control over multi-location stock levels. Transfer goods between store outlets and generate supplier purchase orders with 1 click.',
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
    bubbleMessage:
      'Strengthen customer loyalty by tracking lifetime spend, order frequency, loyalty points, and full transaction ledgers.',
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
    bubbleMessage:
      '100% data ownership. Set up automated background JSON backups directly to your local machine folder without annoying browser popups.',
    proTip: 'Select a local folder under Setup > Data & Backup to activate scheduled background auto-saves.',
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

  // Minimized Floating Speech Bubble Pill
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50 font-mono animate-in fade-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="group relative flex items-center gap-3 bg-slate-900/95 hover:bg-slate-900 text-white border-2 border-emerald-400/80 px-4 py-2.5 rounded-full shadow-2xl shadow-emerald-950/50 backdrop-blur-md transition-all hover:scale-105"
        >
          {/* Pulsing Avatar Bubble */}
          <div className="relative w-8 h-8 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-extrabold shadow-md shrink-0">
            <Bot className="w-4 h-4" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-300 rounded-full animate-ping" />
          </div>

          <div className="flex flex-col text-left">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest leading-none">
              Tour Step {currentStep.stepNumber}/07
            </span>
            <span className="text-xs font-bold text-white uppercase tracking-wider mt-0.5 max-w-[140px] truncate">
              {currentStep.title}
            </span>
          </div>

          <span className="p-1 text-slate-400 group-hover:text-white transition-colors">
            <Maximize2 className="w-3.5 h-3.5" />
          </span>
        </button>
      </div>
    );
  }

  // Full Conversational Speech Bubble Floating Widget
  return (
    <div className="fixed bottom-6 right-6 z-50 font-mono max-w-md w-[calc(100vw-3rem)] animate-in fade-in slide-in-from-bottom-4 zoom-in-95 duration-200">
      <div className="relative">
        {/* Floating AI Guide Mascot Bubble Header */}
        <div className="flex items-center justify-between px-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-300 text-slate-950 flex items-center justify-center font-bold shadow-lg ring-2 ring-emerald-400/40">
              <Bot className="w-4.5 h-4.5" />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Interactive Guide
                </span>
                <span className="text-[9px] font-extrabold px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full uppercase">
                  Step {currentStep.stepNumber} of 07
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="p-1.5 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-full transition-colors"
              title="Minimize to floating pill"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-800/80 hover:bg-slate-700 rounded-full transition-colors"
              title="Close Tour (Esc)"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Speech Bubble Container with Rounded Curves & Glow */}
        <div className="relative bg-slate-900/95 text-white border-2 border-emerald-500/40 shadow-2xl shadow-slate-950/80 backdrop-blur-xl rounded-3xl p-5 space-y-4">
          {/* Top Progress Bar */}
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-400 to-teal-300 h-1.5 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Module Title Banner */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 shadow-inner">
              <StepIcon className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">
                {currentStep.badge}
              </span>
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-heading leading-tight">
                {currentStep.title}
              </h3>
            </div>
          </div>

          {/* Conversational Speech Bubble Dialogue Text */}
          <div className="relative bg-slate-800/80 border border-slate-700/70 p-3.5 rounded-2xl">
            <p className="text-xs text-slate-200 leading-relaxed font-sans font-medium">
              "{currentStep.bubbleMessage}"
            </p>
          </div>

          {/* Feature Highlights Pill Grid */}
          <div className="space-y-1.5">
            {currentStep.highlights.map((h, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px] text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">{h}</span>
              </div>
            ))}
          </div>

          {/* Thought Bubble / Pro-Tip Box */}
          <div className="p-3 bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5 rounded-2xl shadow-inner">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-snug">
              <span className="font-bold uppercase tracking-wider text-amber-400 mr-1.5">Pro-Tip:</span>
              <span className="text-amber-100/90">{currentStep.proTip}</span>
            </div>
          </div>

          {/* Bottom Actions & Step Dots */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
            {/* Step Bubble Dots */}
            <div className="flex items-center gap-1.5">
              {TOUR_STEPS.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleGoToStep(idx)}
                  className={`h-2 rounded-full transition-all ${
                    currentStepIndex === idx
                      ? 'bg-emerald-400 w-5'
                      : 'bg-slate-700 hover:bg-slate-500 w-2'
                  }`}
                  title={`Jump to Step ${idx + 1}`}
                />
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isFirstStep}
                onClick={handlePrev}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1 rounded-full border transition-all ${
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
                className="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 rounded-full shadow-md shadow-emerald-950/40 transition-all hover:scale-102 active:scale-98"
              >
                <span>{isLastStep ? 'Finish Tour 🎉' : 'Next Step'}</span>
                {!isLastStep && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
