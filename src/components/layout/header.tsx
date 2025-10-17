'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import LogoutButton from '@/components/auth/LogoutButton';

const baseLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/projects', label: 'Proyectos' },
];

const getInitials = (email?: string | null) => {
  if (!email) return '?';
  const [name] = email.split('@');
  if (!name) return email.charAt(0)?.toUpperCase() ?? '?';
  const parts = name.split('.');
  if (parts.length === 1) {
    return parts[0]?.slice(0, 2).toUpperCase() ?? '?';
  }
  return (parts[0]?.charAt(0) ?? '') + (parts[1]?.charAt(0) ?? '');
};

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const navLinks = useMemo(() => {
    if (user?.isAdmin) {
      return [...baseLinks, { href: '/admin/users', label: 'Usuarios' }];
    }
    return baseLinks;
  }, [user?.isAdmin]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const renderLink = (link: (typeof navLinks)[number]) => (
    <Link
      key={link.href}
      href={link.href}
      className={`relative text-sm font-medium transition-colors ${
        isActive(link.href)
          ? 'text-primary'
          : 'text-foreground/70 hover:text-foreground'
      }`}
      onClick={() => setOpen(false)}
    >
      {link.label}
      {isActive(link.href) && (
        <span className="absolute -bottom-1 left-0 h-[2px] w-full rounded-full bg-primary" />
      )}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-background via-background/95 to-background/80 backdrop-blur">
      <nav className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 transition hover:bg-primary/15"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-background font-semibold">
              {getInitials(user?.email)}
            </span>
            <span className="font-semibold tracking-tight">SW1 Manager</span>
          </Link>
        </div>

        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map(renderLink)}

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-xs uppercase text-foreground/50">Sesión</p>
                <p className="text-sm font-medium text-foreground/80">
                  {user?.email}
                </p>
              </div>
              <LogoutButton className="rounded-full border border-transparent bg-foreground/10 px-4 py-2 text-sm font-medium text-foreground transition hover:border-foreground/20 hover:bg-foreground/20" />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="rounded-full border border-transparent px-4 py-2 text-sm font-medium text-foreground transition hover:bg-foreground/10"
              >
                Ingresar
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-background transition hover:bg-primary/90"
              >
                Crear cuenta
              </Link>
            </div>
          )}
        </div>

        <button
          aria-label="Abrir menu"
          className="inline-flex items-center gap-2 rounded-full border border-border/70 px-4 py-2 text-sm font-medium text-foreground transition hover:border-border hover:bg-foreground/10 md:hidden"
          onClick={() => setOpen((value) => !value)}
        >
          Menu
          <svg
            aria-hidden
            className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </nav>

      <div
        className={`md:hidden border-t border-border/60 bg-background/95 transition-all ${
          open ? 'max-h-[320px] opacity-100' : 'max-h-0 overflow-hidden opacity-0'
        }`}
      >
        <div className="container flex flex-col gap-3 py-4">
          {navLinks.map(renderLink)}

          {isAuthenticated ? (
            <div className="rounded-lg border border-border/70 bg-background/80 p-4 shadow-sm">
              <p className="text-xs uppercase text-foreground/50">Sesion activa</p>
              <p className="truncate text-sm font-medium text-foreground">
                {user?.email}
              </p>
              <div className="pt-3">
                <LogoutButton className="w-full rounded-full border border-transparent bg-foreground/10 px-4 py-2 text-sm font-medium text-foreground transition hover:border-foreground/20 hover:bg-foreground/20" />
              </div>
            </div>
          ) : (
            <div className="grid gap-2">
              <Link
                href="/login"
                className="w-full rounded-full border border-transparent bg-foreground/10 px-4 py-2 text-sm font-medium text-foreground transition hover:border-foreground/20 hover:bg-foreground/15"
                onClick={() => setOpen(false)}
              >
                Ingresar
              </Link>
              <Link
                href="/register"
                className="w-full rounded-full bg-primary px-4 py-2 text-sm font-semibold text-background transition hover:bg-primary/90"
                onClick={() => setOpen(false)}
              >
                Crear cuenta
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
