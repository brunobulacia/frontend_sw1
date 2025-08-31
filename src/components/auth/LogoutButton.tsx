'use client';

import { useAuth } from '@/hooks/useAuth';

export default function LogoutButton({ className }: { className?: string }) {
  const { logout, busy } = useAuth();

  return (
    <button
      type="button"
      onClick={logout}
      disabled={busy}
      className={className ?? 'border px-3 py-2 rounded'}
    >
      {busy ? 'Saliendo...' : 'Cerrar sesión'}
    </button>
  );
}