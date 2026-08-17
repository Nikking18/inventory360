'use client';

import React from 'react';

interface ReportNavItem {
  id: string;
  label: string;
}

interface ReportNavProps {
  items: ReportNavItem[];
  activeId: string;
  onSelect: (id: string) => void;
}

export const ReportNav: React.FC<ReportNavProps> = ({ items, activeId, onSelect }) => {
  return (
    <div className="border-b border-slate-200 mb-6 overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-6 min-w-max pb-2 text-xs font-mono">
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`font-mono uppercase tracking-wider transition-all relative py-1 ${
                isActive ? 'text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {item.label}
              {isActive && (
                <span className="absolute bottom-[-9px] left-0 right-0 h-[2px] bg-slate-900" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
