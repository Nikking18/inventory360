'use client';

import React from 'react';

interface ProductHuntBadgeProps {
  className?: string;
}

export const ProductHuntBadge: React.FC<ProductHuntBadgeProps> = ({
  className = '',
}) => {
  return (
    <a
      href="https://www.producthunt.com/products/inventory-360?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-inventory-360"
      target="_blank"
      rel="noopener noreferrer"
      className={`w-full py-1.5 px-2 bg-[#DA552F] hover:bg-[#c44723] text-white font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors shadow-2xs text-[10px] ${className}`}
      title="Featured on Product Hunt"
    >
      <div className="w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center shrink-0">
        <span className="text-[#DA552F] font-black text-[9px] font-sans leading-none ml-[0.5px]">P</span>
      </div>
      <span>Featured on Product Hunt</span>
    </a>
  );
};
