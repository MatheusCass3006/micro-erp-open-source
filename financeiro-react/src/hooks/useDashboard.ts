// ============================================================
// HOOK: useDashboard
// Encapsula: loading, error, fetch, refetch do dashboard
// Seguindo: Checklist Fullstack → Item 2 (React Hooks)
// ============================================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { DashboardData } from '@/types';
import { getDashboard } from '@/services/dashboard.service';
import { getMesAtual, getAnoAtual } from '@/utils/formatters';

interface UseDashboardResult {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  mes: number;
  ano: number;
  setMes: (mes: number) => void;
  setAno: (ano: number) => void;
  refetch: () => void;
}

export function useDashboard(): UseDashboardResult {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mes, setMes] = useState(getMesAtual());
  const [ano, setAno] = useState(getAnoAtual());

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getDashboard(mes, ano);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [mes, ano]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, isLoading, error, mes, ano, setMes, setAno, refetch: fetch };
}
