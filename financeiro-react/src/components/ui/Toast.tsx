'use client';

// ============================================================
// COMPONENTE: Toast — notificações flutuantes globais
// Renderizado no layout raiz, empilha toasts no canto
// superior direito com auto-dismiss.
// ============================================================

import { useEffect, useState } from 'react';
import { useToastContext, ToastItem, ToastType } from '@/contexts/ToastContext';

// ── Paleta por tipo ────────────────────────────────────────────
const ESTILOS: Record<ToastType, { border: string; bg: string; text: string; icon: string }> = {
  success: {
    border: 'border-green-200 dark:border-green-800',
    bg:     'bg-green-50 dark:bg-green-950/80',
    text:   'text-green-800 dark:text-green-300',
    icon:   'bi-check-circle-fill text-green-500',
  },
  error: {
    border: 'border-red-200 dark:border-red-800',
    bg:     'bg-red-50 dark:bg-red-950/80',
    text:   'text-red-800 dark:text-red-300',
    icon:   'bi-x-circle-fill text-red-500',
  },
  warning: {
    border: 'border-amber-200 dark:border-amber-800',
    bg:     'bg-amber-50 dark:bg-amber-950/80',
    text:   'text-amber-800 dark:text-amber-300',
    icon:   'bi-exclamation-triangle-fill text-amber-500',
  },
  info: {
    border: 'border-blue-200 dark:border-blue-800',
    bg:     'bg-blue-50 dark:bg-blue-950/80',
    text:   'text-blue-800 dark:text-blue-300',
    icon:   'bi-info-circle-fill text-blue-500',
  },
};

// ── Item individual com animação de entrada ───────────────────
function ToastCard({ toast, onRemove }: { toast: ToastItem; onRemove: () => void }) {
  const [visivel, setVisivel] = useState(false);
  const e = ESTILOS[toast.tipo];

  // Pequeno delay para animar entrada
  useEffect(() => {
    const t = setTimeout(() => setVisivel(true), 20);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      role="alert"
      className={`
        flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm
        transition-all duration-300 max-w-sm
        ${e.border} ${e.bg}
        ${visivel ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}
      `}
    >
      <i className={`bi ${e.icon} mt-0.5 text-base flex-shrink-0`} />
      <p className={`flex-1 text-sm font-medium leading-snug ${e.text}`}>
        {toast.mensagem}
      </p>
      <button
        onClick={onRemove}
        className={`flex-shrink-0 text-sm opacity-50 hover:opacity-100 transition-opacity ${e.text}`}
        aria-label="Fechar"
      >
        <i className="bi bi-x-lg" />
      </button>
    </div>
  );
}

// ── Container principal ───────────────────────────────────────
export function ToastContainer() {
  const { toasts, remove } = useToastContext();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-2"
    >
      {toasts.map(t => (
        <ToastCard key={t.id} toast={t} onRemove={() => remove(t.id)} />
      ))}
    </div>
  );
}
