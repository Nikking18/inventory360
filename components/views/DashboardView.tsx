'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '../../context/I18nContext';
import { Product, Sale, PurchaseOrder, Location, Customer, BusinessSettings } from '../../lib/types';
import { formatCurrency } from '../../lib/utils';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
  ChartOptions,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import {
  TrendingUp,
  AlertTriangle,
  Package,
  ArrowRight,
  Truck,
  Boxes,
  BarChart3,
  LineChart as LineChartIcon,
  Users,
  FileText,
  CreditCard,
  Printer,
  ShoppingBag,
  Clock,
  CheckCircle2,
  DollarSign,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  Store,
  Globe,
  Tag,
  Building2,
  ShieldCheck,
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

interface DashboardViewProps {
  products: Product[];
  sales: Sale[];
  customers?: Customer[];
  purchaseOrders: PurchaseOrder[];
  locations: Location[];
  selectedLocation: string;
  onLocationChange: (locId: string) => void;
  onNavigate: (tab: any, subTab?: string) => void;
  currencySymbol: string;
  settings?: BusinessSettings;
  onPrintReceipt?: (sale: Sale) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  products,
  sales,
  customers = [],
  purchaseOrders,
  locations,
  selectedLocation,
  onLocationChange,
  onNavigate,
  currencySymbol,
  settings,
  onPrintReceipt,
}) => {
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month'>('month');
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { t } = useTranslation();

  // Filter sales & products by location
  const activeLocationSales = useMemo(() => {
    return (selectedLocation === 'all'
      ? sales
      : sales.filter((s) => s.locationId === selectedLocation)
    ).filter((s) => s.status !== 'Refunded');
  }, [sales, selectedLocation]);

  const filteredProducts = useMemo(() => {
    return selectedLocation === 'all'
      ? products
      : products.filter((p) => (p.locationQuantities?.[selectedLocation] ?? 0) > 0 || p.stockQuantity > 0);
  }, [products, selectedLocation]);

  // Timeframe-specific sales filtering for metrics
  const now = useMemo(() => new Date(), []);

  const timeframeSales = useMemo(() => {
    return activeLocationSales.filter((s) => {
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
  }, [activeLocationSales, timeframe, now]);

  // High-level Calculations
  const totalRevenue = useMemo(() => {
    return timeframeSales.reduce((acc, s) => acc + s.total, 0);
  }, [timeframeSales]);

  const totalOrders = timeframeSales.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const totalInventoryValue = useMemo(() => {
    return filteredProducts.reduce((acc, p) => acc + p.stockQuantity * p.costPrice, 0);
  }, [filteredProducts]);

  const totalRetailValuation = useMemo(() => {
    return filteredProducts.reduce((acc, p) => acc + p.stockQuantity * p.retailPrice, 0);
  }, [filteredProducts]);

  // Stock health counts
  const healthyCount = filteredProducts.filter((p) => p.status === 'Healthy').length;
  const lowStockCount = filteredProducts.filter((p) => p.status === 'Low Stock').length;
  const outOfStockCount = filteredProducts.filter((p) => p.status === 'Out of Stock').length;
  const deadStockCount = filteredProducts.filter((p) => p.status === 'Dead Stock').length;

  const pendingPOs = purchaseOrders.filter((po) => po.status === 'Sent' || po.status === 'Partial');

  // 1. RECENT BUYERS (Grouped/Derived from Sales & Customers)
  const recentBuyers = useMemo(() => {
    const buyersMap = new Map<string, {
      name: string;
      email?: string;
      phone?: string;
      lastPurchaseDate: string;
      totalSpent: number;
      ordersCount: number;
      latestItemName: string;
      status: string;
      channel: string;
    }>();

    // Sort active sales descending
    const sortedSales = [...activeLocationSales].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    sortedSales.forEach((sale) => {
      const buyerName = sale.customerName || 'Walk-in Customer';
      const existing = buyersMap.get(buyerName);
      const matchedCustomer = customers.find((c) => c.name.toLowerCase() === buyerName.toLowerCase());

      const latestItem = sale.items?.[0]?.productName || 'Assorted Items';

      if (!existing) {
        buyersMap.set(buyerName, {
          name: buyerName,
          email: matchedCustomer?.email,
          phone: matchedCustomer?.phone,
          lastPurchaseDate: sale.createdAt,
          totalSpent: sale.total,
          ordersCount: 1,
          latestItemName: latestItem,
          status: matchedCustomer?.status || (sale.total > 500 ? 'VIP' : 'Active'),
          channel: sale.channel || 'In-Store POS',
        });
      } else {
        existing.totalSpent += sale.total;
        existing.ordersCount += 1;
      }
    });

    return Array.from(buyersMap.values()).slice(0, 5);
  }, [activeLocationSales, customers]);

  // 2. RECENT INVOICES
  const recentInvoices = useMemo(() => {
    return [...activeLocationSales]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [activeLocationSales]);

  // 3. RECENT TRANSACTIONS (Financial Ledger Stream)
  const recentTransactions = useMemo(() => {
    return [...activeLocationSales]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6);
  }, [activeLocationSales]);

  // Chart.js dynamic data computation based on timeframe AND location
  const chartData = useMemo(() => {
    if (timeframe === 'today') {
      const slots = [
        { label: '08:00', startHour: 6, endHour: 9 },
        { label: '10:00', startHour: 9, endHour: 11 },
        { label: '12:00', startHour: 11, endHour: 13 },
        { label: '14:00', startHour: 13, endHour: 15 },
        { label: '16:00', startHour: 15, endHour: 17 },
        { label: '18:00', startHour: 17, endHour: 19 },
        { label: '20:00', startHour: 19, endHour: 21 },
        { label: '22:00', startHour: 21, endHour: 24 },
      ];

      const labels = slots.map((s) => s.label);
      const revenues = slots.map((slot) => {
        const slotSales = timeframeSales.filter((s) => {
          const d = new Date(s.createdAt);
          const hour = d.getHours();
          return hour >= slot.startHour && hour < slot.endHour;
        });
        return Math.round(slotSales.reduce((acc, s) => acc + s.total, 0) * 100) / 100;
      });

      return {
        labels,
        datasets: [
          {
            label: 'Sales Revenue',
            data: revenues,
            borderColor: '#0F172A',
            backgroundColor: 'rgba(15, 23, 42, 0.08)',
            borderWidth: 2,
            pointBackgroundColor: '#0F172A',
            pointBorderColor: '#FFFFFF',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.35,
            fill: true,
          },
        ],
      };
    } else if (timeframe === 'week') {
      const labels: string[] = [];
      const revenues: number[] = [];

      for (let i = 6; i >= 0; i--) {
        const targetDate = new Date(now.getTime() - i * 86400000);
        const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'short' });
        labels.push(`${dayName}`);

        const daySales = activeLocationSales.filter((s) => {
          const d = new Date(s.createdAt);
          return d.toDateString() === targetDate.toDateString();
        });

        revenues.push(Math.round(daySales.reduce((acc, s) => acc + s.total, 0) * 100) / 100);
      }

      return {
        labels,
        datasets: [
          {
            label: 'Sales Revenue',
            data: revenues,
            borderColor: '#0F172A',
            backgroundColor: 'rgba(15, 23, 42, 0.08)',
            borderWidth: 2,
            pointBackgroundColor: '#0F172A',
            pointBorderColor: '#FFFFFF',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.35,
            fill: true,
          },
        ],
      };
    } else {
      // Month timeframe
      const buckets = [
        { label: 'Day 22-30', minDays: 22, maxDays: 30 },
        { label: 'Day 15-21', minDays: 15, maxDays: 21 },
        { label: 'Day 8-14', minDays: 8, maxDays: 14 },
        { label: 'Day 1-7', minDays: 1, maxDays: 7 },
        { label: 'Today', minDays: 0, maxDays: 0 },
      ];

      const labels = buckets.map((b) => b.label);
      const revenues = buckets.map((b) => {
        const bucketSales = activeLocationSales.filter((s) => {
          const diffDays = Math.floor((now.getTime() - new Date(s.createdAt).getTime()) / 86400000);
          return diffDays >= b.minDays && diffDays <= b.maxDays;
        });
        return Math.round(bucketSales.reduce((acc, s) => acc + s.total, 0) * 100) / 100;
      });

      return {
        labels,
        datasets: [
          {
            label: 'Sales Revenue',
            data: revenues,
            borderColor: '#0F172A',
            backgroundColor: 'rgba(15, 23, 42, 0.08)',
            borderWidth: 2,
            pointBackgroundColor: '#0F172A',
            pointBorderColor: '#FFFFFF',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.35,
            fill: true,
          },
        ],
      };
    }
  }, [timeframe, activeLocationSales, timeframeSales, now]);

  const chartOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index' as const,
        intersect: false,
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: '#0F172A',
          titleColor: '#FFFFFF',
          bodyColor: '#94A3B8',
          titleFont: {
            family: 'monospace',
            size: 11,
            weight: 'bold' as const,
          },
          bodyFont: {
            family: 'monospace',
            size: 11,
          },
          padding: 10,
          cornerRadius: 0,
          borderColor: '#334155',
          borderWidth: 1,
          displayColors: false,
          callbacks: {
            label: function (context: any) {
              return ` Revenue: ${currencySymbol}${Number(context.raw).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            color: '#64748B',
            font: {
              family: 'monospace',
              size: 10,
            },
          },
          border: {
            display: false,
          },
        },
        y: {
          grid: {
            color: '#F1F5F9',
          },
          ticks: {
            color: '#64748B',
            font: {
              family: 'monospace',
              size: 10,
            },
            callback: function (val: any) {
              return `${currencySymbol}${val}`;
            },
          },
          border: {
            display: false,
          },
        },
      },
    };
  }, [currencySymbol]);

  return (
    <div className="space-y-8 text-slate-900 font-mono">
      {/* Page Title & Timeframe Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {settings?.logoUrl && (
            <div className="w-12 h-12 bg-white border border-slate-300 p-1 flex items-center justify-center shadow-2xs shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-2 h-2 bg-slate-900" />
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-[0.2em]">
                {settings?.businessName ? settings.businessName.toUpperCase() : t('system_overview', 'Executive Dashboard')}
              </span>
              {settings?.taxNumber && (
                <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 border border-slate-300">
                  GSTIN / TAX: {settings.taxNumber}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-heading tracking-tight">
              {t('dashboard', 'Store Operations Overview')}
            </h1>
            <p className="text-xs text-slate-600 mt-0.5 font-mono">
              {t('welcome', 'Real-time telemetry across revenue, buyers, billing invoices, and financial transactions.')}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto font-mono text-xs">
          {/* Chart Type Toggle */}
          <div className="bg-white border border-slate-300 p-0.5 flex items-center shadow-2xs">
            <button
              onClick={() => setChartType('line')}
              title="Area Line Chart"
              className={`p-1.5 transition-colors ${
                chartType === 'line' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LineChartIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setChartType('bar')}
              title="Bar Chart"
              className={`p-1.5 transition-colors ${
                chartType === 'bar' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Timeframe selector pills */}
          <div className="bg-white border border-slate-300 p-1 flex items-center shadow-2xs">
            {(['today', 'week', 'month'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 text-xs font-mono uppercase tracking-wider transition-all ${
                  timeframe === tf
                    ? 'bg-slate-900 text-white font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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
            className="text-xs bg-white border border-slate-300 px-3 py-2 font-mono text-slate-900 focus:outline-none focus:border-slate-900 shadow-2xs cursor-pointer"
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

      {/* 1. PRIMARY METRIC & CHART.JS OVERVIEW CARD */}
      <div id="tour-dashboard-metrics" className="bg-white border border-slate-200 p-6 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: Primary Revenue Metric */}
          <div className="lg:col-span-3 space-y-2 border-b lg:border-b-0 lg:border-r border-slate-200 pb-4 lg:pb-0 lg:pr-6">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-[0.2em]">
                {t('today_revenue', 'Sales Revenue')} ({timeframe})
              </span>
              <span className="text-[9px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 uppercase border border-slate-200">
                {selectedLocation === 'all' ? 'All Outlets' : locations.find((l) => l.id === selectedLocation)?.name || 'Outlet'}
              </span>
            </div>
            <p className="text-3xl sm:text-4xl font-mono font-bold text-slate-900 tracking-tight">
              {formatCurrency(totalRevenue, currencySymbol)}
            </p>
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-700">
              <TrendingUp className="w-4 h-4" />
              <span>
                {totalOrders > 0
                  ? `${totalOrders} ${t('total_orders', 'orders recorded')}`
                  : t('no_sales', 'Ready for sales transactions')}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">{t('recent_transactions', 'Verified POS & Online receipts.')}</p>
          </div>

          {/* Center Column: Interactive Chart.js View */}
          <div className="lg:col-span-6 h-48 w-full relative">
            {isMounted ? (
              chartType === 'line' ? (
                <Line data={chartData} options={chartOptions as any} />
              ) : (
                <Bar data={chartData} options={chartOptions as any} />
              )
            ) : (
              <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center text-xs text-slate-400">
                Loading Chart...
              </div>
            )}
          </div>

          {/* Right Column: Key Stacked Metrics */}
          <div className="lg:col-span-3 space-y-4 border-t lg:border-t-0 lg:border-l border-slate-200 pt-4 lg:pt-0 lg:pl-6 font-mono">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                {t('total_sales', 'Completed Orders')}
              </span>
              <p className="text-xl font-bold text-slate-900">{totalOrders} {t('total_orders', 'orders')}</p>
            </div>
            <div className="border-t border-slate-200 pt-3 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                {t('profit_margin', 'Avg Order Value')}
              </span>
              <p className="text-xl font-bold text-slate-900">
                {formatCurrency(avgOrderValue, currencySymbol)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. RECENT BUYERS & RECENT INVOICES (2-COLUMN GRID) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono">
        {/* A. RECENT BUYERS */}
        <div className="bg-white border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900">
                  Recent Buyers
                </h3>
              </div>
              <button
                onClick={() => onNavigate('customers')}
                className="text-[11px] font-bold uppercase text-slate-600 hover:text-slate-900 flex items-center gap-1 hover:underline"
              >
                <span>View CRM</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {recentBuyers.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 italic">
                No customer purchase records available for this outlet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentBuyers.map((buyer, idx) => (
                  <div
                    key={idx}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/70 px-2 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                        {buyer.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-xs text-slate-900 truncate">{buyer.name}</p>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 uppercase border ${
                              buyer.status === 'VIP'
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {buyer.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">
                          Latest: <span className="text-slate-700 font-medium">{buyer.latestItemName}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-bold text-xs text-slate-900">
                        {formatCurrency(buyer.totalSpent, currencySymbol)}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {buyer.ordersCount} {buyer.ordersCount === 1 ? 'order' : 'orders'} • {buyer.channel}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Tracking active buyer history</span>
            <button
              onClick={() => onNavigate('customers')}
              className="font-bold text-slate-900 hover:text-emerald-700 uppercase"
            >
              Add New Customer →
            </button>
          </div>
        </div>

        {/* B. RECENT INVOICES */}
        <div className="bg-white border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-600" />
                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900">
                  Recent Invoices
                </h3>
              </div>
              <button
                onClick={() => onNavigate('sell', 'sales-history')}
                className="text-[11px] font-bold uppercase text-slate-600 hover:text-slate-900 flex items-center gap-1 hover:underline"
              >
                <span>Sales Ledger</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {recentInvoices.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 italic">
                No invoices recorded yet for this location.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/70 px-2 transition-colors"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{inv.saleNumber}</span>
                        <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 uppercase border border-emerald-300">
                          {inv.status}
                        </span>
                        <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 border border-slate-200 hidden sm:inline">
                          {inv.paymentMethod}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 truncate">
                        {inv.customerName || 'Walk-in Customer'} •{' '}
                        <span className="text-slate-400">
                          {new Date(inv.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="font-bold text-xs text-slate-900">
                          {formatCurrency(inv.total, currencySymbol)}
                        </p>
                        <p className="text-[9px] text-slate-500">
                          {inv.items?.length || 1} item{inv.items?.length !== 1 ? 's' : ''}
                        </p>
                      </div>

                      {onPrintReceipt && (
                        <button
                          onClick={() => onPrintReceipt(inv)}
                          title="Print Thermal Receipt / Invoice"
                          className="p-1.5 bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-700 border border-slate-300 transition-colors shadow-2xs"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Instant ESC/POS &amp; Thermal Printing</span>
            <button
              onClick={() => onNavigate('sell', 'quick-sale')}
              className="font-bold text-slate-900 hover:text-sky-700 uppercase"
            >
              + Create New Sale
            </button>
          </div>
        </div>
      </div>

      {/* 3. RECENT TRANSACTIONS (LIVE FINANCIAL LEDGER STREAM) */}
      <div className="bg-white border border-slate-200 p-5 shadow-sm space-y-4 font-mono">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-slate-900" />
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900">
                Recent Transactions &amp; Financial Ledger
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Real-time stream of in-store sales, online marketplace syncs, and profit telemetry.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('reporting', 'sales-report')}
            className="text-[11px] font-bold uppercase text-slate-600 hover:text-slate-900 flex items-center gap-1 hover:underline"
          >
            <span>Full Audit Report</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 italic">
            No transaction records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] text-slate-500 uppercase bg-slate-50">
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Transaction ID</th>
                  <th className="py-2.5 px-3">Customer / Channel</th>
                  <th className="py-2.5 px-3">Outlet Location</th>
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3 text-right">Profit Margin</th>
                  <th className="py-2.5 px-3 text-right">Net Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentTransactions.map((tx) => {
                  const marginPercent = tx.total > 0 ? ((tx.grossProfit || 0) / tx.total) * 100 : 0;

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 text-slate-500 whitespace-nowrap text-[11px]">
                        {new Date(tx.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })},{' '}
                        {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900 whitespace-nowrap">
                        {tx.saleNumber}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 truncate max-w-[140px]">
                            {tx.customerName || 'Walk-in'}
                          </span>
                          <span className="text-[9px] text-slate-500 bg-slate-100 px-1 py-0.2 border border-slate-200">
                            {tx.channel || 'POS'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-600 text-[11px] whitespace-nowrap">
                        {tx.locationName || 'Downtown Flagship'}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 uppercase border border-slate-200">
                          {tx.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-emerald-700 font-bold whitespace-nowrap">
                        +{formatCurrency(tx.grossProfit || 0, currencySymbol)} ({marginPercent.toFixed(0)}%)
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900 whitespace-nowrap text-xs">
                        {formatCurrency(tx.total, currencySymbol)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. INVENTORY HEALTH & REORDER ALERTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono">
        {/* Left Side: Inventory Valuation Breakdown */}
        <div className="lg:col-span-8 bg-white border border-slate-200 p-6 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900">
                {t('inventory-report', 'Stock Health & Asset Valuation')}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{t('stock-levels', 'Real-time inventory valuation breakdown.')}</p>
            </div>
            <button
              onClick={() => onNavigate('inventory', 'stock-levels')}
              className="text-xs font-bold uppercase tracking-wider text-slate-900 hover:underline flex items-center gap-1"
            >
              <span>{t('view_all', 'View Stock')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3.5 bg-emerald-50/60 border border-emerald-200">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">{t('in_stock', 'Healthy')}</span>
              <p className="text-xl font-bold text-emerald-950 mt-1">{healthyCount}</p>
            </div>
            <div className="p-3.5 bg-amber-50/60 border border-amber-200">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest">{t('low_stock_badge', 'Low Stock')}</span>
              <p className="text-xl font-bold text-amber-950 mt-1">{lowStockCount}</p>
            </div>
            <div className="p-3.5 bg-rose-50/60 border border-rose-200">
              <span className="text-[10px] font-bold text-rose-800 uppercase tracking-widest">{t('out_of_stock', 'Out of Stock')}</span>
              <p className="text-xl font-bold text-rose-950 mt-1">{outOfStockCount}</p>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{t('dead-stock', 'Dead Stock')}</span>
              <p className="text-xl font-bold text-slate-900 mt-1">{deadStockCount}</p>
            </div>
          </div>

          {/* Valuation Summary */}
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  {t('cost_price', 'Cost Valuation')}
                </span>
                <p className="text-xl font-bold text-slate-900 mt-0.5">
                  {formatCurrency(totalInventoryValue, currencySymbol)}
                </p>
              </div>
              <Boxes className="w-5 h-5 text-slate-400" />
            </div>

            <div className="p-4 border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  {t('retail_price', 'Retail Valuation')}
                </span>
                <p className="text-xl font-bold text-slate-900 mt-0.5">
                  {formatCurrency(totalRetailValuation, currencySymbol)}
                </p>
              </div>
              <Package className="w-5 h-5 text-slate-700" />
            </div>
          </div>
        </div>

        {/* Right Side: Reorder Alerts & Purchase Orders */}
        <div className="lg:col-span-4 space-y-6">
          {/* Urgent Stock Reorder Alerts Card */}
          <div className="bg-white border border-slate-200 p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                  {t('low_stock_alerts', 'Low Stock Reorder')}
                </h4>
              </div>
              <button
                onClick={() => onNavigate('inventory', 'low-stock')}
                className="text-[11px] font-bold uppercase text-slate-600 hover:text-slate-900 underline"
              >
                {t('view_all', 'View All')}
              </button>
            </div>

            {filteredProducts.filter((p) => p.status === 'Low Stock' || p.status === 'Out of Stock')
              .length === 0 ? (
              <p className="text-xs text-slate-500 italic">{t('in_stock', 'All product stock levels healthy.')}</p>
            ) : (
              <div className="space-y-2">
                {filteredProducts
                  .filter((p) => p.status === 'Low Stock' || p.status === 'Out of Stock')
                  .slice(0, 3)
                  .map((p) => (
                    <div
                      key={p.id}
                      className="p-2.5 bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        {p.imageUrl && (
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-8 h-8 rounded-none object-cover border border-slate-200"
                          />
                        )}
                        <div>
                          <p className="font-bold text-slate-900 truncate max-w-[130px]">{p.name}</p>
                          <p className="text-[10px] text-slate-500">SKU: {p.sku}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-amber-700">{p.stockQuantity} {t('stock', 'left')}</p>
                        <p className="text-[9px] text-slate-500">Min: {p.reorderPoint}</p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Pending Purchase Orders Card */}
          <div className="bg-white border border-slate-200 p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-slate-900" />
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                  {t('purchases', 'Pending POs')}
                </h4>
              </div>
              <button
                onClick={() => onNavigate('inventory', 'purchases')}
                className="text-[11px] font-bold uppercase text-slate-600 hover:text-slate-900 underline"
              >
                {t('view_all', 'View POs')}
              </button>
            </div>

            {pendingPOs.length === 0 ? (
              <p className="text-xs text-slate-500 italic">{t('no_sales', 'No pending purchase orders.')}</p>
            ) : (
              <div className="space-y-2">
                {pendingPOs.map((po) => (
                  <div
                    key={po.id}
                    className="p-3 bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-900">{po.poNumber}</p>
                      <p className="text-[10px] text-slate-500">{po.supplierName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">
                        {formatCurrency(po.total, currencySymbol)}
                      </p>
                      <span className="text-[9px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 border border-amber-200 uppercase">
                        {po.status}
                      </span>
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
