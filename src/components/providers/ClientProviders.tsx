'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
export function ClientProviders({ children }: { children: React.ReactNode }) {
  const checkAuth = useAuthStore((s) => s.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <>
      {children}
    </>
  );
}
