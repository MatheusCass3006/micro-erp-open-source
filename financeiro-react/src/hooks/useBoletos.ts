// ============================================================
// HOOK: useBoletos
// Encapsula toda lógica de CRUD de boletos
// ============================================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Boleto, BoletoForm } from '@/types';
import { getBoletos, createBoleto, updateBoleto, deleteBoleto } from '@/services/boletos.service';

interface UseBoletosFiltros {
  status?: string;
  mes?: number;
}

interface UseBoletosResult {
  boletos: Boleto[];
  isLoading: boolean;
  error: string | null;
  criar: (data: BoletoForm) => Promise<void>;
  atualizar: (id: number, data: Partial<Boleto>) => Promise<void>;
  excluir: (id: number) => Promise<void>;
  refetch: () => void;
}

export function useBoletos(filtros?: UseBoletosFiltros): UseBoletosResult {
  const [boletos, setBoletos] = useState<Boleto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getBoletos(filtros);
      const arr = Array.isArray(result) ? result : ((result as unknown as { boletos?: unknown[] })?.boletos ?? (result as unknown as { items?: unknown[] })?.items ?? []);
      setBoletos(arr as Boleto[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar boletos');
    } finally {
      setIsLoading(false);
    }
  }, [filtros?.status, filtros?.mes]);

  useEffect(() => { fetch(); }, [fetch]);

  const criar = async (data: BoletoForm) => {
    const novo = await createBoleto(data);
    setBoletos(prev => [novo, ...prev]);
  };

  const atualizar = async (id: number, data: Partial<Boleto>) => {
    const atualizado = await updateBoleto(id, data);
    setBoletos(prev => prev.map(b => b.id === id ? atualizado : b));
  };

  const excluir = async (id: number) => {
    await deleteBoleto(id);
    setBoletos(prev => prev.filter(b => b.id !== id));
  };

  return { boletos, isLoading, error, criar, atualizar, excluir, refetch: fetch };
}
