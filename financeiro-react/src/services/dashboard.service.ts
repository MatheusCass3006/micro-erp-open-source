// ============================================================
// DASHBOARD SERVICE — MicroERP
// Conectado ao backend Node.js (3 endpoints em paralelo):
//   GET /api/dashboard/resumo
//   GET /api/dashboard/evolucao
//   GET /api/dashboard/top-despesas
// ============================================================

import type { DashboardData } from '@/types';
import { mockDashboard } from '@/mocks/data';
import { api } from '@/services/api';

const USE_MOCK  = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

// Tipos internos que espelham o contrato do backend
interface ResumoBackend {
  entradas:  { bruto: number; liquido: number; taxa_total: number };
  saidas:    { total: number };
  saldo:     { valor: number; positivo: boolean };
  boletos:   { pendentes: number; valor_pendente: number };
  notas:     { quantidade: number; valor_total: number };
}

interface EvolucaoItem {
  mes: number;
  ano: number;
  mes_nome: string;
  entradas: number;
  saidas: number;
  saldo: number;
}

interface TopDespesaItem {
  categoria: string;
  secao: string;
  total: number;
}

export async function getDashboard(mes: number, ano: number): Promise<DashboardData> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 300));
    return mockDashboard;
  }

  // Dispara as 3 chamadas em paralelo via api.ts (com Authorization: Bearer header)
  const [resumo, evolucao, topDespesas] = await Promise.all([
    api.get<ResumoBackend>(`/api/dashboard/resumo?mes=${mes}&ano=${ano}`),
    api.get<EvolucaoItem[]>(`/api/dashboard/evolucao?meses=6`),
    api.get<TopDespesaItem[]>(`/api/dashboard/top-despesas?mes=${mes}&ano=${ano}`),
  ]);

  return {
    total_entradas_bruto:   resumo.entradas.bruto,
    total_entradas_liquido: resumo.entradas.liquido,
    total_taxas:            resumo.entradas.taxa_total,
    total_saidas:           resumo.saidas.total,
    saldo_mes:              resumo.saldo.valor,
    saldo_positivo:         resumo.saldo.positivo,
    boletos_pendentes:      resumo.boletos.pendentes,
    valor_boletos_pendentes: resumo.boletos.valor_pendente,
    notas_quantidade:       resumo.notas.quantidade,
    notas_valor_total:      resumo.notas.valor_total,
    saidas_por_categoria:   topDespesas,
    grafico_meses: evolucao.map(e => ({
      mes:      e.mes_nome,
      entradas: e.entradas,
      saidas:   e.saidas,
      saldo:    e.saldo,
    })),
  };
}
