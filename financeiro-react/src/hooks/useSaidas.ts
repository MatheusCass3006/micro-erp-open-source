// ============================================================
// HOOK: useSaidas
// ============================================================

import { useCallback, useEffect, useState } from 'react';
import { getSaidas, createSaida, updateSaida, deleteSaida } from '@/services/saidas.service';
import type { Saida } from '@/types';

interface UseSaidasOptions {
  categoria?: string;
  mes?: number;
  ano?: number;
}

export function useSaidas(options: UseSaidasOptions = {}) {
  const [saidas, setSaidas] = useState<Saida[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getSaidas(options);
      const arr = Array.isArray(data) ? data : ((data as unknown as { saidas?: unknown[] })?.saidas ?? (data as unknown as { items?: unknown[] })?.items ?? []);
      setSaidas(arr as Saida[]);
    } catch {
      setError('Erro ao carregar saídas');
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.categoria, options.mes, options.ano]);

  useEffect(() => { fetch(); }, [fetch]);

  async function criar(data: Omit<Saida, 'id'>) {
    const nova = await createSaida(data);
    setSaidas(prev => [nova, ...prev]);
  }

  async function atualizar(id: number, data: Partial<Saida>) {
    const atualizada = await updateSaida(id, data);
    setSaidas(prev => prev.map(s => s.id === id ? atualizada : s));
  }

  async function excluir(id: number) {
    await deleteSaida(id);
    setSaidas(prev => prev.filter(s => s.id !== id));
  }

  return { saidas, isLoading, error, criar, atualizar, excluir, refetch: fetch };
}
