'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/axios/client';

function validatePassword(value: string) {
  const lengthOk = value.length >= 8;
  const upper = /[A-Z]/.test(value);
  const lower = /[a-z]/.test(value);
  const digit = /\d/.test(value);
  return lengthOk && upper && lower && digit;
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [tokenStatus, setTokenStatus] = useState<'checking' | 'valid' | 'invalid'>(
    token ? 'checking' : 'invalid',
  );
  const [tokenMessage, setTokenMessage] = useState<string | null>(
    token ? null : 'Falta el token de recuperacion. Revisa tu enlace o solicita uno nuevo.',
  );

  useEffect(() => {
    if (!token) {
      setTokenStatus('invalid');
      setTokenMessage('Falta el token de recuperacion. Revisa tu enlace o solicita uno nuevo.');
      return;
    }

    let cancelled = false;
    setTokenStatus('checking');
    setTokenMessage(null);

    api
      .get('/auth/reset-password', {
        params: { token },
        validateStatus: () => true,
      })
      .then((response) => {
        if (cancelled) return;
        if (
          response.status >= 200 &&
          response.status < 300 &&
          response.data?.valid
        ) {
          setTokenStatus('valid');
          setTokenMessage(null);
        } else {
          setTokenStatus('invalid');
          setTokenMessage(
            response.data?.reason ??
              response.data?.message ??
              'Token invalido o expirado. Solicita un nuevo enlace.',
          );
        }
      })
      .catch(() => {
        if (cancelled) return;
        setTokenStatus('invalid');
        setTokenMessage('Token invalido o expirado. Solicita un nuevo enlace.');
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const passwordError = useMemo(() => {
    if (!password) return null;
    return validatePassword(password)
      ? null
      : 'La contrasena debe tener al menos 8 caracteres con mayusculas, minusculas y numeros.';
  }, [password]);

  const confirmError = useMemo(() => {
    if (!confirm) return null;
    return password === confirm ? null : 'Las contrasenas no coinciden.';
  }, [password, confirm]);

  const disabled =
    busy ||
    tokenStatus !== 'valid' ||
    !password ||
    !confirm ||
    !!passwordError ||
    !!confirmError;

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmissionError(null);
    setSuccessMsg(null);

    if (!token || tokenStatus !== 'valid') {
      setSubmissionError(
        tokenMessage ?? 'Token invalido o expirado. Solicita un nuevo enlace.',
      );
      return;
    }
    if (passwordError || confirmError) return;

    setBusy(true);
    try {
      const response = await api.post(
        '/auth/reset-password',
        { token, newPassword: password },
        { validateStatus: () => true },
      );
      if (response.status >= 200 && response.status < 300) {
        setSuccessMsg(
          response.data?.message ??
            'La contrasena se actualizo correctamente. Ahora puedes iniciar sesion.',
        );
        setPassword('');
        setConfirm('');
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setSubmissionError(
          response.data?.error ??
            response.data?.message ??
            'No se pudo restablecer la contrasena.',
        );
      }
    } catch (err: any) {
      setSubmissionError(
        err?.data?.error || err?.data?.message || 'Error inesperado',
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-xl font-semibold">Restablecer contrasena</h1>
      {tokenStatus === 'checking' && (
        <p className="text-sm text-slate-600">Validando enlace...</p>
      )}
      {tokenStatus === 'invalid' && tokenMessage && (
        <p className="text-red-600 text-sm">
          {tokenMessage}{' '}
          <a
            className="underline"
            href="/forgot-password"
          >
            Solicitar otro enlace
          </a>
        </p>
      )}
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="w-full border p-2 rounded"
          type="password"
          placeholder="Nueva contrasena"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={tokenStatus !== 'valid'}
          required
        />
        {passwordError && <p className="text-red-600 text-sm">{passwordError}</p>}

        <input
          className="w-full border p-2 rounded"
          type="password"
          placeholder="Confirmar contrasena"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          disabled={tokenStatus !== 'valid'}
          required
        />
        {confirmError && <p className="text-red-600 text-sm">{confirmError}</p>}

        <button
          className="w-full border p-2 rounded"
          type="submit"
          disabled={disabled}
        >
          {busy ? 'Guardando...' : 'Actualizar contrasena'}
        </button>
      </form>
      {successMsg && <p className="text-green-600 text-sm">{successMsg}</p>}
      {submissionError && (
        <p className="text-red-600 text-sm">{submissionError}</p>
      )}
    </main>
  );
}
