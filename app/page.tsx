'use client';

import dynamic from 'next/dynamic';

const AppMain = dynamic(() => import('../components/AppMain'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center font-mono">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent animate-spin" />
        <span className="text-xs uppercase tracking-widest text-slate-300 font-bold">
          Inventory360
        </span>
      </div>
    </div>
  ),
});

export default function Page() {
  return <AppMain />;
}
