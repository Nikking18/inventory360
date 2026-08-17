'use client';

import React from 'react';
import { Location } from '../../lib/types';
import { Calendar, MapPin, SlidersHorizontal } from 'lucide-react';

interface FilterBarProps {
  selectedLocation: string;
  onLocationChange: (locId: string) => void;
  locations: Location[];
  dateRange: string;
  onDateRangeChange: (range: string) => void;
  reportType?: string;
  onReportTypeChange?: (type: string) => void;
  measure?: string;
  onMeasureChange?: (m: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedLocation,
  onLocationChange,
  locations,
  dateRange,
  onDateRangeChange,
  reportType,
  onReportTypeChange,
  measure,
  onMeasureChange,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-none p-3.5 mb-6 flex flex-wrap items-center justify-between gap-4 font-mono text-xs shadow-xs">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search if enabled */}
        {onSearchChange !== undefined && (
          <div className="relative min-w-[200px]">
            <input
              type="text"
              placeholder="Filter products, SKU..."
              value={searchQuery || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full text-xs bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-none px-3 py-1.5 focus:outline-none focus:border-slate-900 transition-colors"
            />
          </div>
        )}

        {/* Report Type Selector */}
        {onReportTypeChange && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Type
            </span>
            <select
              value={reportType}
              onChange={(e) => onReportTypeChange(e.target.value)}
              className="text-xs bg-white text-slate-900 border border-slate-300 rounded-none px-2.5 py-1.5 focus:outline-none focus:border-slate-900 font-mono"
            >
              <option value="Product">Product Level</option>
              <option value="Category">Category Summary</option>
              <option value="Supplier">Supplier Breakdown</option>
            </select>
          </div>
        )}

        {/* Measure Selector */}
        {onMeasureChange && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Measure
            </span>
            <select
              value={measure}
              onChange={(e) => onMeasureChange(e.target.value)}
              className="text-xs bg-white text-slate-900 border border-slate-300 rounded-none px-2.5 py-1.5 focus:outline-none focus:border-slate-900 font-mono"
            >
              <option value="Revenue">Revenue ($)</option>
              <option value="Units">Units Sold</option>
              <option value="Profit">Gross Profit ($)</option>
              <option value="Margin">Margin (%)</option>
            </select>
          </div>
        )}

        {/* Date Range Selector */}
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Date
          </span>
          <select
            value={dateRange}
            onChange={(e) => onDateRangeChange(e.target.value)}
            className="text-xs bg-white text-slate-900 border border-slate-300 rounded-none px-2.5 py-1.5 focus:outline-none focus:border-slate-900 font-mono"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">Year to Date</option>
            <option value="all">All Time</option>
          </select>
        </div>

        {/* Location Selector */}
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Location
          </span>
          <select
            value={selectedLocation}
            onChange={(e) => onLocationChange(e.target.value)}
            className="text-xs bg-white text-slate-900 border border-slate-300 rounded-none px-2.5 py-1.5 focus:outline-none focus:border-slate-900 font-mono"
          >
            <option value="all">All Outlets (Combined)</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-slate-600 font-mono">
        <SlidersHorizontal className="w-3.5 h-3.5" />
        <span>Active Filters: {selectedLocation === 'all' ? 'All Outlets' : locations.find(l=>l.id===selectedLocation)?.name}</span>
      </div>
    </div>
  );
};
