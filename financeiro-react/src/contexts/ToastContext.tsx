'use client';

// ============================================================
// CONTEXT: Toast notifications global — ITEM 07
// Uso: const { success, error, warning, info } = useToast();
// ============================================================

import {
  createContext, useCallback, useContext, useState, ReactNode,
} from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id:       number;
  tipo:     ToastType;
  mensagem: string;
}

interface ToastContextValue {
  toasts:  ToastItem[];
  success: (msg: string) => void;
  error:   (msg: string) => void;
  warning: (msg: string) => void;
  info:    (msg: string) => void;
  remove:  (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let _nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const add = useCallback((tipo: ToastType, mensagem: string) => {
    const id = _nextId++;
    setToasts(prev => [...prev, { id, tipo, mensagem }]);
    // Auto-dismiss: error fica 5s, outros 3s
    setTimeout(() => remove(id), tipo === 'error' ? 5000 : 3000);
  }, [remove]);

  // Métodos estabilizados com useCallback para evitar re-renders em cascata.
  // Sem isso, qualquer componente que liste esses métodos em deps de useCallback/useEffect
  // seria recriado toda vez que um toast aparece/desaparece (novo objeto no Provider).
  const success = useCallback((msg: string) => add('success', msg), [add]);
  const error   = useCallback((msg: string) => add('error',   msg), [add]);
  const warning = useCallback((msg: string) => add('warning', msg), [add]);
  const info    = useCallback((msg: string) => add('info',    msg), [add]);

  return (
    <ToastContext.Provider value={{ toasts, success, error, warning, info, remove }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToastContext(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast deve ser usado dentro de <ToastProvider>');
  return ctx;
}
