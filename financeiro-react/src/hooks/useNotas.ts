// ============================================================
// HOOK: useNotas
// ============================================================

import { useCallback, useEffect, useState } from 'react';
import { getNotas, createNota, updateNota, deleteNota } from '@/services/notas.service';
import type { Nota } from '@/types';

export function useNotas() {
  const [notas, setNotas] = useState<Nota[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getNotas();
      // Garante array mesmo se backend retornar objeto paginado
      const arr = Array.isArray(data) ? data : ((data as unknown as { notas?: unknown[] })?.notas ?? (data as unknown as { items?: unknown[] })?.items ?? []);
      setNotas(arr as Nota[]);
    } catch {
      setError('Erro ao carregar notas');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  async function criar(data: Omit<Nota, 'id'>) {
    const nova = await createNota(data);
    setNotas(prev => [nova, ...prev]);
  }

  async function atualizar(id: number, data: Partial<Omit<Nota, 'id'>>) {
    const atualizada = await updateNota(id, data);
    setNotas(prev => prev.map(n => n.id === id ? atualizada : n));
  }

  async function excluir(id: number) {
    await deleteNota(id);
    setNotas(prev => prev.filter(n => n.id !== id));
  }

  return { notas, isLoading, error, criar, atualizar, excluir, refetch: fetch };
}
