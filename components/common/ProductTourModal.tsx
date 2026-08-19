'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NavItemKey } from '../Sidebar';
import { X } from 'lucide-react';

export interface TourStep {
  id: string;
  title: string;
  tabKey: NavItemKey;
  subTabKey?: string;
  elementId: string;
  description: string;
  placement?: 'right' | 'left' | 'top' | 'bottom' | 'center';
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'dashboard',
    title: 'Getting started',
    tabKey: 'home',
    subTabKey: 'retail-dashboard',
    elementId: '#tour-dashboard-metrics',
    description: 'Welcome to Inventory 360! Track gross revenue, profit margins, inventory valuation, and recent sales in real time. 🚀',
    placement: 'bottom',
  },
  {
    id: 'pos',
    title: 'Point of Sale (POS)',
    tabKey: 'sell',
    subTabKey: 'quick-sale',
    elementId: '#tour-pos-terminal',
    description: 'Process lightning-fast checkouts with barcode lookup, custom item taxes, cashier discounts, and thermal receipts! ⚡',
    placement: 'bottom',
  },
  {
    id: 'fulfillment',
    title: 'Omnichannel Orders',
    tabKey: 'fulfillment',
    subTabKey: 'all-orders',
    elementId: '#tour-fulfillment-orders',
    description: 'Manage sales across Shopify, Amazon, and In-Store POS with 1-click batch pick lists and dispatch tracking! 📦',
    placement: 'bottom',
  },
  {
    id: 'catalog',
    title: 'Master Catalog',
    tabKey: 'catalog',
    subTabKey: 'products',
    elementId: '#tour-catalog-table',
    description: 'Maintain SKUs, calculate real-time gross profit margins, set reorder points, and bulk import CSV catalogs! 🏷️',
    placement: 'bottom',
  },
  {
    id: 'inventory',
    title: 'Multi-Outlet Inventory',
    tabKey: 'inventory',
    subTabKey: 'stock-levels',
    elementId: '#tour-inventory-hub',
    description: 'Transfer stock between store outlets and warehouses, track lots, and generate supplier purchase orders! 🔄',
    placement: 'bottom',
  },
  {
    id: 'customers',
    title: 'Customer Directory',
    tabKey: 'customers',
    elementId: '#tour-customer-crm',
    description: 'Track customer lifetime purchase revenue, order history ledgers, and contact information with ease! 👥',
    placement: 'bottom',
  },
  {
    id: 'setup',
    title: 'Data & Auto-Save',
    tabKey: 'setup',
    subTabKey: 'data',
    elementId: '#tour-setup-workspace',
    description: '100% data sovereignty. Set up silent scheduled auto-saves directly to your local computer folder! 💾',
    placement: 'bottom',
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
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [bubblePos, setBubblePos] = useState<{
    top?: number;
    left?: number;
    arrowSide?: 'top' | 'bottom' | 'left' | 'right';
  } | null>(null);

  const bubbleRef = useRef<HTMLDivElement | null>(null);

  // Update target element positioning
  const updatePosition = useCallback(() => {
    if (!isOpen) return;
    const step = TOUR_STEPS[currentStepIndex];
    const el = document.querySelector(step.elementId);

    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);

      // Bubble dimensions (default max-w is ~360px, height ~240px)
      const bubbleWidth = bubbleRef.current?.offsetWidth || 360;
      const bubbleHeight = bubbleRef.current?.offsetHeight || 220;
      const padding = 16;
      const arrowOffset = 12;

      let top = rect.bottom + arrowOffset;
      let left = Math.max(padding, Math.min(rect.left, window.innerWidth - bubbleWidth - padding));
      let arrowSide: 'top' | 'bottom' | 'left' | 'right' = 'top';

      // If bottom overflows viewport, place on top
      if (top + bubbleHeight > window.innerHeight - padding) {
        if (rect.top - bubbleHeight - arrowOffset > padding) {
          top = rect.top - bubbleHeight - arrowOffset;
          arrowSide = 'bottom';
        } else {
          // Center vertically if neither fits nicely
          top = Math.max(padding, (window.innerHeight - bubbleHeight) / 2);
          left = Math.max(padding, (window.innerWidth - bubbleWidth) / 2);
        }
      }

      setBubblePos({ top, left, arrowSide });
    } else {
      setTargetRect(null);
      setBubblePos(null);
    }
  }, [isOpen, currentStepIndex]);

  // Navigate tab on step change
  useEffect(() => {
    if (isOpen) {
      const step = TOUR_STEPS[currentStepIndex];
      onNavigateTab(step.tabKey, step.subTabKey);

      // Small delay to allow tab DOM to render
      const timer = setTimeout(() => {
        updatePosition();
      }, 100);

      const retryTimer = setTimeout(() => {
        updatePosition();
      }, 300);

      return () => {
        clearTimeout(timer);
        clearTimeout(retryTimer);
      };
    }
  }, [isOpen, currentStepIndex, onNavigateTab, updatePosition]);

  // Window resize & scroll listeners
  useEffect(() => {
    if (!isOpen) return;

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        if (currentStepIndex < TOUR_STEPS.length - 1) {
          setCurrentStepIndex((prev) => prev + 1);
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentStepIndex > 0) {
          setCurrentStepIndex((prev) => prev - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, currentStepIndex, onClose, updatePosition]);

  if (!isOpen) return null;

  const currentStep = TOUR_STEPS[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onClose();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans select-none pointer-events-auto">
      {/* 1. Backdrop with Spotlight Cutout */}
      <div
        className="fixed inset-0 bg-black/65 transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Target Element Highlight Outline */}
      {targetRect && (
        <div
          className="fixed pointer-events-none rounded-xl transition-all duration-300 ease-out z-50 ring-4 ring-indigo-500/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]"
          style={{
            top: `${targetRect.top - 4}px`,
            left: `${targetRect.left - 4}px`,
            width: `${targetRect.width + 8}px`,
            height: `${targetRect.height + 8}px`,
          }}
        />
      )}

      {/* 2. Floating Speech Bubble Card matching exact reference design */}
      <div
        ref={bubbleRef}
        className="fixed z-50 max-w-[360px] w-[calc(100vw-2rem)] transition-all duration-200 ease-out"
        style={
          bubblePos?.top !== undefined && bubblePos?.left !== undefined
            ? { top: `${bubblePos.top}px`, left: `${bubblePos.left}px` }
            : { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
        }
      >
        <div className="relative bg-white text-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
          {/* Triangular Pointer Arrow */}
          {bubblePos?.arrowSide === 'top' && (
            <div className="absolute -top-2.5 left-8 w-5 h-5 bg-white rotate-45 border-t border-l border-slate-100 shadow-xs" />
          )}
          {bubblePos?.arrowSide === 'bottom' && (
            <div className="absolute -bottom-2.5 left-8 w-5 h-5 bg-white rotate-45 border-b border-r border-slate-100 shadow-xs" />
          )}

          {/* Header with Title & Close (X) */}
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-snug">
              {currentStep.title}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-0.5 rounded-md hover:bg-slate-100 transition-colors -mr-1 -mt-1"
              title="Close tour"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-600 leading-relaxed mt-3 mb-6 font-normal">
            {currentStep.description}
          </p>

          {/* Footer: Back + Dots & Fraction + Next */}
          <div className="flex items-center justify-between gap-3 pt-2">
            {/* Back Button */}
            <button
              type="button"
              disabled={isFirstStep}
              onClick={handlePrev}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
                isFirstStep
                  ? 'opacity-40 cursor-not-allowed border-slate-200 text-slate-400 bg-white'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50 active:bg-slate-100 bg-white'
              }`}
            >
              Back
            </button>

            {/* Step Dots & Fraction Indicator */}
            <div className="flex flex-col items-center justify-center gap-1.5">
              <div className="flex items-center gap-1.5">
                {TOUR_STEPS.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentStepIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      currentStepIndex === idx
                        ? 'bg-indigo-600 scale-125'
                        : 'bg-slate-300 hover:bg-slate-400'
                    }`}
                    title={`Step ${idx + 1}`}
                  />
                ))}
              </div>
              <span className="text-[11px] font-medium text-slate-400 tracking-wider">
                {currentStepIndex + 1}/{TOUR_STEPS.length}
              </span>
            </div>

            {/* Next / Finish Button */}
            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-1.5 text-sm font-medium rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 active:bg-slate-100 bg-white transition-colors"
            >
              {isLastStep ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
