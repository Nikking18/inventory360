'use client';

import React, { useEffect, useRef } from 'react';
import { driver, Driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { NavItemKey } from '../Sidebar';

export interface TourStep {
  id: string;
  stepNumber: string;
  title: string;
  tabKey: NavItemKey;
  subTabKey?: string;
  badge: string;
  elementId: string;
  description: string;
  proTip: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    stepNumber: '01',
    title: 'Executive Dashboard & Metrics',
    tabKey: 'home',
    badge: 'Overview Hub',
    elementId: '#tour-dashboard-metrics',
    description: 'Track gross revenue, net profit, stock warning badges, and transaction logs in real time.',
    proTip: 'Use the location filter in the top bar to inspect individual store outlets.'
  },
  {
    id: 'pos',
    stepNumber: '02',
    title: 'Point of Sale (POS Terminal)',
    tabKey: 'sell',
    subTabKey: 'quick-sale',
    badge: 'Sales POS',
    elementId: '#tour-pos-terminal',
    description: 'Process fast transactions with SKU search, category tabs, cart limits, and thermal receipt printing.',
    proTip: 'Check Returns & Refunds under the Sell tab to view past transactions and process refunds.'
  },
  {
    id: 'catalog',
    stepNumber: '03',
    title: 'Product Catalog & Variants',
    tabKey: 'catalog',
    subTabKey: 'products',
    badge: 'Product Master',
    elementId: '#tour-catalog-table',
    description: 'Manage master products with strict SKU/Barcode collision checks, profit margins, and supplier links.',
    proTip: 'Set a realistic Reorder Point to receive automatic restocking alerts before stock runs out.'
  },
  {
    id: 'inventory',
    stepNumber: '04',
    title: 'Multi-Outlet Stock & Transfers',
    tabKey: 'inventory',
    subTabKey: 'low-stock',
    badge: 'Inventory Hub',
    elementId: '#tour-inventory-hub',
    description: 'Control multi-location stock levels, execute inter-outlet transfers, and customize purchase orders.',
    proTip: 'Click "Create PO" on any low-stock alert to set order quantity and target destination.'
  },
  {
    id: 'crm',
    stepNumber: '05',
    title: 'Customer Relationship CRM',
    tabKey: 'customers',
    badge: 'Customer CRM',
    elementId: '#tour-customer-crm',
    description: 'Track customer lifetime purchase revenue, total orders, outstanding balances, and purchase history.',
    proTip: 'Select customers at checkout to build individual lifetime value profiles.'
  },
  {
    id: 'reporting',
    stepNumber: '06',
    title: 'Financial Analytics & Reports',
    tabKey: 'reporting',
    badge: 'Executive Reports',
    elementId: '#tour-reporting-analytics',
    description: 'Gain financial insights with date-range filters ("Today", "Week", "Month", "Year") and 1-click exports.',
    proTip: 'Use the Export menu in the top header to download printable audit reports for your accountant.'
  },
  {
    id: 'setup',
    stepNumber: '07',
    title: 'Workspace Setup & Backups',
    tabKey: 'setup',
    subTabKey: 'general',
    badge: 'System Settings',
    elementId: '#tour-setup-workspace',
    description: 'Customize business profile, toggle dark/light theme, select currency/language, and backup IndexedDB data.',
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
  const driverRef = useRef<Driver | null>(null);

  // Driver.js Spotlight Tour Controller
  useEffect(() => {
    if (!isOpen) {
      if (driverRef.current) {
        driverRef.current.destroy();
        driverRef.current = null;
      }
      return;
    }

    // Sync background tab for initial step
    const initialStep = TOUR_STEPS[0];
    onNavigateTab(initialStep.tabKey, initialStep.subTabKey);

    const driverObj = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      overlayColor: 'rgba(0, 0, 0, 0.75)',
      stagePadding: 8,
      popoverClass: 'inventory360-driver-popover',
      steps: TOUR_STEPS.map((step) => ({
        element: step.elementId,
        popover: {
          title: `STEP ${step.stepNumber} OF 07: ${step.title.toUpperCase()}`,
          description: `${step.description} (Tip: ${step.proTip})`,
          side: 'bottom',
          align: 'center',
        },
      })),
      onHighlightStarted: (element, step, opts) => {
        const stepIdx = opts.driver.getActiveIndex();
        if (stepIdx !== undefined && stepIdx >= 0 && stepIdx < TOUR_STEPS.length) {
          const targetStep = TOUR_STEPS[stepIdx];
          onNavigateTab(targetStep.tabKey, targetStep.subTabKey);
        }
      },
      onDestroyStarted: () => {
        onClose();
      },
    });

    driverRef.current = driverObj;

    const timer = setTimeout(() => {
      driverObj.drive(0);
    }, 150);

    return () => {
      clearTimeout(timer);
      if (driverRef.current) {
        driverRef.current.destroy();
        driverRef.current = null;
      }
    };
  }, [isOpen]);

  return null;
};
