import type { PropsWithChildren } from 'react';
import Header from '@/components/layout/header';

export default function PrivateLayout({ children }: PropsWithChildren) {
  return (
    <div className="relative min-h-screen bg-slate-950 text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_45%),radial-gradient(circle_at_bottom,_rgba(168,85,247,0.18),_transparent_40%)]" />
      <Header />
      <main className="relative container py-10">
        <div className="rounded-3xl border border-white/10 bg-background/80 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur">
          {children}
        </div>
      </main>
    </div>
  );
}
