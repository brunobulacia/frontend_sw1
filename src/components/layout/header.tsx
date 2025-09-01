'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth'; // si aún no lo usas, comenta esta línea
import LogoutButton from '@/components/auth/LogoutButton'; // opcional; comenta si no lo tienes

const links = [
  { href: '/', label: 'Inicio' },
  { href: '/dashboard', label: 'Dashboard' },
  // agrega más enlaces si quieres...
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated } = useAuth(); // comenta si no usas useAuth

  console.log('[Header user]', user);
  console.log('[Header isAuthenticated]', isAuthenticated);
  const isActive = (href: string) =>
    pathname === href ? 'text-primary' : 'text-foreground/80 hover:text-foreground';

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <nav className="container flex h-14 items-center justify-between">
        {/* Logo / Marca */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            {/* #TODO Cambiar el logo */}
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary/15 text-primary font-bold">∎</span>
            <span className="font-semibold">App</span>
          </Link>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={`text-sm ${isActive(l.href)}`}>
              {l.label}
            </Link>
          ))}

          {/* Área de sesión */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-foreground/70 hidden sm:inline">{user?.email}</span>
              <LogoutButton className="btn btn-ghost px-3 py-2" />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="btn btn-ghost px-3 py-2 text-sm">Ingresar</Link>
              <Link href="/register" className="btn p   x-3 py-2 text-sm">Crear cuenta</Link>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          aria-label="Abrir menú"
          className="md:hidden rounded-lg border border-border px-3 py-1.5 text-sm"
          onClick={() => setOpen((v) => !v)}
        >
          Menú
        </button>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="container py-3 flex flex-col gap-2">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`py-2 ${isActive(l.href)}`}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}

            {isAuthenticated ? (
              <div className="pt-2 border-t border-border flex items-center justify-between">
                <span className="text-sm text-foreground/70 truncate">{user?.email}</span>
                <LogoutButton className="btn-ghost px-3 py-2" />
              </div>
            ) : (
              <div className="pt-2 border-t border-border flex gap-2">
                <Link href="/login" className="btn-ghost px-3 py-2 text-sm" onClick={() => setOpen(false)}>
                  Ingresar
                </Link>
                <Link href="/register" className="btn px-3 py-2 text-sm" onClick={() => setOpen(false)}>
                  Crear cuenta
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
