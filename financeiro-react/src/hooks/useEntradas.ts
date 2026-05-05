// ============================================================
// HOOK: useEntradas
// Encapsula estado de entradas com loading/error/CRUD
// ============================================================

import { useCallback, useEffect, useState } from 'react';
import { getEntradas, createEntrada, updateEntrada, deleteEntrada } from '@/services/entradas.service';
import type { Entrada } from '@/types';

interface UseEntradasOptions {
  tipo?: string;
  mes?: number;
  ano?: number;
}

export function useEntradas(options: UseEntradasOptions = {}) {
  const [entradas, setEntradas] = useState<Entrada[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getEntradas(options);
      const arr = Array.isArray(data) ? data : ((data as unknown as { entradas?: unknown[] })?.entradas ?? (data as unknown as { items?: unknown[] })?.items ?? []);
      setEntradas(arr as Entrada[]);
    } catch {
      setError('Erro ao carregar entradas');
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.tipo, options.mes, options.ano]);

  useEffect(() => { fetch(); }, [fetch]);

  async function criar(data: Omit<Entrada, 'id'>) {
    const nova = await createEntrada(data);
    setEntradas(prev => [nova, ...prev]);
  }

  async function atualizar(id: number, data: Partial<Entrada>) {
    const atualizada = await updateEntrada(id, data);
    setEntradas(prev => prev.map(e => e.id === id ? atualizada : e));
  }

  async function excluir(id: number) {
    await deleteEntrada(id);
    setEntradas(prev => prev.filter(e => e.id !== id));
  }

  return { entradas, isLoading, error, criar, atualizar, excluir, refetch: fetch };
}
