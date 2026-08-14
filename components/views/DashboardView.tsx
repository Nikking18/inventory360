'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../context/I18nContext';
import { Product, Sale, PurchaseOrder, Location } from '../../lib/types';
import { formatCurrency } from '../../lib/utils';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  TrendingUp,
  AlertTriangle,
  Package,
  ArrowRight,
  Truck,
  Boxes,
} from 'lucide-react';

interface DashboardViewProps {
  products: Product[];
  sales: Sale[];
  purchaseOrders: PurchaseOrder[];
  locations: Location[];
  selectedLocation: string;
  onLocationChange: (locId: string) => void;
  onNavigate: (tab: any, subTab?: string) => void;
  currencySymbol: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  products,
  sales,
  purchaseOrders,
  locations,
  selectedLocation,
  onLocationChange,
  onNavigate,
  currencySymbol,
}) => {
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month'>('month');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { t } = useTranslation();

  // Filter sales & products by location
  const activeLocationSales = (selectedLocation === 'all'
    ? sales
    : sales.filter((s) => s.locationId === selectedLocation)
  ).filter((s) => s.status !== 'Refunded');

  const filteredProducts = selectedLocation === 'all'
    ? products
    : products.filter((p) => (p.locationQuantities?.[selectedLocation] ?? 0) > 0 || p.stockQuantity > 0);

  // Timeframe-specific sales filtering
  const now = new Date();
  const timeframeSales = activeLocationSales.filter((s) => {
    const saleDate = new Date(s.createdAt);
    if (isNaN(saleDate.getTime())) return true;
    if (timeframe === 'today') {
      return saleDate.toDateString() === now.toDateString();
    } else if (timeframe === 'week') {
      return saleDate >= new Date(now.getTime() - 7 * 86400000);
    } else if (timeframe === 'month') {
      return saleDate >= new Date(now.getTime() - 30 * 86400000);
    }
    return true;
  });

  // High-level Calculations
  const totalRevenue = timeframeSales.reduce((acc, s) => acc + s.total, 0);
  const totalOrders = timeframeSales.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const totalInventoryValue = filteredProducts.reduce((acc, p) => acc + p.stockQuantity * p.costPrice, 0);
  const totalRetailValuation = filteredProducts.reduce((acc, p) => acc + p.stockQuantity * p.retailPrice, 0);

  // Stock health counts
  const healthyCount = filteredProducts.filter((p) => p.status === 'Healthy').length;
  const lowStockCount = filteredProducts.filter((p) => p.status === 'Low Stock').length;
  const outOfStockCount = filteredProducts.filter((p) => p.status === 'Out of Stock').length;
  const deadStockCount = filteredProducts.filter((p) => p.status === 'Dead Stock').length;

  const pendingPOs = purchaseOrders.filter((po) => po.status === 'Sent' || po.status === 'Partial');

  // Generate dynamic chart data based on active sales
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const chartData = days.map((dayLabel, index) => {
    const salesForDay = activeLocationSales.filter((s) => {
      const d = new Date(s.createdAt).getDay();
      const dayIndex = index === 6 ? 0 : index + 1; // Sunday is 0
      return d === dayIndex;
    });
    const revenue = salesForDay.reduce((acc, s) => acc + s.total, 0);
    return { day: dayLabel, revenue, orders: salesForDay.length };
  });

  return (
    <div className="space-y-6 text-neutral-200">
      {/* Page Title & Timeframe Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-white" />
            <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-[0.2em]">
              {t('system_overview', 'Executive Dashboard')}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-heading tracking-tight">
            {t('dashboard', 'Store Operations Overview')}
          </h1>
          <p className="text-xs text-neutral-400 mt-1 font-mono">
            {t('welcome', 'Real-time stock telemetry, sales revenue, and supply flow.')}
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto font-mono text-xs">
          {/* Timeframe selector pills */}
          <div className="bg-neutral-900 border border-neutral-800 p-1 flex items-center">
            {(['today', 'week', 'month'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 text-xs font-mono uppercase tracking-wider transition-all ${
                  timeframe === tf
                    ? 'bg-white text-black font-bold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {tf === 'today' ? 'Today' : tf === 'week' ? 'Week' : 'Month'}
              </button>
            ))}
          </div>

          {/* Location Outlet Selector */}
          <select
            value={selectedLocation}
            onChange={(e) => onLocationChange(e.target.value)}
            className="text-xs bg-neutral-900 border border-neutral-800 px-3 py-2 font-mono text-white focus:outline-none focus:border-white"
          >
            <option value="all">{t('all_locations', 'All Outlets')}</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* PRIMARY DASHBOARD CARD */}
      <div id="tour-dashboard-metrics" className="bg-neutral-900 border border-neutral-800 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: Primary Metric */}
          <div className="lg:col-span-3 space-y-2 border-b lg:border-b-0 lg:border-r border-neutral-800 pb-4 lg:pb-0 lg:pr-6">
            <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-[0.2em]">
              {t('today_revenue', 'Sales Revenue')} ({timeframe})
            </span>
            <p className="text-3xl sm:text-4xl font-mono font-bold text-white tracking-tight">
              {formatCurrency(totalRevenue, currencySymbol)}
            </p>
            <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-400">
              <TrendingUp className="w-4 h-4" />
              <span>
                {totalOrders > 0
                  ? `${totalOrders} ${t('total_orders', 'orders recorded')}`
                  : t('no_sales', 'Ready for sales transactions')}
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 font-mono">{t('recent_transactions', 'Verified POS transactions.')}</p>
          </div>

          {/* Center Column: Clean Geometric Chart */}
          <div className="lg:col-span-6 h-44 w-full">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="whiteGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0F172A" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#0F172A" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748B', fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748B', fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderRadius: '0px', border: '1px solid #334155', color: '#fff', fontSize: '12px', fontFamily: 'monospace' }}
                    formatter={(val: any) => [`${currencySymbol}${val}`, t('today_revenue', 'Revenue')]}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#0F172A" strokeWidth={2} fill="url(#whiteGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full bg-neutral-950 animate-pulse" />
            )}
          </div>

          {/* Right Column: Two Stacked Key Metrics */}
          <div className="lg:col-span-3 space-y-4 border-t lg:border-t-0 lg:border-l border-neutral-800 pt-4 lg:pt-0 lg:pl-6 font-mono">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">
                {t('total_sales', 'Completed Orders')}
              </span>
              <p className="text-xl font-bold text-white">{totalOrders} {t('total_orders', 'orders')}</p>
            </div>
            <div className="border-t border-neutral-800 pt-3 space-y-1">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">
                {t('profit_margin', 'Avg Order Value')}
              </span>
              <p className="text-xl font-bold text-white">
                {formatCurrency(avgOrderValue, currencySymbol)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECONDARY GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Inventory Valuation & Stock Health Card */}
        <div className="lg:col-span-8 bg-neutral-900 border border-neutral-800 p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
            <div>
              <h3 className="font-mono font-bold text-sm uppercase tracking-wider text-white">
                {t('inventory-report', 'Stock Valuation & Health Breakdown')}
              </h3>
              <p className="text-xs text-neutral-400 font-mono mt-0.5">{t('stock-levels', 'Real-time inventory asset calculations.')}</p>
            </div>
            <button
              onClick={() => onNavigate('inventory', 'stock-levels')}
              className="text-xs font-mono uppercase tracking-wider text-white hover:underline flex items-center gap-1"
            >
              <span>{t('view_all', 'View Stock')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
            <div className="p-3.5 bg-neutral-950 border border-neutral-800">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">{t('in_stock', 'Healthy')}</span>
              <p className="text-xl font-bold text-white mt-1">{healthyCount}</p>
            </div>
            <div className="p-3.5 bg-neutral-950 border border-amber-900/60">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">{t('low_stock_badge', 'Low Stock')}</span>
              <p className="text-xl font-bold text-amber-300 mt-1">{lowStockCount}</p>
            </div>
            <div className="p-3.5 bg-neutral-950 border border-rose-900/60">
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">{t('out_of_stock', 'Out of Stock')}</span>
              <p className="text-xl font-bold text-rose-300 mt-1">{outOfStockCount}</p>
            </div>
            <div className="p-3.5 bg-neutral-950 border border-neutral-800">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{t('dead-stock', 'Dead Stock')}</span>
              <p className="text-xl font-bold text-neutral-300 mt-1">{deadStockCount}</p>
            </div>
          </div>

          {/* Total Asset Valuation Summary */}
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono">
            <div className="p-4 border border-neutral-800 bg-neutral-950 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                  {t('cost_price', 'Cost Valuation')}
                </span>
                <p className="text-xl font-bold text-white mt-0.5">
                  {formatCurrency(totalInventoryValue, currencySymbol)}
                </p>
              </div>
              <Boxes className="w-5 h-5 text-neutral-500" />
            </div>

            <div className="p-4 border border-neutral-800 bg-neutral-950 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                  {t('retail_price', 'Retail Valuation')}
                </span>
                <p className="text-xl font-bold text-white mt-0.5">
                  {formatCurrency(totalRetailValuation, currencySymbol)}
                </p>
              </div>
              <Package className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        {/* Right Side: Stacked Operational Cards */}
        <div className="lg:col-span-4 space-y-6">
          {/* Pending Purchase Orders Card */}
          <div className="bg-neutral-900 border border-neutral-800 p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-white" />
                <h4 className="font-mono font-bold text-xs uppercase tracking-wider text-white">
                  {t('purchases', 'Pending POs')}
                </h4>
              </div>
              <button
                onClick={() => onNavigate('inventory', 'purchases')}
                className="text-[11px] font-mono uppercase text-neutral-400 hover:text-white underline"
              >
                {t('view_all', 'View POs')}
              </button>
            </div>

            {pendingPOs.length === 0 ? (
              <p className="text-xs text-neutral-500 font-mono italic">{t('no_sales', 'No pending purchase orders.')}</p>
            ) : (
              <div className="space-y-2 font-mono">
                {pendingPOs.map((po) => (
                  <div
                    key={po.id}
                    className="p-3 bg-neutral-950 border border-neutral-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-white">{po.poNumber}</p>
                      <p className="text-[10px] text-neutral-400">{po.supplierName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-white">
                        {formatCurrency(po.total, currencySymbol)}
                      </p>
                      <span className="text-[9px] font-bold text-amber-400 bg-amber-950/60 px-1.5 py-0.5 border border-amber-900/60 uppercase">
                        {po.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Urgent Stock Reorder Alerts Card */}
          <div className="bg-neutral-900 border border-neutral-800 p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h4 className="font-mono font-bold text-xs uppercase tracking-wider text-white">
                  {t('low_stock_alerts', 'Low Stock Reorder')}
                </h4>
              </div>
              <button
                onClick={() => onNavigate('inventory', 'low-stock')}
                className="text-[11px] font-mono uppercase text-neutral-400 hover:text-white underline"
              >
                {t('view_all', 'View All')}
              </button>
            </div>

            {filteredProducts.filter((p) => p.status === 'Low Stock' || p.status === 'Out of Stock')
              .length === 0 ? (
              <p className="text-xs text-neutral-500 font-mono italic">{t('in_stock', 'All product stock levels healthy.')}</p>
            ) : (
              <div className="space-y-2 font-mono">
                {filteredProducts
                  .filter((p) => p.status === 'Low Stock' || p.status === 'Out of Stock')
                  .slice(0, 3)
                  .map((p) => (
                    <div
                      key={p.id}
                      className="p-2.5 bg-neutral-950 border border-neutral-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        {p.imageUrl && (
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-8 h-8 rounded-none object-cover border border-neutral-800"
                          />
                        )}
                        <div>
                          <p className="font-bold text-white truncate max-w-[130px]">{p.name}</p>
                          <p className="text-[10px] text-neutral-500">SKU: {p.sku}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-amber-400">{p.stockQuantity} {t('stock', 'left')}</p>
                        <p className="text-[9px] text-neutral-500">Min: {p.reorderPoint}</p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
