'use client';

import React from 'react';

interface ProductHuntBadgeProps {
  className?: string;
  variant?: 'compact' | 'full';
}

export const ProductHuntBadge: React.FC<ProductHuntBadgeProps> = ({
  className = '',
  variant = 'full',
}) => {
  return (
    <a
      href="https://www.producthunt.com/products/inventory-360?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-inventory-360"
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex items-center justify-between gap-3 bg-slate-900 hover:bg-black border border-slate-800 text-white px-3 py-2 transition-all shadow-2xs ${className}`}
      title="Inventory 360 - Local-first POS & inventory management on Product Hunt"
    >
      <div className="flex items-center gap-2.5">
        {/* Product Hunt Orange "P" Emblem */}
        <div className="w-6 h-6 rounded-full bg-[#DA552F] flex items-center justify-center shrink-0 shadow-xs">
          <span className="text-white font-extrabold text-xs font-sans leading-none ml-0.5">P</span>
        </div>
        <div className="flex flex-col text-left">
          <span className="text-[8px] font-mono uppercase tracking-widest text-slate-400 font-bold leading-tight">
            FEATURED ON
          </span>
          <span className="text-xs font-bold font-sans text-white leading-tight group-hover:text-emerald-400 transition-colors">
            Product Hunt
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1 bg-slate-800 group-hover:bg-slate-700 px-2 py-1 border border-slate-700 text-slate-300 font-mono text-[10px] font-bold shrink-0">
        <span className="text-[#DA552F]">▲</span>
        <span>PROD</span>
      </div>
    </a>
  );
};
