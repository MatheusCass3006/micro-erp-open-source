// ============================================================
// COMPONENTE: StatsRow
// 4 cards de KPIs do dashboard — baseado no contrato real do backend Node.js
// ============================================================

import { StatCard } from '@/components/ui/StatCard';
import type { DashboardData } from '@/types';
import { formatCurrency } from '@/utils/formatters';

interface StatsRowProps {
  data: DashboardData;
}

export function StatsRow({ data }: StatsRowProps) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard
        label="Recebido Líquido"
        value={formatCurrency(data.total_entradas_liquido)}
        subtitle={`Bruto: ${formatCurrency(data.total_entradas_bruto)}`}
        icon="bi-arrow-down-circle"
        gradient="green"
      />
      <StatCard
        label="Saídas do Mês"
        value={formatCurrency(data.total_saidas)}
        subtitle={`Taxas: ${formatCurrency(data.total_taxas)}`}
        icon="bi-arrow-up-circle"
        gradient="red"
      />
      <StatCard
        label="Saldo do Mês"
        value={formatCurrency(data.saldo_mes)}
        subtitle={data.saldo_positivo ? 'Positivo ✓' : 'Negativo ⚠️'}
        icon="bi-wallet2"
        gradient={data.saldo_positivo ? 'blue' : 'orange'}
      />
      <StatCard
        label="Boletos Pendentes"
        value={formatCurrency(data.valor_boletos_pendentes)}
        subtitle={`${data.boletos_pendentes} boleto(s) em aberto`}
        icon="bi-file-earmark-text"
        gradient="orange"
      />
    </div>
  );
}
