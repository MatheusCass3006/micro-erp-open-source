'use client';

// ============================================================
// HOOK: useMaquininhas — ITEM 01
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import type { Maquininha } from '@/types';
import {
  getMaquininhas, createMaquininha, updateMaquininha,
  deleteMaquininha, toggleMaquininha,
} from '@/services/maquininhas.service';

interface UseMaquininhsResult {
  maquininhas: Maquininha[];
  isLoading:   boolean;
  error:        string | null;
  criar:        (data: Omit<Maquininha, 'id'>) => Promise<void>;
  atualizar:    (id: number, data: Partial<Omit<Maquininha, 'id'>>) => Promise<void>;
  excluir:      (id: number) => Promise<void>;
  toggle:       (id: number, ativo: boolean) => Promise<void>;
  refetch:      () => void;
}

export function useMaquininhas(): UseMaquininhsResult {
  const [maquininhas, setMaquininhas] = useState<Maquininha[]>([]);
  const [isLoading,   setIsLoading]   = useState(true);
  const [error,       setError]       = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getMaquininhas();
      const arr = Array.isArray(result) ? result : ((result as unknown as { maquininhas?: unknown[] })?.maquininhas ?? (result as unknown as { items?: unknown[] })?.items ?? []);
      setMaquininhas(arr as Maquininha[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar maquininhas');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const criar = async (data: Omit<Maquininha, 'id'>) => {
    const nova = await createMaquininha(data);
    setMaquininhas(prev => [nova, ...prev]);
  };

  const atualizar = async (id: number, data: Partial<Omit<Maquininha, 'id'>>) => {
    const atualizada = await updateMaquininha(id, data);
    setMaquininhas(prev => prev.map(m => m.id === id ? atualizada : m));
  };

  const excluir = async (id: number) => {
    await deleteMaquininha(id);
    setMaquininhas(prev => prev.filter(m => m.id !== id));
  };

  const toggle = async (id: number, ativo: boolean) => {
    const atualizada = await toggleMaquininha(id, ativo);
    setMaquininhas(prev => prev.map(m => m.id === id ? atualizada : m));
  };

  return { maquininhas, isLoading, error, criar, atualizar, excluir, toggle, refetch: fetch };
}
