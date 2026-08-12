'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ElementType;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType = 'positive',
  subtitle,
  action,
  icon: Icon,
  className = '',
}) => {
  return (
    <div
      className={`bg-neutral-900 border border-neutral-800 rounded-none p-5 flex flex-col justify-between transition-all ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[10px] font-mono font-bold text-neutral-400 tracking-[0.2em] uppercase">
            {title}
          </span>
          <p className="text-2xl lg:text-3xl font-mono font-bold text-white mt-1 tracking-tight">
            {value}
          </p>
        </div>
        {Icon && (
          <div className="p-2 bg-neutral-950 border border-neutral-800 text-neutral-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      {(change || subtitle || action) && (
        <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between text-[11px] font-mono">
          {change && (
            <div className="flex items-center gap-1 font-semibold">
              {changeType === 'positive' && (
                <span className="text-emerald-400 flex items-center">
                  <ArrowUpRight className="w-3.5 h-3.5 inline" /> {change}
                </span>
              )}
              {changeType === 'negative' && (
                <span className="text-rose-400 flex items-center">
                  <ArrowDownRight className="w-3.5 h-3.5 inline" /> {change}
                </span>
              )}
              {changeType === 'neutral' && (
                <span className="text-neutral-500 flex items-center">
                  <Minus className="w-3.5 h-3.5 inline" /> {change}
                </span>
              )}
              {subtitle && <span className="text-neutral-500 font-normal ml-1">{subtitle}</span>}
            </div>
          )}
          {!change && subtitle && <span className="text-neutral-500">{subtitle}</span>}
          {action && <div>{action}</div>}
        </div>
      )}
    </div>
  );
};
