'use client';

import React from 'react';

interface ProductHuntBadgeProps {
  className?: string;
  width?: number;
  height?: number;
}

export const ProductHuntBadge: React.FC<ProductHuntBadgeProps> = ({
  className = '',
  width = 250,
  height = 54,
}) => {
  return (
    <a
      href="https://www.producthunt.com/products/inventory-360?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-inventory-360"
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-block transition-transform hover:opacity-95 ${className}`}
      title="Inventory 360 - Find us on Product Hunt"
    >
      <svg
        width={width}
        height={height}
        viewBox="0 0 250 54"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto max-w-[250px] shadow-2xs rounded-[10px]"
        style={{ aspectRatio: '250 / 54' }}
      >
        <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
          <rect stroke="#221D21" stroke-width="1" fill="#221D21" x="0.5" y="0.5" width="249" height="53" rx="10"></rect>
          <text font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="9" font-weight="bold" fill="#EEF2FF">
            <tspan x="53" y="20">FIND US ON</tspan>
          </text>
          <text font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="21" font-weight="bold" fill="#EEF2FF">
            <tspan x="52" y="40">Product Hunt</tspan>
          </text>
          <g transform="translate(201.000000, 13.000000)" fill="#EEF2FF">
            <g>
              <polygon points="26.0024997 10 15 10 20.5012498 0"></polygon>
              <text font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="13" font-weight="bold">
                <tspan x="16.5" y="27">1</tspan>
              </text>
            </g>
          </g>
          <g transform="translate(11.000000, 12.000000)">
            <path d="M31,15.5 C31,24.0603917 24.0603917,31 15.5,31 C6.93960833,31 0,24.0603917 0,15.5 C0,6.93960833 6.93960833,0 15.5,0 C24.0603917,0 31,6.93960833 31,15.5" fill="#FFFFFF"></path>
            <path d="M17.4329412,15.9558824 L17.4329412,15.9560115 L13.0929412,15.9560115 L13.0929412,11.3060115 L17.4329412,11.3060115 L17.4329412,11.3058824 C18.7018806,11.3058824 19.7305882,12.3468365 19.7305882,13.6308824 C19.7305882,14.9149282 18.7018806,15.9558824 17.4329412,15.9558824 M17.4329412,8.20588235 L17.4329412,8.20601152 L10.0294118,8.20588235 L10.0294118,23.7058824 L13.0929412,23.7058824 L13.0929412,19.0560115 L17.4329412,19.0560115 L17.4329412,19.0558824 C20.3938424,19.0558824 22.7941176,16.6270324 22.7941176,13.6308824 C22.7941176,10.6347324 20.3938424,8.20588235 17.4329412,8.20588235" fill="#221D21"></path>
          </g>
        </g>
      </svg>
    </a>
  );
};
