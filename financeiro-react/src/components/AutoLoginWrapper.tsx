"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { useAuth } from '@/hooks/useAuth';

interface AutoLoginProps {
  children: React.ReactNode;
}

export function AutoLoginWrapper({ children }: AutoLoginProps) {
  const router = useRouter();
  const { setAccessToken, isAuthenticated } = useAuth();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    async function tryAutoLogin() {
      if (!window.electronAPI) {
        setChecked(true);
        return;
      }

      if (isAuthenticated) {
        setChecked(true);
        return;
      }

      try {
        const creds = await window.electronAPI.getCredentials();
        
        if (creds?.accessToken) {
          setAccessToken(creds.accessToken);
          await authService.refresh();
          router.replace('/dashboard');
        }
      } catch (e) {
        console.error('Auto-login failed:', e);
      } finally {
        setChecked(true);
      }
    }

    tryAutoLogin();
  }, [setAccessToken, isAuthenticated, router]);

  if (!checked && window.electronAPI) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="text-gray-600">Entrando automaticamente...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}