'use client';

// ============================================================
// PÁGINA: Estoque — ITEM 12
// Extrai itens das notas fiscais processadas, agrupa por
// produto (código ou nome), soma quantidades e calcula
// valor total em estoque.
// Fonte: GET /api/notas → nota.itens[]
// ============================================================

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getNotas } from '@/services/notas.service';
import { formatCurrency } from '@/utils/formatters';
import { PageLoading } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import type { NotaItem } from '@/types';

// ── Tipos internos ────────────────────────────────────────────

interface ItemEstoque {
  chave:          string;   // código (se houver) ou nome normalizado
  produto:        string;   // nome exibível
  codigo:         string;
  unidade:        string;
  quantidade:     number;   // soma de todas as notas
  valor_unitario: number;   // valor médio ponderado
  valor_total:    number;   // quantidade × valor_unitario
  notas:          string[]; // números das notas de origem
}

// ── Helpers ──────────────────────────────────────────────────

/** Agrupa NotaItem[] (de todas as notas) por produto/código */
function agruparItens(
  pares: { item: NotaItem; notaNumero: string }[]
): ItemEstoque[] {
  const mapa = new Map<string, ItemEstoque>();

  for (const { item, notaNumero } of pares) {
    // Chave de agrupamento: código prioritário; fallback = nome em lower
    const chave = item.codigo?.trim()
      ? item.codigo.trim().toUpperCase()
      : item.produto.trim().toLowerCase();

    if (mapa.has(chave)) {
      const existente = mapa.get(chave)!;
      const novaQtd   = existente.quantidade + item.quantidade;

      // Valor unitário médio ponderado
      const novoValorUnit =
        (existente.valor_unitario * existente.quantidade +
          item.valor_unitario * item.quantidade) / novaQtd;

      existente.quantidade     = novaQtd;
      existente.valor_unitario = novoValorUnit;
      existente.valor_total    = novaQtd * novoValorUnit;

      if (!existente.notas.includes(notaNumero)) {
        existente.notas.push(notaNumero);
      }
    } else {
      mapa.set(chave, {
        chave,
        produto:        item.produto,
        codigo:         item.codigo ?? '',
        unidade:        item.unidade,
        quantidade:     item.quantidade,
        valor_unitario: item.valor_unitario,
        valor_total:    item.quantidade * item.valor_unitario,
        notas:          [notaNumero],
      });
    }
  }

  // Ordena por valor_total desc
  return Array.from(mapa.values()).sort((a, b) => b.valor_total - a.valor_total);
}

// ── Estilos ───────────────────────────────────────────────────

const card = 'rounded-2xl border border-gray-100 dark:border-[#2a2a32] bg-white dark:bg-[#1a1a1f] shadow-sm';
const th   = 'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-zinc-500';
const td   = 'px-4 py-3 text-sm';

// ─────────────────────────────────────────────────────────────

export default function EstoquePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [erro,      setErro]      = useState('');

  // Todos os pares (item + nota de origem)
  const [pares, setPares] = useState<{ item: NotaItem; notaNumero: string }[]>([]);

  // Filtros
  const [busca,  setBusca]  = useState('');
  const [ordena, setOrdena] = useState<'valor' | 'nome' | 'qtd'>('valor');

  useEffect(() => {
    (async () => {
      try {
        const notasRaw = await getNotas();
        const notas = Array.isArray(notasRaw) ? notasRaw : ((notasRaw as unknown as { notas?: unknown[] })?.notas ?? (notasRaw as unknown as { items?: unknown[] })?.items ?? []) as typeof notasRaw;
        const todos: { item: NotaItem; notaNumero: string }[] = [];

        for (const nota of notas) {
          if (!nota.itens || nota.itens.length === 0) continue;
          for (const item of nota.itens) {
            todos.push({ item, notaNumero: nota.numero });
          }
        }

        setPares(todos);
      } catch (err) {
        setErro(err instanceof Error ? err.message : 'Erro ao carregar notas');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Agrupa e filtra
  const itens = useMemo(() => {
    let resultado = agruparItens(pares);

    if (busca.trim()) {
      const b = busca.toLowerCase();
      resultado = resultado.filter(
        i =>
          i.produto.toLowerCase().includes(b) ||
          i.codigo.toLowerCase().includes(b)
      );
    }

    if (ordena === 'nome') resultado.sort((a, b) => a.produto.localeCompare(b.produto));
    if (ordena === 'qtd')  resultado.sort((a, b) => b.quantidade - a.quantidade);
    // 'valor' já é o padrão do agruparItens

    return resultado;
  }, [pares, busca, ordena]);

  // KPIs
  const totalItens     = itens.length;
  const totalQtd       = itens.reduce((s, i) => s + i.quantidade, 0);
  const totalValor     = itens.reduce((s, i) => s + i.valor_total, 0);
  const fonteNotas     = new Set(pares.map(p => p.notaNumero)).size;

  if (isLoading) return <PageLoading />;

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">📦 Estoque</h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-zinc-400">
            Itens extraídos de {fonteNotas} nota{fonteNotas !== 1 ? 's' : ''} fiscal
            {fonteNotas !== 1 ? 'is' : ''}
          </p>
        </div>
        <Link
          href="/notas"
          className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-[#3a3a44] px-4 py-2 text-sm font-medium text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-[#27272d] transition-colors"
        >
          <i className="bi bi-receipt" /> Ver Notas
        </Link>
      </div>

      {/* Erro */}
      {erro && (
        <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 px-4 py-3">
          <p className="text-sm text-red-700 dark:text-red-400">❌ {erro}</p>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          {
            label: 'Produtos',
            value: totalItens,
            color: 'text-gray-900 dark:text-zinc-100',
            bg:    'bg-white dark:bg-[#1a1a1f]',
            icon:  'bi-box-seam',
          },
          {
            label: 'Qtd. em Estoque',
            value: totalQtd.toLocaleString('pt-BR'),
            color: 'text-blue-700 dark:text-blue-400',
            bg:    'bg-blue-50 dark:bg-blue-950/40',
            icon:  'bi-layers',
          },
          {
            label: 'Valor Total',
            value: formatCurrency(totalValor),
            color: 'text-indigo-700 dark:text-indigo-400',
            bg:    'bg-indigo-50 dark:bg-indigo-950/40',
            icon:  'bi-currency-dollar',
          },
          {
            label: 'Notas de Origem',
            value: fonteNotas,
            color: 'text-emerald-700 dark:text-emerald-400',
            bg:    'bg-emerald-50 dark:bg-emerald-950/40',
            icon:  'bi-receipt',
          },
        ].map(c => (
          <div
            key={c.label}
            className={`rounded-2xl border border-gray-100 dark:border-[#2a2a32] ${c.bg} p-4 shadow-sm`}
          >
            <div className="flex items-center gap-2 mb-1">
              <i className={`bi ${c.icon} text-sm ${c.color}`} />
              <p className="text-xs text-gray-500 dark:text-zinc-400">{c.label}</p>
            </div>
            <p className={`text-lg font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Busca */}
        <div className="relative flex-1 min-w-[200px]">
          <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 text-sm" />
          <input
            type="text"
            placeholder="Buscar produto ou código..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="w-full rounded-xl border border-gray-200 dark:border-[#3a3a44] bg-white dark:bg-[#111118] pl-9 pr-4 py-2 text-sm text-gray-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* Ordenação */}
        <div className="flex rounded-xl border border-gray-200 dark:border-[#3a3a44] overflow-hidden text-sm">
          {([
            ['valor', 'Valor'],
            ['nome',  'Nome'],
            ['qtd',   'Quantidade'],
          ] as const).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setOrdena(val)}
              className={`px-3 py-2 transition-colors ${
                ordena === val
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-[#27272d]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela */}
      <div className={`overflow-hidden ${card}`}>
        {itens.length === 0 ? (
          <EmptyState
            icon="bi-boxes"
            title={busca ? 'Nenhum produto encontrado' : 'Estoque vazio'}
            description={
              busca
                ? 'Tente outro termo de busca.'
                : 'Adicione itens às notas fiscais para que apareçam aqui.'
            }
            actionLabel="Ver Notas Fiscais"
            onAction={() => { window.location.href = '/notas'; }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 dark:border-[#2a2a32] bg-gray-50 dark:bg-[#111118]">
                <tr>
                  <th className={th}>Produto</th>
                  <th className={th}>Código</th>
                  <th className={th}>Qtd.</th>
                  <th className={th}>Un.</th>
                  <th className={th}>Vlr. Unit.</th>
                  <th className={th}>Total em Estoque</th>
                  <th className={th}>Notas de Origem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-[#2a2a32]">
                {itens.map(item => (
                  <tr
                    key={item.chave}
                    className="hover:bg-gray-50 dark:hover:bg-[#27272d] transition-colors"
                  >
                    <td className={`${td} font-medium text-gray-900 dark:text-zinc-100 max-w-[200px]`}>
                      <span className="block truncate" title={item.produto}>
                        {item.produto}
                      </span>
                    </td>

                    <td className={`${td} font-mono text-gray-500 dark:text-zinc-400`}>
                      {item.codigo || <span className="text-gray-300 dark:text-zinc-600">—</span>}
                    </td>

                    <td className={`${td} font-bold text-blue-700 dark:text-blue-400`}>
                      {item.quantidade.toLocaleString('pt-BR')}
                    </td>

                    <td className={`${td} text-gray-500 dark:text-zinc-400`}>
                      {item.unidade}
                    </td>

                    <td className={`${td} text-gray-700 dark:text-zinc-300`}>
                      {formatCurrency(item.valor_unitario)}
                    </td>

                    <td className={`${td} font-semibold text-indigo-700 dark:text-indigo-400`}>
                      {formatCurrency(item.valor_total)}
                    </td>

                    <td className={`${td} text-gray-500 dark:text-zinc-400`}>
                      <div className="flex flex-wrap gap-1">
                        {item.notas.map(n => (
                          <span
                            key={n}
                            className="rounded-full bg-gray-100 dark:bg-[#27272d] px-2 py-0.5 text-xs"
                          >
                            {n}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>

              {/* Rodapé com total */}
              <tfoot className="border-t border-gray-100 dark:border-[#2a2a32] bg-gray-50 dark:bg-[#111118]">
                <tr>
                  <td colSpan={5} className={`${td} font-semibold text-gray-700 dark:text-zinc-300`}>
                    Total ({totalItens} produto{totalItens !== 1 ? 's' : ''})
                  </td>
                  <td className={`${td} font-bold text-indigo-700 dark:text-indigo-400`}>
                    {formatCurrency(totalValor)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Info */}
      {pares.length === 0 && !erro && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-4 py-3">
          <p className="text-sm text-amber-700 dark:text-amber-400">
            💡 O estoque é montado automaticamente a partir dos{' '}
            <strong>itens das notas fiscais</strong>. Abra uma nota e adicione
            itens (produto, quantidade, valor unitário) para que apareçam aqui.
          </p>
        </div>
      )}

    </div>
  );
}
