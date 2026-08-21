'use client';

import React from 'react';

interface ProductHuntBadgeProps {
  className?: string;
}

export const ProductHuntBadge: React.FC<ProductHuntBadgeProps> = ({
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <a
        href="https://www.producthunt.com/products/inventory-360?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-inventory-360"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block transition-transform hover:opacity-95 active:scale-95"
        title="Inventory 360 - Local-first POS & inventory management on Product Hunt"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/producthunt-badge.svg"
          alt="Inventory 360 - Local-first POS & inventory management, zero cloud, zero fee | Product Hunt"
          width="250"
          height="54"
          style={{ width: '100%', maxWidth: '250px', height: 'auto', aspectRatio: '250 / 54', display: 'block' }}
          loading="lazy"
        />
      </a>
    </div>
  );
};
