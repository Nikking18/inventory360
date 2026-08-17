'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from '../../context/I18nContext';
import { Product, Sale, PurchaseOrder, Location, Category } from '../../lib/types';
import { formatCurrency, formatDateTime } from '../../lib/utils';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
  ChartOptions,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Download,
  FileText,
  FileSpreadsheet,
  Printer,
  ChevronDown,
  TrendingUp,
  Activity,
  AlertOctagon,
  ShieldCheck,
  DollarSign,
  Package,
  ShoppingBag,
  Percent,
  Calendar,
  Layers,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Zap,
  Clock,
  Boxes,
  Receipt,
  FileBarChart,
} from 'lucide-react';
import { exportToCSV, exportToExcel, exportToPDF } from '../../lib/exportImport';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

interface ReportingViewProps {
  products: Product[];
  sales: Sale[];
  purchaseOrders: PurchaseOrder[];
  locations: Location[];
  categories?: Category[];
  currencySymbol: string;
  activeSubTab?: string;
  onSubTabChange?: (subTab: string) => void;
}

export const ReportingView: React.FC<ReportingViewProps> = ({
  products,
  sales,
  purchaseOrders,
  locations,
  categories = [],
  currencySymbol,
  activeSubTab = 'retail-dashboard',
  onSubTabChange,
}) => {
  const { t } = useTranslation();
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'year' | 'all'>('month');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Sub-tabs list matching the sidebar
  const reportTabs = [
    { id: 'retail-dashboard', label: 'Retail Dashboard', icon: Activity },
    { id: 'sales-report', label: 'Sales Report', icon: ShoppingBag },
    { id: 'inventory-report', label: 'Inventory Valuation', icon: Package },
    { id: 'turnover-velocity', label: 'Turnover & Sales Velocity', icon: Zap },
    { id: 'profit-report', label: 'Profitability & COGS', icon: Percent },
    { id: 'tax-report', label: 'Tax Report', icon: Receipt },
  ];

  // Filtering sales based on location, date range, and excluding refunds
  const now = new Date();
  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      if (s.status === 'Refunded') return false;
      const matchesLocation = selectedLocation === 'all' || s.locationId === selectedLocation;
      if (!matchesLocation) return false;

      const saleDate = new Date(s.createdAt);
      if (isNaN(saleDate.getTime())) return true;

      if (dateRange === 'today') {
        return saleDate.toDateString() === now.toDateString();
      } else if (dateRange === 'week') {
        const oneWeekAgo = new Date(now.getTime() - 7 * 86400000);
        return saleDate >= oneWeekAgo;
      } else if (dateRange === 'month') {
        const oneMonthAgo = new Date(now.getTime() - 30 * 86400000);
        return saleDate >= oneMonthAgo;
      } else if (dateRange === 'year') {
        const oneYearAgo = new Date(now.getTime() - 365 * 86400000);
        return saleDate >= oneYearAgo;
      }
      return true;
    });
  }, [sales, selectedLocation, dateRange]);

  // Aggregate metrics
  const totalStockCostValuation = products.reduce((acc, p) => acc + (p.costPrice || 0) * (p.stockQuantity || 0), 0);
  const totalStockRetailValuation = products.reduce((acc, p) => acc + (p.retailPrice || 0) * (p.stockQuantity || 0), 0);
  const totalPotentialProfitOnHand = totalStockRetailValuation - totalStockCostValuation;
  const totalUnitsOnHand = products.reduce((acc, p) => acc + (p.stockQuantity || 0), 0);

  const totalSalesRevenue = filteredSales.reduce((acc, s) => acc + s.total, 0);
  const totalSalesTax = filteredSales.reduce((acc, s) => acc + (s.tax || 0), 0);
  const totalSalesDiscount = filteredSales.reduce((acc, s) => acc + (s.discount || 0), 0);
  const totalSalesCOGS = filteredSales.reduce((acc, s) => acc + (s.costOfGoodsSold || 0), 0);
  const totalGrossProfit = filteredSales.reduce((acc, s) => acc + (s.grossProfit || (s.total - (s.costOfGoodsSold || 0))), 0);
  const averageOrderValue = filteredSales.length > 0 ? totalSalesRevenue / filteredSales.length : 0;
  const grossMarginPercent = totalSalesRevenue > 0 ? (totalGrossProfit / totalSalesRevenue) * 100 : 0;

  // Turnover rate = COGS / Total Stock Cost
  const turnoverRate = totalStockCostValuation > 0 ? (totalSalesCOGS / totalStockCostValuation).toFixed(2) : '0.00';

  // Dead stock and low stock
  const deadStockProducts = products.filter((p) => p.status === 'Dead Stock' || p.stockQuantity > 50 && !filteredSales.some(s => s.items.some(i => i.productId === p.id)));
  const deadStockValuation = deadStockProducts.reduce((acc, p) => acc + p.costPrice * p.stockQuantity, 0);
  const lowStockProducts = products.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= p.reorderPoint);
  const outOfStockProducts = products.filter((p) => p.stockQuantity <= 0);

  // Group Product Revenue / Profit Aggregations
  const productPerformanceMap = useMemo(() => {
    const map: Record<string, { product: Product; revenue: number; units: number; cogs: number; profit: number }> = {};
    products.forEach((p) => {
      map[p.id] = { product: p, revenue: 0, units: 0, cogs: 0, profit: 0 };
    });

    filteredSales.forEach((sale) => {
      sale.items.forEach((item) => {
        const pId = item.productId.split('__var_')[0];
        if (map[pId]) {
          map[pId].revenue += item.total;
          map[pId].units += item.quantity;
          map[pId].cogs += item.quantity * (item.unitCost || map[pId].product.costPrice);
          map[pId].profit += item.total - (item.quantity * (item.unitCost || map[pId].product.costPrice));
        }
      });
    });
    return map;
  }, [products, filteredSales]);

  const performanceList = useMemo(() => {
    return Object.values(productPerformanceMap).filter((item) => {
      const matchesSearch =
        item.product.name.toLowerCase().includes(search.toLowerCase()) ||
        item.product.sku.toLowerCase().includes(search.toLowerCase());
      const matchesCat =
        selectedCategoryFilter === 'all' || item.product.categoryName === selectedCategoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [productPerformanceMap, search, selectedCategoryFilter]);

  // Chart 1: Revenue vs COGS trend over time
  const revenueTrendChartData = useMemo(() => {
    const daysMap: Record<string, { revenue: number; cogs: number }> = {};
    // Last 7 days or date range days
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const key = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
      daysMap[key] = { revenue: 0, cogs: 0 };
    }

    filteredSales.forEach((s) => {
      const d = new Date(s.createdAt);
      const key = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
      if (daysMap[key]) {
        daysMap[key].revenue += s.total;
        daysMap[key].cogs += s.costOfGoodsSold || 0;
      }
    });

    const labels = Object.keys(daysMap);
    return {
      labels,
      datasets: [
        {
          label: 'Revenue',
          data: labels.map((l) => daysMap[l].revenue),
          borderColor: '#0F172A',
          backgroundColor: 'rgba(15, 23, 42, 0.1)',
          fill: true,
          tension: 0.3,
          borderWidth: 2,
        },
        {
          label: 'COGS',
          data: labels.map((l) => daysMap[l].cogs),
          borderColor: '#64748B',
          backgroundColor: 'rgba(100, 116, 139, 0.05)',
          fill: true,
          tension: 0.3,
          borderWidth: 2,
          borderDash: [4, 4],
        },
      ],
    };
  }, [filteredSales]);

  // Chart 2: Product Performance Bar Chart
  const productBarChartData = useMemo(() => {
    const sorted = [...performanceList].sort((a, b) => b.revenue - a.revenue).slice(0, 7);
    return {
      labels: sorted.map((i) => (i.product.name.length > 14 ? i.product.name.substring(0, 14) + '…' : i.product.name)),
      datasets: [
        {
          label: 'Revenue',
          data: sorted.map((i) => i.revenue),
          backgroundColor: '#0F172A',
          borderRadius: 0,
        },
        {
          label: 'Gross Profit',
          data: sorted.map((i) => i.profit),
          backgroundColor: '#10B981',
          borderRadius: 0,
        },
      ],
    };
  }, [performanceList]);

  // Chart 3: Category Inventory Valuation Doughnut
  const categoryValuationChartData = useMemo(() => {
    const catMap: Record<string, number> = {};
    products.forEach((p) => {
      const cat = p.categoryName || 'General';
      catMap[cat] = (catMap[cat] || 0) + p.costPrice * p.stockQuantity;
    });

    const labels = Object.keys(catMap);
    const colors = ['#0F172A', '#0284C7', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#64748B'];

    return {
      labels,
      datasets: [
        {
          data: labels.map((l) => catMap[l]),
          backgroundColor: colors.slice(0, labels.length),
          borderWidth: 1,
          borderColor: '#ffffff',
        },
      ],
    };
  }, [products]);

  // Chart 4: Sales Velocity Horizontal Bar Chart
  const velocityChartData = useMemo(() => {
    const sorted = [...performanceList]
      .map((i) => ({ ...i, velocity: Number((i.units / 30).toFixed(2)) }))
      .sort((a, b) => b.velocity - a.velocity)
      .slice(0, 8);

    return {
      labels: sorted.map((i) => (i.product.name.length > 14 ? i.product.name.substring(0, 14) + '…' : i.product.name)),
      datasets: [
        {
          label: 'Sales Velocity (Units / Day)',
          data: sorted.map((i) => i.velocity),
          backgroundColor: '#0284C7',
          borderRadius: 0,
        },
      ],
    };
  }, [performanceList]);

  // Export handlers
  const handleExportCSV = () => {
    const data = performanceList.map((i) => ({
      'Product Name': i.product.name,
      SKU: i.product.sku,
      Category: i.product.categoryName || 'General',
      'Units Sold': i.units,
      'Total Revenue': i.revenue,
      'Total COGS': i.cogs,
      'Gross Profit': i.profit,
      'Gross Margin %': i.revenue > 0 ? ((i.profit / i.revenue) * 100).toFixed(1) : '0.0',
    }));
    exportToCSV(`Report_${activeSubTab}_${selectedLocation}`, data);
    setShowExportMenu(false);
  };

  const handleExportExcel = () => {
    const data = performanceList.map((i) => ({
      'Product Name': i.product.name,
      SKU: i.product.sku,
      Category: i.product.categoryName || 'General',
      'Units Sold': i.units,
      'Total Revenue': i.revenue,
      'Total COGS': i.cogs,
      'Gross Profit': i.profit,
      'Gross Margin %': i.revenue > 0 ? ((i.profit / i.revenue) * 100).toFixed(1) : '0.0',
    }));
    exportToExcel(`Report_${activeSubTab}_${selectedLocation}`, data);
    setShowExportMenu(false);
  };

  const handleExportPDF = () => {
    const data = performanceList.map((i) => ({
      'Product Name': i.product.name,
      SKU: i.product.sku,
      'Units Sold': i.units,
      'Total Revenue': formatCurrency(i.revenue, currencySymbol),
      'Gross Profit': formatCurrency(i.profit, currencySymbol),
      'Margin %': i.revenue > 0 ? `${((i.profit / i.revenue) * 100).toFixed(1)}%` : '0.0%',
    }));
    exportToPDF(
      `Report_${activeSubTab}`,
      `FINANCIAL & ANALYTICS REPORT (${activeSubTab.toUpperCase().replace('-', ' ')})`,
      data
    );
    setShowExportMenu(false);
  };

  return (
    <div id="tour-reporting-analytics" className="space-y-6 text-slate-900 font-mono">
      {/* 1. TOP SUB-NAVIGATION BAR (6 DISTINCT REPORT PAGES) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {reportTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onSubTabChange && onSubTabChange(tab.id)}
                className={`px-3.5 py-2 text-xs uppercase font-bold tracking-wider flex items-center gap-2 transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Export Dropdown */}
        <div className="relative self-start sm:self-auto">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="px-3.5 py-2 bg-slate-900 text-white hover:bg-black text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
            <ChevronDown className="w-3.5 h-3.5 ml-1" />
          </button>

          {showExportMenu && (
            <div className="absolute right-0 mt-1 w-56 bg-white border border-slate-200 shadow-2xl z-30 divide-y divide-slate-100">
              <button
                onClick={handleExportCSV}
                className="w-full text-left px-4 py-2.5 text-xs text-slate-800 hover:bg-slate-50 flex items-center gap-2.5 transition-colors font-mono"
              >
                <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-bold uppercase text-slate-900">CSV (.csv)</div>
                  <div className="text-[10px] text-slate-500">Raw tabular export</div>
                </div>
              </button>

              <button
                onClick={handleExportExcel}
                className="w-full text-left px-4 py-2.5 text-xs text-slate-800 hover:bg-slate-50 flex items-center gap-2.5 transition-colors font-mono"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-bold uppercase text-slate-900">Excel (.xls)</div>
                  <div className="text-[10px] text-slate-500">Formatted spreadsheet</div>
                </div>
              </button>

              <button
                onClick={handleExportPDF}
                className="w-full text-left px-4 py-2.5 text-xs text-slate-800 hover:bg-slate-50 flex items-center gap-2.5 transition-colors font-mono"
              >
                <Printer className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-bold uppercase text-slate-900">PDF Document</div>
                  <div className="text-[10px] text-slate-500">Printable audit sheet</div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. SHARED FILTER BAR */}
      <div className="bg-white border border-slate-200 p-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        {/* Date Range Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {(['today', 'week', 'month', 'year', 'all'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setDateRange(r)}
              className={`px-3 py-1 text-xs uppercase font-bold tracking-wider transition-colors ${
                dateRange === r
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {r === 'today' ? 'Today' : r === 'week' ? '7 Days' : r === 'month' ? '30 Days' : r === 'year' ? '1 Year' : 'All Time'}
            </button>
          ))}
        </div>

        {/* Location & Search Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="text-xs bg-white border border-slate-300 px-2.5 py-1 text-slate-900 font-mono shadow-2xs"
          >
            <option value="all">All Store Locations</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>

          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="text-xs bg-white border border-slate-300 px-2.5 py-1 text-slate-900 font-mono shadow-2xs"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          <div className="relative min-w-[180px]">
            <input
              type="text"
              placeholder="Search product / SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs bg-white border border-slate-300 text-slate-900 pl-8 pr-3 py-1 font-mono shadow-2xs"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1.5" />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. RETAIL DASHBOARD SUB-TAB                                               */}
      {/* ========================================================================= */}
      {activeSubTab === 'retail-dashboard' && (
        <div className="space-y-6">
          {/* Executive KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 bg-white border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Gross Revenue</span>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalSalesRevenue, currencySymbol)}</p>
              <p className="text-[10px] text-emerald-700 font-bold">{filteredSales.length} Transactions</p>
            </div>

            <div className="p-4 bg-white border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Gross Profit</span>
              <p className="text-2xl font-bold text-emerald-700">{formatCurrency(totalGrossProfit, currencySymbol)}</p>
              <p className="text-[10px] text-slate-500">Margin: {grossMarginPercent.toFixed(1)}%</p>
            </div>

            <div className="p-4 bg-white border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Average Order Value</span>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(averageOrderValue, currencySymbol)}</p>
              <p className="text-[10px] text-slate-500">Per Receipt Ticket</p>
            </div>

            <div className="p-4 bg-white border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Stock Cost Valuation</span>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalStockCostValuation, currencySymbol)}</p>
              <p className="text-[10px] text-slate-500">{totalUnitsOnHand} Units in Inventory</p>
            </div>
          </div>

          {/* Chart.js Visual Telemetry Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Revenue & COGS Line Chart */}
            <div className="lg:col-span-8 p-5 bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <h3 className="font-bold text-xs text-slate-900 uppercase">Revenue &amp; Cost Trend (Chart.js)</h3>
                  <p className="text-[10px] text-slate-500">Telemetry generated from sales timestamps</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-300 uppercase">
                  Live
                </span>
              </div>
              <div className="h-64 w-full">
                <Line
                  data={revenueTrendChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'top' as const, labels: { font: { family: 'monospace', size: 10 } } },
                    },
                    scales: {
                      x: { grid: { display: false }, ticks: { font: { family: 'monospace', size: 9 } } },
                      y: { grid: { color: '#F1F5F9' }, ticks: { font: { family: 'monospace', size: 9 } } },
                    },
                  }}
                />
              </div>
            </div>

            {/* Category Valuation Breakdown */}
            <div className="lg:col-span-4 p-5 bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="font-bold text-xs text-slate-900 uppercase">Category Capital Share</h3>
                <p className="text-[10px] text-slate-500">Cost value distribution</p>
              </div>
              <div className="h-64 w-full flex items-center justify-center">
                <Doughnut
                  data={categoryValuationChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'bottom' as const, labels: { font: { family: 'monospace', size: 9 } } },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SALES REPORT SUB-TAB                                                    */}
      {/* ========================================================================= */}
      {activeSubTab === 'sales-report' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Gross Sales</span>
              <p className="text-xl font-bold text-slate-900">{formatCurrency(totalSalesRevenue, currencySymbol)}</p>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Total Units Sold</span>
              <p className="text-xl font-bold text-slate-900">
                {performanceList.reduce((acc, i) => acc + i.units, 0)} Units
              </p>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Total Discounts</span>
              <p className="text-xl font-bold text-amber-700">{formatCurrency(totalSalesDiscount, currencySymbol)}</p>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Avg Ticket Size</span>
              <p className="text-xl font-bold text-slate-900">{formatCurrency(averageOrderValue, currencySymbol)}</p>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="p-5 bg-white border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-xs text-slate-900 uppercase">Top Products by Revenue &amp; Profit</h3>
            <div className="h-64 w-full">
              <Bar
                data={productBarChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'top' as const, labels: { font: { family: 'monospace', size: 10 } } },
                  },
                  scales: {
                    x: { grid: { display: false }, ticks: { font: { family: 'monospace', size: 9 } } },
                    y: { grid: { color: '#F1F5F9' }, ticks: { font: { family: 'monospace', size: 9 } } },
                  },
                }}
              />
            </div>
          </div>

          {/* Detailed Sales Ledger Table */}
          <div className="bg-white border border-slate-200 p-5 shadow-xs overflow-x-auto">
            <h3 className="font-bold text-xs text-slate-900 uppercase mb-3">Product Sales Performance Ledger</h3>
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] bg-slate-50">
                  <th className="p-2.5">Product &amp; SKU</th>
                  <th className="p-2.5">Category</th>
                  <th className="p-2.5 text-right">Units Sold</th>
                  <th className="p-2.5 text-right">Unit Price</th>
                  <th className="p-2.5 text-right">Gross Revenue</th>
                  <th className="p-2.5 text-right">Total COGS</th>
                  <th className="p-2.5 text-right">Gross Profit</th>
                  <th className="p-2.5 text-right">Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {performanceList.map((item) => (
                  <tr key={item.product.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-900">
                      {item.product.name}
                      <p className="text-[10px] text-slate-500 font-normal">{item.product.sku}</p>
                    </td>
                    <td className="p-2.5 text-slate-700">{item.product.categoryName || 'General'}</td>
                    <td className="p-2.5 text-right font-bold text-slate-900">{item.units}</td>
                    <td className="p-2.5 text-right text-slate-700">{formatCurrency(item.product.retailPrice, currencySymbol)}</td>
                    <td className="p-2.5 text-right font-bold text-slate-900">{formatCurrency(item.revenue, currencySymbol)}</td>
                    <td className="p-2.5 text-right text-slate-600">{formatCurrency(item.cogs, currencySymbol)}</td>
                    <td className="p-2.5 text-right font-bold text-emerald-700">{formatCurrency(item.profit, currencySymbol)}</td>
                    <td className="p-2.5 text-right font-bold text-slate-900">
                      {item.revenue > 0 ? ((item.profit / item.revenue) * 100).toFixed(1) : '0.0'}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. INVENTORY REPORT SUB-TAB                                               */}
      {/* ========================================================================= */}
      {activeSubTab === 'inventory-report' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Total Cost Value</span>
              <p className="text-xl font-bold text-slate-900">{formatCurrency(totalStockCostValuation, currencySymbol)}</p>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Retail Valuation</span>
              <p className="text-xl font-bold text-slate-900">{formatCurrency(totalStockRetailValuation, currencySymbol)}</p>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Potential Profit</span>
              <p className="text-xl font-bold text-emerald-700">{formatCurrency(totalPotentialProfitOnHand, currencySymbol)}</p>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Low / Out of Stock</span>
              <p className="text-xl font-bold text-amber-700">
                {lowStockProducts.length} Low • {outOfStockProducts.length} Out
              </p>
            </div>
          </div>

          {/* Inventory Valuation Table */}
          <div className="bg-white border border-slate-200 p-5 shadow-xs overflow-x-auto">
            <h3 className="font-bold text-xs text-slate-900 uppercase mb-3">Inventory Valuation &amp; Stock Ledger</h3>
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] bg-slate-50">
                  <th className="p-2.5">Product &amp; SKU</th>
                  <th className="p-2.5">Category</th>
                  <th className="p-2.5 text-right">In Stock</th>
                  <th className="p-2.5 text-right">Unit Cost</th>
                  <th className="p-2.5 text-right">Unit Retail</th>
                  <th className="p-2.5 text-right">Total Cost Value</th>
                  <th className="p-2.5 text-right">Total Retail Value</th>
                  <th className="p-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => {
                  const costVal = (p.costPrice || 0) * (p.stockQuantity || 0);
                  const retailVal = (p.retailPrice || 0) * (p.stockQuantity || 0);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-slate-900">
                        {p.name}
                        <p className="text-[10px] text-slate-500 font-normal">{p.sku}</p>
                      </td>
                      <td className="p-2.5 text-slate-700">{p.categoryName || 'General'}</td>
                      <td className="p-2.5 text-right font-bold text-slate-900">{p.stockQuantity}</td>
                      <td className="p-2.5 text-right text-slate-700">{formatCurrency(p.costPrice, currencySymbol)}</td>
                      <td className="p-2.5 text-right text-slate-700">{formatCurrency(p.retailPrice, currencySymbol)}</td>
                      <td className="p-2.5 text-right font-bold text-slate-900">{formatCurrency(costVal, currencySymbol)}</td>
                      <td className="p-2.5 text-right font-bold text-slate-900">{formatCurrency(retailVal, currencySymbol)}</td>
                      <td className="p-2.5 text-center">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 border uppercase ${
                            p.stockQuantity <= 0
                              ? 'border-rose-300 text-rose-800 bg-rose-50'
                              : p.stockQuantity <= p.reorderPoint
                              ? 'border-amber-300 text-amber-800 bg-amber-50'
                              : 'border-emerald-300 text-emerald-800 bg-emerald-50'
                          }`}
                        >
                          {p.stockQuantity <= 0 ? 'Out of Stock' : p.stockQuantity <= p.reorderPoint ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TURNOVER & SALES VELOCITY SUB-TAB                                      */}
      {/* ========================================================================= */}
      {activeSubTab === 'turnover-velocity' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Turnover Velocity</span>
              <p className="text-xl font-bold text-slate-900">{turnoverRate}x / mo</p>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Fast Movers (⚡)</span>
              <p className="text-xl font-bold text-emerald-700">
                {performanceList.filter((i) => i.units / 30 >= 0.5).length} SKUs
              </p>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Dead Stock Capital</span>
              <p className="text-xl font-bold text-rose-700">{formatCurrency(deadStockValuation, currencySymbol)}</p>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Catalog Breadth</span>
              <p className="text-xl font-bold text-slate-900">{products.length} Active SKUs</p>
            </div>
          </div>

          {/* Velocity Chart */}
          <div className="p-5 bg-white border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-xs text-slate-900 uppercase">Daily Sales Velocity (Units / Day)</h3>
            <div className="h-64 w-full">
              <Bar
                data={velocityChartData}
                options={{
                  indexAxis: 'y' as const,
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                  },
                  scales: {
                    x: { grid: { color: '#F1F5F9' }, ticks: { font: { family: 'monospace', size: 9 } } },
                    y: { grid: { display: false }, ticks: { font: { family: 'monospace', size: 9 } } },
                  },
                }}
              />
            </div>
          </div>

          {/* Velocity Table */}
          <div className="bg-white border border-slate-200 p-5 shadow-xs overflow-x-auto">
            <h3 className="font-bold text-xs text-slate-900 uppercase mb-3">Sales Velocity &amp; Days Supply Forecasting</h3>
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] bg-slate-50">
                  <th className="p-2.5">Product &amp; SKU</th>
                  <th className="p-2.5 text-right">In Stock</th>
                  <th className="p-2.5 text-right">Units Sold (30d)</th>
                  <th className="p-2.5 text-right">Velocity (Units/Day)</th>
                  <th className="p-2.5 text-right">Days Supply Left</th>
                  <th className="p-2.5 text-center">Velocity Classification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {performanceList.map((item) => {
                  const velocityPerDay = Number((item.units / 30).toFixed(2));
                  const daysSupply = velocityPerDay > 0 ? (item.product.stockQuantity / velocityPerDay).toFixed(0) : '999+';

                  return (
                    <tr key={item.product.id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-slate-900">
                        {item.product.name}
                        <p className="text-[10px] text-slate-500 font-normal">{item.product.sku}</p>
                      </td>
                      <td className="p-2.5 text-right font-bold text-slate-900">{item.product.stockQuantity}</td>
                      <td className="p-2.5 text-right text-slate-700">{item.units}</td>
                      <td className="p-2.5 text-right font-bold text-slate-900">{velocityPerDay} / day</td>
                      <td className="p-2.5 text-right font-bold text-emerald-700">{daysSupply} Days</td>
                      <td className="p-2.5 text-center">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 border uppercase ${
                            velocityPerDay >= 0.5
                              ? 'border-emerald-300 text-emerald-800 bg-emerald-50'
                              : velocityPerDay >= 0.1
                              ? 'border-sky-300 text-sky-800 bg-sky-50'
                              : 'border-slate-300 text-slate-700 bg-slate-100'
                          }`}
                        >
                          {velocityPerDay >= 0.5 ? '⚡ Fast Mover' : velocityPerDay >= 0.1 ? '🔄 Moderate' : '🐌 Slow Mover'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. PROFITABILITY & COGS SUB-TAB                                           */}
      {/* ========================================================================= */}
      {activeSubTab === 'profit-report' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Total Revenue</span>
              <p className="text-xl font-bold text-slate-900">{formatCurrency(totalSalesRevenue, currencySymbol)}</p>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Cost of Goods (COGS)</span>
              <p className="text-xl font-bold text-slate-700">{formatCurrency(totalSalesCOGS, currencySymbol)}</p>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Net Gross Profit</span>
              <p className="text-xl font-bold text-emerald-700">{formatCurrency(totalGrossProfit, currencySymbol)}</p>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Profit Margin</span>
              <p className="text-xl font-bold text-emerald-700">{grossMarginPercent.toFixed(1)}%</p>
            </div>
          </div>

          {/* Profitability Table */}
          <div className="bg-white border border-slate-200 p-5 shadow-xs overflow-x-auto">
            <h3 className="font-bold text-xs text-slate-900 uppercase mb-3">Profitability &amp; COGS Margin Ledger</h3>
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] bg-slate-50">
                  <th className="p-2.5">Product &amp; SKU</th>
                  <th className="p-2.5 text-right">Units Sold</th>
                  <th className="p-2.5 text-right">Total Revenue</th>
                  <th className="p-2.5 text-right">Total COGS</th>
                  <th className="p-2.5 text-right">Gross Profit ($)</th>
                  <th className="p-2.5 text-right">Margin (%)</th>
                  <th className="p-2.5 text-right">Markup (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {performanceList.map((item) => {
                  const markup = item.cogs > 0 ? ((item.profit / item.cogs) * 100).toFixed(1) : '0.0';
                  const margin = item.revenue > 0 ? ((item.profit / item.revenue) * 100).toFixed(1) : '0.0';

                  return (
                    <tr key={item.product.id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-slate-900">
                        {item.product.name}
                        <p className="text-[10px] text-slate-500 font-normal">{item.product.sku}</p>
                      </td>
                      <td className="p-2.5 text-right text-slate-800">{item.units}</td>
                      <td className="p-2.5 text-right font-bold text-slate-900">{formatCurrency(item.revenue, currencySymbol)}</td>
                      <td className="p-2.5 text-right text-slate-600">{formatCurrency(item.cogs, currencySymbol)}</td>
                      <td className="p-2.5 text-right font-bold text-emerald-700">{formatCurrency(item.profit, currencySymbol)}</td>
                      <td className="p-2.5 text-right font-bold text-emerald-700">{margin}%</td>
                      <td className="p-2.5 text-right text-slate-700">{markup}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. TAX REPORT SUB-TAB                                                     */}
      {/* ========================================================================= */}
      {activeSubTab === 'tax-report' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Total Tax Collected</span>
              <p className="text-xl font-bold text-emerald-700">{formatCurrency(totalSalesTax, currencySymbol)}</p>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Taxable Sales</span>
              <p className="text-xl font-bold text-slate-900">{formatCurrency(totalSalesRevenue - totalSalesTax, currencySymbol)}</p>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Tax Invoices Issued</span>
              <p className="text-xl font-bold text-slate-900">{filteredSales.length} Invoices</p>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Effective Tax Rate</span>
              <p className="text-xl font-bold text-slate-900">
                {totalSalesRevenue > 0 ? ((totalSalesTax / totalSalesRevenue) * 100).toFixed(1) : '0.0'}%
              </p>
            </div>
          </div>

          {/* Tax Invoices Table */}
          <div className="bg-white border border-slate-200 p-5 shadow-xs overflow-x-auto">
            <h3 className="font-bold text-xs text-slate-900 uppercase mb-3">Tax Collection &amp; Invoice Breakdown</h3>
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] bg-slate-50">
                  <th className="p-2.5">Invoice #</th>
                  <th className="p-2.5">Date &amp; Time</th>
                  <th className="p-2.5">Customer</th>
                  <th className="p-2.5">Location</th>
                  <th className="p-2.5 text-right">Taxable Subtotal</th>
                  <th className="p-2.5 text-right">Tax Collected</th>
                  <th className="p-2.5 text-right">Total Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-900">{sale.saleNumber}</td>
                    <td className="p-2.5 text-slate-600">{formatDateTime(sale.createdAt)}</td>
                    <td className="p-2.5 text-slate-800">{sale.customerName || 'Walk-in'}</td>
                    <td className="p-2.5 text-slate-600">{sale.locationName}</td>
                    <td className="p-2.5 text-right text-slate-700">{formatCurrency(sale.subtotal - (sale.discount || 0), currencySymbol)}</td>
                    <td className="p-2.5 text-right font-bold text-emerald-700">{formatCurrency(sale.tax, currencySymbol)}</td>
                    <td className="p-2.5 text-right font-bold text-slate-900">{formatCurrency(sale.total, currencySymbol)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
