'use client';

import React from 'react';
import { Coffee } from 'lucide-react';

interface CommunityFooterButtonsProps {
  className?: string;
}

export const CommunityFooterButtons: React.FC<CommunityFooterButtonsProps> = ({
  className = '',
}) => {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-2.5 ${className}`}>
      {/* 1. Buy Me a Coffee Button */}
      <a
        href="https://ko-fi.com/Y0H123WFGA"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-black border border-slate-700 hover:border-slate-500 text-white text-[11px] font-bold font-mono uppercase tracking-wider transition-all shadow-2xs group"
        title="Buy me a coffee on Ko-fi"
      >
        <span className="w-5 h-5 rounded-full bg-[#FF5E5B] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
          <Coffee className="w-3 h-3 text-white" />
        </span>
        <span>Buy me a coffee</span>
      </a>

      {/* 2. Product Hunt Button */}
      <a
        href="https://www.producthunt.com/products/inventory-360?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-inventory-360"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-black border border-slate-700 hover:border-slate-500 text-white text-[11px] font-bold font-mono uppercase tracking-wider transition-all shadow-2xs group"
        title="Inventory 360 on Product Hunt"
      >
        <span className="w-5 h-5 rounded-full bg-[#DA552F] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
          <span className="text-white font-extrabold text-[10px] font-sans ml-0.5 leading-none">P</span>
        </span>
        <span>Product Hunt</span>
      </a>
    </div>
  );
};
