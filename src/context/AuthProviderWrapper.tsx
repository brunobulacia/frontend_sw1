'use client';

import { Suspense } from 'react';
import { AuthProvider as OriginalAuthProvider } from './AuthContext';

function AuthProviderContent({ children }: { children: React.ReactNode }) {
  return <OriginalAuthProvider>{children}</OriginalAuthProvider>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthProviderContent>{children}</AuthProviderContent>
    </Suspense>
  );
}