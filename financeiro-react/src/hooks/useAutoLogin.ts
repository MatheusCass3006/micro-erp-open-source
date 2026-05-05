"use client";

declare global {
  interface Window {
    electronAPI?: {
      getCredentials: () => Promise<{
        email?: string;
        password?: string;
        accessToken?: string;
        refreshToken?: string;
      } | null>;
      saveCredentials: (creds: {
        email?: string;
        password?: string;
        accessToken?: string;
        refreshToken?: string;
      }) => Promise<void>;
      clearCredentials: () => Promise<void>;
      getAppPath: () => Promise<string>;
    };
  }
}

import { useState, useEffect, useCallback } from 'react';
import { authService } from '@/services/auth.service';
import { useAuth } from '@/hooks/useAuth';

export function useAutoLogin() {
  const { setAccessToken, checkAuth } = useAuth();
  const [autoLoginAttempted, setAutoLoginAttempted] = useState(false);
  const [autoLoginLoading, setAutoLoginLoading] = useState(true);

  const performAutoLogin = useCallback(async () => {
    if (!window.electronAPI) {
      setAutoLoginLoading(false);
      return;
    }

    setAutoLoginLoading(true);
    try {
      const creds = await window.electronAPI.getCredentials();
      
      if (creds?.accessToken) {
        setAccessToken(creds.accessToken);
        await checkAuth();
      }
    } catch (e) {
      console.error('Auto-login failed:', e);
    } finally {
      setAutoLoginLoading(false);
      setAutoLoginAttempted(true);
    }
  }, [setAccessToken, checkAuth]);

  useEffect(() => {
    performAutoLogin();
  }, [performAutoLogin]);

  const saveCredentials = useCallback(async (email: string, password: string, accessToken: string, refreshToken?: string) => {
    if (window.electronAPI) {
      await window.electronAPI.saveCredentials({
        email,
        password,
        accessToken,
        refreshToken,
      });
    }
  }, []);

  const clearCredentials = useCallback(async () => {
    if (window.electronAPI) {
      await window.electronAPI.clearCredentials();
    }
  }, []);

  return {
    autoLoginAttempted,
    autoLoginLoading,
    saveCredentials,
    clearCredentials,
    isElectron: !!window.electronAPI,
  };
}