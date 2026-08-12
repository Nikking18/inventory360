'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../context/I18nContext';
import { Product, Sale, PurchaseOrder, Location } from '../../lib/types';
import { formatCurrency } from '../../lib/utils';
import { ReportNav } from '../common/ReportNav';
import { FilterBar } from '../common/FilterBar';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Download, FileText, FileSpreadsheet, Printer, ChevronDown } from 'lucide-react';
import { exportToCSV, exportToExcel, exportToPDF } from '../../lib/exportImport';

interface ReportingViewProps {
  products: Product[];
  sales: Sale[];
  purchaseOrders: PurchaseOrder[];
  locations: Location[];
  currencySymbol: string;
}

export const ReportingView: React.FC<ReportingViewProps> = ({
  products,
  sales,
  purchaseOrders,
  locations,
  currencySymbol,
}) => {
  const { t } = useTranslation();
  const [activeReport, setActiveReport] = useState('sales-report');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [dateRange, setDateRange] = useState('month');
  const [reportType, setReportType] = useState('Product');
  const [measure, setMeasure] = useState('Revenue');
  const [search, setSearch] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const reportNavItems = [
    { id: 'retail-dashboard', label: t('reports', 'Retail Dashboard') },
    { id: 'sales-report', label: t('sales_report', 'Sales Report') },
    { id: 'inventory-report', label: t('inventory-report', 'Inventory Valuation') },
    { id: 'purchase-report', label: t('purchase_report', 'Purchase Report') },
    { id: 'profit-report', label: t('profit_report', 'Profitability & COGS') },
    { id: 'tax-report', label: t('tax_report', 'Tax Report') },
  ];

  // Filtering sales based on location and date range
  const now = new Date();
  const filteredSales = sales.filter((s) => {
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

  // Group Product Revenue / Profit Aggregations
  const productPerformanceMap: Record<string, { product: Product; revenue: number; units: number; cogs: number; profit: number }> = {};

  products.forEach((p) => {
    productPerformanceMap[p.id] = { product: p, revenue: 0, units: 0, cogs: 0, profit: 0 };
  });

  filteredSales.forEach((sale) => {
    sale.items.forEach((item) => {
      if (productPerformanceMap[item.productId]) {
        productPerformanceMap[item.productId].revenue += item.total;
        productPerformanceMap[item.productId].units += item.quantity;
        productPerformanceMap[item.productId].cogs += item.quantity * item.unitCost;
        productPerformanceMap[item.productId].profit += item.total - (item.quantity * item.unitCost);
      }
    });
  });

  const performanceList = Object.values(productPerformanceMap).filter((item) =>
    item.product.name.toLowerCase().includes(search.toLowerCase()) ||
    item.product.sku.toLowerCase().includes(search.toLowerCase())
  );

  const chartData = performanceList.slice(0, 8).map((item) => ({
    name: item.product.name.length > 15 ? item.product.name.substring(0, 15) + '...' : item.product.name,
    Value: measure === 'Revenue' ? item.revenue : measure === 'Units' ? item.units : item.profit,
  }));

  const [showExportMenu, setShowExportMenu] = useState(false);

  const getExportData = () => {
    return performanceList.map((item) => ({
      'Product Name': item.product.name,
      SKU: item.product.sku,
      'Units Sold': item.units,
      'Total Revenue ($)': item.revenue,
      'Total COGS ($)': item.cogs,
      'Gross Profit ($)': item.profit,
      'Margin (%)': item.revenue > 0 ? (((item.profit) / item.revenue) * 100).toFixed(2) : 0,
    }));
  };

  const handleExportCSV = () => {
    exportToCSV(`Report_${activeReport}_${selectedLocation}_${dateRange}`, getExportData());
    setShowExportMenu(false);
  };

  const handleExportExcel = () => {
    exportToExcel(`Report_${activeReport}_${selectedLocation}_${dateRange}`, getExportData());
    setShowExportMenu(false);
  };

  const handleExportPDF = () => {
    exportToPDF(
      `Report_${activeReport}_${selectedLocation}_${dateRange}`,
      `Financial & Audit Report (${activeReport.toUpperCase().replace('-', ' ')})`,
      getExportData()
    );
    setShowExportMenu(false);
  };

  return (
    <div className="space-y-6 text-neutral-200 font-mono">
      {/* Report Header & Navigation */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-wider">
              {t('reports', 'Business Intelligence & Analytics')}
            </h1>
            <p className="text-xs text-neutral-400">
              Granular financial analytics, margin reports, and export tools.
            </p>
          </div>

          {/* Export Dropdown Group */}
          <div className="relative self-start sm:self-auto">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-4 py-2 bg-white text-black hover:bg-neutral-200 text-xs font-bold uppercase tracking-wider rounded-none flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>{t('export', 'Export Report')}</span>
              <ChevronDown className="w-3.5 h-3.5 ml-1" />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-1 w-56 bg-neutral-900 border border-neutral-700 shadow-2xl z-30 divide-y divide-neutral-800">
                <button
                  onClick={handleExportCSV}
                  className="w-full text-left px-4 py-2.5 text-xs text-neutral-200 hover:bg-neutral-800 hover:text-white flex items-center gap-2.5 transition-colors font-mono"
                >
                  <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-bold uppercase">CSV (.csv)</div>
                    <div className="text-[10px] text-neutral-400">Comma-separated text file</div>
                  </div>
                </button>

                <button
                  onClick={handleExportExcel}
                  className="w-full text-left px-4 py-2.5 text-xs text-neutral-200 hover:bg-neutral-800 hover:text-white flex items-center gap-2.5 transition-colors font-mono"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-bold uppercase">Excel (.xls / .xlsx)</div>
                    <div className="text-[10px] text-neutral-400">Sortable spreadsheet file</div>
                  </div>
                </button>

                <button
                  onClick={handleExportPDF}
                  className="w-full text-left px-4 py-2.5 text-xs text-neutral-200 hover:bg-neutral-800 hover:text-white flex items-center gap-2.5 transition-colors font-mono"
                >
                  <Printer className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-bold uppercase">PDF (.pdf)</div>
                    <div className="text-[10px] text-neutral-400">Fixed document & printable record</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>

        <ReportNav
          items={reportNavItems}
          activeId={activeReport}
          onSelect={(id) => setActiveReport(id)}
        />
      </div>

      {/* Filter Bar */}
      <FilterBar
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
        locations={locations}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        reportType={reportType}
        onReportTypeChange={setReportType}
        measure={measure}
        onMeasureChange={setMeasure}
        searchQuery={search}
        onSearchChange={setSearch}
      />

      {/* Main Analytical Chart Card */}
      <div className="bg-neutral-900 border border-neutral-800 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-white">
            Performance Breakdown ({measure})
          </h3>
          <span className="text-[10px] text-neutral-500 uppercase">
            Aggregated across {filteredSales.length} Transactions
          </span>
        </div>

        <div className="h-64 w-full">
          {isMounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B', fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748B', fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '0px', border: '1px solid #334155', color: '#fff', fontSize: '12px', fontFamily: 'monospace' }}
                />
                <Bar dataKey="Value" fill="#0F172A" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full bg-neutral-950 animate-pulse" />
          )}
        </div>
      </div>

      {/* Performance Data Table */}
      <div className="bg-neutral-900 border border-neutral-800 p-5 space-y-4">
        <h3 className="font-bold text-xs uppercase tracking-wider text-white border-b border-neutral-800 pb-3">
          Detailed Report Audit Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-500 font-bold uppercase text-[10px] tracking-widest">
                <th className="py-2.5 px-3">{t('product_name', 'Product Name')}</th>
                <th className="py-2.5 px-3">SKU</th>
                <th className="py-2.5 px-3 text-right">{t('total_sales', 'Units Sold')}</th>
                <th className="py-2.5 px-3 text-right">{t('today_revenue', 'Total Revenue')}</th>
                <th className="py-2.5 px-3 text-right">{t('cost_price', 'Total COGS')}</th>
                <th className="py-2.5 px-3 text-right">{t('profit_margin', 'Gross Profit')}</th>
                <th className="py-2.5 px-3 text-right">{t('profit_margin', 'Margin %')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {performanceList.map((item) => {
                const margin = item.revenue > 0 ? ((item.profit / item.revenue) * 100).toFixed(1) : '0.0';
                return (
                  <tr key={item.product.id} className="hover:bg-neutral-950/60 transition-colors">
                    <td className="py-3 px-3 font-bold text-white">{item.product.name}</td>
                    <td className="py-3 px-3 text-neutral-400">{item.product.sku}</td>
                    <td className="py-3 px-3 text-right font-bold text-white">{item.units}</td>
                    <td className="py-3 px-3 text-right font-bold text-white">
                      {formatCurrency(item.revenue, currencySymbol)}
                    </td>
                    <td className="py-3 px-3 text-right text-neutral-400">
                      {formatCurrency(item.cogs, currencySymbol)}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-400">
                      {formatCurrency(item.profit, currencySymbol)}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-400">
                      {margin}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
