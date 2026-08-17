'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '../../context/I18nContext';
import { Product, Sale, PurchaseOrder, Location } from '../../lib/types';
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
      // Month timeframe: 5 chronological intervals
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

  const chartOptions: ChartOptions<'line' | 'bar'> = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
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
            weight: 'bold',
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
            label: function (context) {
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
            callback: function (val) {
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
    <div className="space-y-6 text-slate-900 font-mono">
      {/* Page Title & Timeframe Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-slate-900" />
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-[0.2em]">
              {t('system_overview', 'Executive Dashboard')}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-heading tracking-tight">
            {t('dashboard', 'Store Operations Overview')}
          </h1>
          <p className="text-xs text-slate-600 mt-1 font-mono">
            {t('welcome', 'Real-time stock telemetry, sales revenue, and supply flow.')}
          </p>
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

      {/* PRIMARY DASHBOARD CARD */}
      <div id="tour-dashboard-metrics" className="bg-white border border-slate-200 p-6 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: Primary Metric */}
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
            <p className="text-[11px] text-slate-500 font-mono">{t('recent_transactions', 'Verified POS transactions.')}</p>
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

          {/* Right Column: Two Stacked Key Metrics */}
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

      {/* SECONDARY GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Inventory Valuation & Stock Health Card */}
        <div className="lg:col-span-8 bg-white border border-slate-200 p-6 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h3 className="font-mono font-bold text-sm uppercase tracking-wider text-slate-900">
                {t('inventory-report', 'Stock Valuation & Health Breakdown')}
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{t('stock-levels', 'Real-time inventory asset calculations.')}</p>
            </div>
            <button
              onClick={() => onNavigate('inventory', 'stock-levels')}
              className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 hover:underline flex items-center gap-1"
            >
              <span>{t('view_all', 'View Stock')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
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

          {/* Total Asset Valuation Summary */}
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono">
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

        {/* Right Side: Stacked Operational Cards */}
        <div className="lg:col-span-4 space-y-6">
          {/* Pending Purchase Orders Card */}
          <div className="bg-white border border-slate-200 p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-slate-900" />
                <h4 className="font-mono font-bold text-xs uppercase tracking-wider text-slate-900">
                  {t('purchases', 'Pending POs')}
                </h4>
              </div>
              <button
                onClick={() => onNavigate('inventory', 'purchases')}
                className="text-[11px] font-mono font-bold uppercase text-slate-600 hover:text-slate-900 underline"
              >
                {t('view_all', 'View POs')}
              </button>
            </div>

            {pendingPOs.length === 0 ? (
              <p className="text-xs text-slate-500 font-mono italic">{t('no_sales', 'No pending purchase orders.')}</p>
            ) : (
              <div className="space-y-2 font-mono">
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

          {/* Urgent Stock Reorder Alerts Card */}
          <div className="bg-white border border-slate-200 p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h4 className="font-mono font-bold text-xs uppercase tracking-wider text-slate-900">
                  {t('low_stock_alerts', 'Low Stock Reorder')}
                </h4>
              </div>
              <button
                onClick={() => onNavigate('inventory', 'low-stock')}
                className="text-[11px] font-mono font-bold uppercase text-slate-600 hover:text-slate-900 underline"
              >
                {t('view_all', 'View All')}
              </button>
            </div>

            {filteredProducts.filter((p) => p.status === 'Low Stock' || p.status === 'Out of Stock')
              .length === 0 ? (
              <p className="text-xs text-slate-500 font-mono italic">{t('in_stock', 'All product stock levels healthy.')}</p>
            ) : (
              <div className="space-y-2 font-mono">
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
        </div>
      </div>
    </div>
  );
};
