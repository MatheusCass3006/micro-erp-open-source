'use client';

import { useDashboard } from '@/hooks/useDashboard';
import { StatsRow } from '@/components/features/dashboard/StatsRow';
import { PageLoading } from '@/components/ui/LoadingSpinner';
import { MESES, formatCurrency, getAnosDisponiveis } from '@/utils/formatters';

const card = 'rounded-2xl border border-gray-100 dark:border-[#2a2a32] bg-white dark:bg-[#1a1a1f] shadow-sm';

export default function DashboardPage() {
  const { data, isLoading, error, mes, ano, setMes, setAno } = useDashboard();

  if (isLoading) return <PageLoading />;

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 p-6 text-center text-red-600 dark:text-red-400">
        <i className="bi bi-exclamation-triangle-fill mb-2 text-2xl" />
        <p>{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const maxVal = Math.max(
    ...data.grafico_meses.map(x => Math.max(x.entradas, x.saidas)),
    1
  );

  return (
    <div className="space-y-6">
      {/* Filtros de período */}
      <div className="flex gap-3">
        <select
          value={mes}
          onChange={e => setMes(Number(e.target.value))}
          className="rounded-lg border border-gray-200 dark:border-[#3a3a44] bg-white dark:bg-[#111118] px-3 py-2 text-sm text-gray-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none"
        >
          {MESES.map(m => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
        <select
          value={ano}
          onChange={e => setAno(Number(e.target.value))}
          className="rounded-lg border border-gray-200 dark:border-[#3a3a44] bg-white dark:bg-[#111118] px-3 py-2 text-sm text-gray-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none"
        >
          {getAnosDisponiveis().map(a => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      {/* Cards de estatística (KPIs) */}
      <StatsRow data={data} />

      {/* Gráfico + categorias */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Gráfico de barras — últimos 6 meses */}
        <div className={`lg:col-span-2 ${card} p-6`}>
          <h3 className="mb-4 text-sm font-semibold text-gray-700 dark:text-zinc-300">📈 Últimos 6 Meses</h3>
          <div className="space-y-3">
            {data.grafico_meses.map(g => (
              <div key={`${g.mes}`} className="flex items-center gap-3">
                <span className="w-10 text-xs text-gray-500 dark:text-zinc-500">{g.mes}</span>
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-5 rounded-full bg-green-400/80 transition-all duration-500"
                      style={{ width: `${Math.max((g.entradas / maxVal) * 100, 2)}%` }}
                    />
                    <span className="text-xs text-gray-500 dark:text-zinc-500">{formatCurrency(g.entradas)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-5 rounded-full bg-red-400/80 transition-all duration-500"
                      style={{ width: `${Math.max((g.saidas / maxVal) * 100, 2)}%` }}
                    />
                    <span className="text-xs text-gray-500 dark:text-zinc-500">{formatCurrency(g.saidas)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-4 pt-3 text-xs text-gray-500 dark:text-zinc-500">
            <span className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded bg-green-400/80" />
              Entradas
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded bg-red-400/80" />
              Saídas
            </span>
          </div>
        </div>

        {/* Painel lateral: Top despesas + Notas */}
        <div className="flex flex-col gap-4">
          {/* Saídas por categoria */}
          <div className={`${card} p-6 flex-1`}>
            <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-zinc-300">📤 Top Despesas</h3>
            {data.saidas_por_categoria.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-zinc-500">Nenhuma saída neste período.</p>
            ) : (
              <div className="space-y-2">
                {data.saidas_por_categoria.map(s => (
                  <div key={s.categoria} className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-[#27272d] px-3 py-2">
                    <span className="text-sm text-gray-700 dark:text-zinc-300">{s.categoria}</span>
                    <span className="text-sm font-semibold text-red-600 dark:text-red-400">{formatCurrency(s.total)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notas fiscais do mês */}
          <div className={`${card} p-5`}>
            <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-zinc-300">🧾 Notas Fiscais</h3>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-zinc-500">{data.notas_quantidade} nota(s) no mês</span>
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(data.notas_valor_total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alerta: boletos pendentes */}
      {data.boletos_pendentes > 0 && (
        <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <i className="bi bi-exclamation-triangle-fill text-amber-500" />
              <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-400">
                {data.boletos_pendentes} boleto(s) em aberto
              </h3>
            </div>
            <span className="text-sm font-bold text-amber-700 dark:text-amber-300">
              {formatCurrency(data.valor_boletos_pendentes)}
            </span>
          </div>
          <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
            Acesse a seção de Boletos para gerenciar os pagamentos pendentes.
          </p>
        </div>
      )}
    </div>
  );
}
