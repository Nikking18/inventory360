'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '../context/I18nContext';
import { LANGUAGES } from '../lib/i18n';
import { AutoSaveConfig } from '../lib/types';
import { formatDateTime } from '../lib/utils';
import {
  LayoutDashboard,
  ShoppingBag,
  BarChart3,
  Package,
  Boxes,
  Users,
  Settings,
  Sparkles,
  ShieldCheck,
  ArrowUpRight,
  ChevronRight,
  Globe,
  Home,
  BookOpen,
  HardDrive,
} from 'lucide-react';

export type NavItemKey =
  | 'home'
  | 'sell'
  | 'fulfillment'
  | 'reporting'
  | 'catalog'
  | 'inventory'
  | 'customers'
  | 'setup'
  | 'blog';

interface SidebarProps {
  activeTab: NavItemKey;
  onTabChange: (tab: NavItemKey) => void;
  activeSubTab?: string;
  onSubTabChange?: (subTab: string) => void;
  businessName: string;
  ownerName: string;
  currencyCode?: string;
  onCurrencyChange?: (code: string) => void;
  language?: string;
  onLanguageChange?: (lang: string) => void;
  onOpenLanding?: () => void;
  onOpenDemoModal?: () => void;
  onOpenTour?: () => void;
  onOpenDataPolicy?: () => void;
  autoSaveConfig?: AutoSaveConfig;
}

export const NAV_ITEMS: {
  key: NavItemKey;
  label: string;
  icon: React.ElementType;
  subTabs?: { id: string; label: string }[];
}[] = [
  { key: 'home', label: 'Dashboard', icon: LayoutDashboard },
  {
    key: 'sell',
    label: 'Sell (POS)',
    icon: ShoppingBag,
    subTabs: [
      { id: 'quick-sale', label: 'Quick Sale POS' },
      { id: 'sales-history', label: 'Sales History' },
      { id: 'returns', label: 'Returns & Refunds' },
    ],
  },
  {
    key: 'fulfillment',
    label: 'Channels & Orders',
    icon: Globe,
    subTabs: [
      { id: 'all-orders', label: 'All Fulfillment Orders' },
      { id: 'pending-dispatch', label: 'Pending Dispatch' },
      { id: 'shipped-orders', label: 'Shipped & Tracking' },
    ],
  },
  {
    key: 'reporting',
    label: 'Reporting',
    icon: BarChart3,
    subTabs: [
      { id: 'retail-dashboard', label: 'Retail Dashboard' },
      { id: 'sales-report', label: 'Sales Report' },
      { id: 'inventory-report', label: 'Inventory Report' },
      { id: 'purchase-report', label: 'Purchase Report' },
      { id: 'turnover-velocity', label: 'Turnover & Sales Velocity' },
      { id: 'profit-report', label: 'Profitability Report' },
      { id: 'tax-report', label: 'Tax Report' },
    ],
  },
  {
    key: 'catalog',
    label: 'Catalog',
    icon: Package,
    subTabs: [
      { id: 'products', label: 'Master Catalog & Variants' },
      { id: 'categories', label: 'Categories' },
      { id: 'suppliers', label: 'Suppliers' },
    ],
  },
  {
    key: 'inventory',
    label: 'Inventory',
    icon: Boxes,
    subTabs: [
      { id: 'stock-levels', label: 'Stock Levels' },
      { id: 'low-stock', label: 'Low Stock' },
      { id: 'lots-expiry', label: 'Lots & Expiry' },
      { id: 'multi-location', label: 'Multi-Outlet' },
      { id: 'movements', label: 'Movements' },
      { id: 'purchases', label: 'Purchase Orders' },
    ],
  },
  { key: 'customers', label: 'Customers', icon: Users },
  {
    key: 'setup',
    label: 'Setup',
    icon: Settings,
    subTabs: [
      { id: 'profile', label: 'Business Profile' },
      { id: 'locations', label: 'Store Locations' },
      { id: 'data', label: 'Data & Backup' },
    ],
  },
  {
    key: 'blog',
    label: 'Knowledge & Blog',
    icon: BookOpen,
    subTabs: [
      { id: 'all', label: 'All Articles' },
      { id: 'pos-tech', label: 'POS & Architecture' },
      { id: 'inventory-strategy', label: 'Inventory Strategy' },
      { id: 'omnichannel', label: 'Omnichannel' },
      { id: 'compliance', label: 'Operations & Compliance' },
      { id: 'hardware', label: 'Hardware & Guides' },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  activeSubTab,
  onSubTabChange,
  businessName,
  ownerName,
  currencyCode,
  onCurrencyChange,
  language,
  onLanguageChange,
  onOpenLanding,
  onOpenTour,
  onOpenDataPolicy,
  autoSaveConfig,
}) => {
  const { t } = useTranslation();

  return (
    <aside className="w-full md:w-64 bg-white text-slate-900 flex flex-col h-full md:h-screen md:sticky md:top-0 shrink-0 border-r border-slate-200 z-30 select-none shadow-xs">
      {/* Top Brand Area */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-slate-200 bg-white">
        <button
          onClick={onOpenLanding}
          className="flex items-center gap-3 text-left group"
          title="Return to Main Portal"
        >
          <div className="w-7 h-7 bg-slate-900 flex items-center justify-center rotate-45 shrink-0 group-hover:bg-black transition-colors">
            <div className="w-3 h-3 bg-white -rotate-45" />
          </div>
          <span className="font-heading font-extrabold text-xs uppercase tracking-[0.25em] text-slate-900">
            INVENTORY<span className="text-emerald-600">360</span>
          </span>
        </button>
        {onOpenLanding && (
          <button
            onClick={onOpenLanding}
            className="text-slate-400 hover:text-slate-900 p-1.5 hover:bg-slate-100 transition-colors"
            title="Main Webapp Portal"
          >
            <Home className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation Stack */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
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
                    ? 'bg-slate-900 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-800'
                    }`}
                    strokeWidth={isActive ? 2 : 1.75}
                  />
                  <span>{translatedLabel}</span>
                </div>
                {isActive && <div className="w-1.5 h-1.5 bg-emerald-400" />}
              </button>

              {/* Collapsible Sub-Items if Active */}
              {isActive && hasSubTabs && (
                <div className="ml-5 pl-3 border-l border-slate-200 space-y-0.5 py-1">
                  {item.subTabs?.map((sub) => {
                    const isSubActive = activeSubTab === sub.id;
                    const translatedSubLabel = t(sub.id) !== sub.id ? t(sub.id) : sub.label;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => onSubTabChange && onSubTabChange(sub.id)}
                        className={`w-full text-left px-2.5 py-1.5 text-[11px] font-mono transition-colors ${
                          isSubActive
                            ? 'text-slate-900 font-bold bg-slate-100 border-l-2 border-slate-900 -ml-3 pl-3'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
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

      {/* Auto-Save Live Status Indicator */}
      <div className="p-3 mx-3 my-1 bg-slate-50 border border-slate-200 text-[10px] font-mono">
        <button
          type="button"
          onClick={() => {
            onTabChange('setup');
            if (onSubTabChange) onSubTabChange('data');
          }}
          className="w-full text-left group"
          title="Click to manage automated backups"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  autoSaveConfig?.enabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                }`}
              />
              <span className="font-bold uppercase tracking-wider text-slate-800 text-[10px]">
                {autoSaveConfig?.enabled ? 'Auto-Save Active' : 'Auto-Save Off'}
              </span>
            </div>
            <span className="text-[9px] font-bold text-slate-500 group-hover:text-emerald-700 uppercase">
              Manage &rarr;
            </span>
          </div>

          {autoSaveConfig?.enabled && (
            <div className="mt-1 flex items-center justify-between text-slate-500 text-[9px] pt-1 border-t border-slate-200">
              <span className="truncate max-w-[110px]" title={autoSaveConfig.folderName || 'Selected Folder'}>
                {autoSaveConfig.folderName || 'Selected Folder'}
              </span>
              <span className="font-semibold text-slate-700 shrink-0">
                {autoSaveConfig.interval || '24h'}
              </span>
            </div>
          )}
        </button>
      </div>

      {/* Data Policy Notice & Product Tour Actions */}
      <div className="p-3 mx-3 my-1 bg-slate-50 border border-slate-200 space-y-2 text-[10px] font-mono">
        <Link
          href="/blog"
          className="w-full py-1.5 px-2 bg-white border border-slate-300 text-slate-800 hover:text-black font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 hover:border-slate-400 transition-colors shadow-2xs"
        >
          <BookOpen className="w-3.5 h-3.5 text-sky-600" />
          <span>Knowledge &amp; Blog</span>
        </Link>

        <button
          onClick={onOpenDataPolicy}
          className="w-full py-1.5 px-2 bg-white border border-slate-300 text-slate-800 hover:text-black font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 hover:border-slate-400 transition-colors shadow-2xs"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Data Policy &amp; Backup</span>
        </button>

        <button
          onClick={onOpenTour}
          className="w-full py-1.5 px-2 bg-slate-900 text-white font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-black transition-colors shadow-2xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Interactive Tour</span>
        </button>
        <div className="flex items-center justify-between pt-1 border-t border-slate-200">
          <div className="flex items-center gap-1.5 text-slate-500">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            <span className="uppercase tracking-wider font-semibold">{t('demo_mode', 'Ready')}</span>
          </div>
          {onOpenLanding && (
            <button
              onClick={onOpenLanding}
              className="text-slate-900 hover:underline flex items-center gap-0.5 uppercase tracking-wider font-bold"
            >
              <span>Main Portal</span>
              <ArrowUpRight className="w-3 h-3 text-slate-600" />
            </button>
          )}
        </div>
      </div>

      {/* Currency & Language Controls in Sidebar Footer */}
      <div className="px-3 py-2 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between gap-2 text-[10px] font-mono">
        <div className="flex items-center gap-1 bg-white border border-slate-300 px-2 py-1 shadow-2xs flex-1">
          <span className="font-bold text-slate-500">$</span>
          <select
            value={currencyCode || 'USD'}
            onChange={(e) => onCurrencyChange && onCurrencyChange(e.target.value)}
            className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer text-[10px] w-full"
            title="Change Global Currency"
          >
            <option value="USD">$ USD</option>
            <option value="EUR">€ EUR</option>
            <option value="GBP">£ GBP</option>
            <option value="CAD">C$ CAD</option>
            <option value="AUD">A$ AUD</option>
            <option value="JPY">¥ JPY</option>
            <option value="INR">₹ INR</option>
            <option value="BRL">R$ BRL</option>
            <option value="MXN">Mex$ MXN</option>
            <option value="AED">AED</option>
          </select>
        </div>

        <div className="flex items-center gap-1 bg-white border border-slate-300 px-2 py-1 shadow-2xs flex-1">
          <Globe className="w-3 h-3 text-slate-500 shrink-0" />
          <select
            value={language || 'en'}
            onChange={(e) => onLanguageChange && onLanguageChange(e.target.value)}
            className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer text-[10px] w-full"
            title="Change Language"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.flag} {l.code.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bottom Business Owner Area */}
      <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-7 h-7 bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
            {ownerName ? ownerName.charAt(0) : 'B'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-mono font-bold text-slate-900 truncate leading-tight uppercase tracking-wide">
              {businessName || 'ACME Retail & Tech'}
            </p>
            <p className="text-[10px] text-slate-500 font-mono truncate leading-tight mt-0.5 uppercase">
              {ownerName || 'Business Owner'}
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400" />
      </div>
    </aside>
  );
};
