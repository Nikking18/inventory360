'use client';

import React from 'react';
import { MessageSquareHeart, ExternalLink } from 'lucide-react';

const FEEDBACK_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLScUP7c8Av1NXwCB5oKcO51P0cdisGfSnpc8kVa6osjpa37jZQ/viewform?usp=sharing&ouid=109337961244798371660';

export const FeedbackWidget: React.FC = () => {
  return (
    <aside
      aria-label="Customer Feedback"
      className="fixed right-0 top-1/2 -translate-y-1/2 z-40 hidden sm:block print:hidden"
    >
      <a
        href={FEEDBACK_FORM_URL}
        target="_blank"
        rel="noopener noreferrer"
        title="Share your feedback, feature requests, or suggestions with us"
        className="flex items-center gap-2 bg-slate-900 hover:bg-emerald-700 text-white font-mono text-xs font-bold py-2.5 px-3 shadow-xl transition-all duration-200 border-l border-t border-b border-slate-700 hover:border-emerald-500 rounded-l-lg group transform hover:-translate-x-1"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <MessageSquareHeart className="w-4 h-4 text-emerald-400 group-hover:text-white transition-colors" />
        <span className="tracking-wider uppercase text-[11px] font-bold">Feedback</span>
        <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-white transition-colors" />
      </a>
    </aside>
  );
};
