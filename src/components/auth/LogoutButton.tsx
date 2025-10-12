'use client';

import { useAuth } from '@/hooks/useAuth';

export default function LogoutButton({ className }: { className?: string }) {
  const { logout, busy } = useAuth();

  return (
    <button
      type="button"
      onClick={logout}
      disabled={busy}
      className={className}
    >
      {busy ? 'Saliendo...' : 'Cerrar sesion'}
    </button>
  );
}
