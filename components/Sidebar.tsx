'use client';

import React from 'react';
import { useTranslation } from '../context/I18nContext';
import {
  LayoutDashboard,
  ShoppingBag,
  BarChart3,
  Package,
  Boxes,
  Users,
  Settings,
  Layers,
  Sparkles,
  ArrowUpRight,
  ChevronRight,
} from 'lucide-react';

export type NavItemKey = 'home' | 'sell' | 'reporting' | 'catalog' | 'inventory' | 'customers' | 'setup';

interface SidebarProps {
  activeTab: NavItemKey;
  onTabChange: (tab: NavItemKey) => void;
  activeSubTab?: string;
  onSubTabChange?: (subTab: string) => void;
  businessName: string;
  ownerName: string;
  onOpenLanding?: () => void;
  onOpenDemoModal?: () => void;
  onOpenTour?: () => void;
}

export const NAV_ITEMS: { key: NavItemKey; label: string; icon: React.ElementType; subTabs?: { id: string; label: string }[] }[] = [
  { key: 'home', label: 'Home', icon: LayoutDashboard },
  { key: 'sell', label: 'Sell', icon: ShoppingBag, subTabs: [
    { id: 'quick-sale', label: 'Quick Sale POS' },
    { id: 'sales-history', label: 'Sales History' },
    { id: 'returns', label: 'Returns & Refunds' },
  ]},
  { key: 'reporting', label: 'Reporting', icon: BarChart3, subTabs: [
    { id: 'retail-dashboard', label: 'Retail Dashboard' },
    { id: 'sales-report', label: 'Sales Report' },
    { id: 'inventory-report', label: 'Inventory Report' },
    { id: 'purchase-report', label: 'Purchase Report' },
    { id: 'profit-report', label: 'Profitability Report' },
    { id: 'tax-report', label: 'Tax Report' },
  ]},
  { key: 'catalog', label: 'Catalog', icon: Package, subTabs: [
    { id: 'products', label: 'All Products' },
    { id: 'categories', label: 'Categories' },
    { id: 'suppliers', label: 'Suppliers' },
  ]},
  { key: 'inventory', label: 'Inventory', icon: Boxes, subTabs: [
    { id: 'stock-levels', label: 'Stock Levels' },
    { id: 'low-stock', label: 'Low Stock Alerts' },
    { id: 'dead-stock', label: 'Dead Stock' },
    { id: 'movements', label: 'Stock Movements' },
    { id: 'transfers', label: 'Stock Transfers' },
    { id: 'purchases', label: 'Purchase Orders' },
    { id: 'audits', label: 'Stock Audit / Count' },
  ]},
  { key: 'customers', label: 'Customers', icon: Users },
  { key: 'setup', label: 'Setup', icon: Settings, subTabs: [
    { id: 'profile', label: 'Business Profile' },
    { id: 'locations', label: 'Store Locations' },
    { id: 'data', label: 'Data & Backup' },
  ]},
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  activeSubTab,
  onSubTabChange,
  businessName,
  ownerName,
  onOpenLanding,
  onOpenTour,
}) => {
  const { t } = useTranslation();

  return (
    <aside className="w-full md:w-64 bg-neutral-950 text-neutral-100 flex flex-col h-full md:h-screen md:sticky md:top-0 shrink-0 border-r border-neutral-800 z-30 select-none">
      {/* Top Brand Area */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 border-2 border-white flex items-center justify-center rotate-45 shrink-0">
            <div className="w-3 h-3 bg-white -rotate-45" />
          </div>
          <span className="font-heading font-extrabold text-xs uppercase tracking-[0.25em] text-white">
            INVENTORY<span className="text-neutral-500">360</span>
          </span>
        </div>
        <button
          onClick={onOpenLanding}
          className="text-neutral-500 hover:text-white p-1 transition-colors"
          title={t('app_info')}
        >
          <Layers className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Stack */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;
          const hasSubTabs = item.subTabs && item.subTabs.length > 0;
          const translatedLabel = t(item.key) !== item.key ? t(item.key) : item.label;

          return (
            <div key={item.key} className="space-y-1">
              <button
                onClick={() => {
                  onTabChange(item.key);
                  if (hasSubTabs && item.subTabs && onSubTabChange) {
                    onSubTabChange(item.subTabs[0].id);
                  }
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-none text-xs font-mono tracking-wider uppercase transition-all group ${
                  isActive
                    ? 'bg-neutral-900 text-white border-l-2 border-white font-bold'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-white' : 'text-neutral-500 group-hover:text-neutral-300'
                    }`}
                    strokeWidth={isActive ? 2 : 1.5}
                  />
                  <span>{translatedLabel}</span>
                </div>
                {isActive && (
                  <div className="w-1.5 h-1.5 bg-white" />
                )}
              </button>

              {/* Collapsible Sub-Items if Active */}
              {isActive && hasSubTabs && (
                <div className="ml-5 pl-3 border-l border-neutral-800 space-y-0.5 py-1">
                  {item.subTabs?.map((sub) => {
                    const isSubActive = activeSubTab === sub.id;
                    const translatedSubLabel = t(sub.id) !== sub.id ? t(sub.id) : sub.label;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => onSubTabChange && onSubTabChange(sub.id)}
                        className={`w-full text-left px-2.5 py-1.5 text-[11px] font-mono transition-colors ${
                          isSubActive
                            ? 'text-white font-semibold bg-neutral-900'
                            : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900/40'
                        }`}
                      >
                        {translatedSubLabel}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Quick Demo Mode & Product Tour Badge */}
      <div className="p-3 mx-3 my-2 bg-neutral-900 border border-neutral-800 space-y-2 text-[10px] font-mono">
        <button
          onClick={onOpenTour}
          className="w-full py-1.5 px-2 bg-white text-black font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-neutral-200 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive Tour</span>
        </button>
        <div className="flex items-center justify-between pt-1 border-t border-neutral-800">
          <div className="flex items-center gap-1.5 text-neutral-400">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
            <span className="uppercase tracking-wider">{t('demo_mode')}</span>
          </div>
          <button
            onClick={onOpenLanding}
            className="text-white hover:underline flex items-center gap-0.5 uppercase tracking-wider font-bold"
          >
            <span>Overview</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Bottom Business Owner Area */}
      <div className="p-4 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-7 h-7 bg-white text-black font-mono font-bold text-xs flex items-center justify-center shrink-0">
            {ownerName ? ownerName.charAt(0) : 'B'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-mono font-semibold text-white truncate leading-tight uppercase tracking-wide">
              {businessName || 'ACME Electronics'}
            </p>
            <p className="text-[10px] text-neutral-500 font-mono truncate leading-tight mt-0.5 uppercase">
              {ownerName || 'Business Owner'}
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-neutral-600" />
      </div>
    </aside>
  );
};
