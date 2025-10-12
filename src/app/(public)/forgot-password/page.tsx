'use client';

import { useState } from 'react';
import { api } from '@/lib/axios/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const response = await api.post(
        '/auth/request-password-reset',
        { email },
        { validateStatus: () => true },
      );
      if (response.status >= 200 && response.status < 300) {
        const info =
          response.data?.message ??
          'Si el correo existe se enviaron instrucciones para recuperar el acceso.';
        setMessage(info);
      } else {
        const errorMessage =
          response.data?.error ??
          response.data?.message ??
          'No se pudo procesar la solicitud.';
        setError(errorMessage);
      }
    } catch (err: any) {
      setError(err?.data?.error || err?.data?.message || 'Error inesperado');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-xl font-semibold">Recuperar acceso</h1>
      <p className="text-sm text-gray-600">
        Ingresa tu correo electronico y, si existe en el sistema, enviaremos
        instrucciones para restablecer la contrasena.
      </p>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="w-full border p-2 rounded"
          type="email"
          placeholder="Correo electronico"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <button
          className="w-full border p-2 rounded"
          type="submit"
          disabled={busy}
        >
          {busy ? 'Enviando...' : 'Enviar instrucciones'}
        </button>
      </form>
      {message && <p className="text-green-600 text-sm">{message}</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </main>
  );
}

