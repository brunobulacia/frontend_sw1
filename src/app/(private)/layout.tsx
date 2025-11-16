import type { PropsWithChildren } from 'react';
import Header from '@/components/layout/header';

export default function PrivateLayout({ children }: PropsWithChildren) {
  return (
    <div className="relative min-h-screen bg-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.15),_transparent_50%),radial-gradient(circle_at_bottom,_rgba(168,85,247,0.15),_transparent_50%)]" />
      <Header />
      <main className="relative container mx-auto px-4 py-6 sm:px-6 sm:py-10">
        <div className="rounded-3xl border border-slate-700/50 bg-slate-900/80 backdrop-blur-sm p-4 sm:p-6 lg:p-8 shadow-2xl shadow-slate-950/40">
          {children}
        </div>
      </main>
    </div>
  );
}
