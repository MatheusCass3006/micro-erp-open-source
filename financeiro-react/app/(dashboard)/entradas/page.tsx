'use client';

// ============================================================
// PÁGINA: Entradas — ITEM 02
// Dropdown de maquininhas com auto-preenchimento de taxa e
// cálculo automático de valor líquido em tempo real.
// ============================================================

import { useEffect, useState } from 'react';
import { useEntradas } from '@/hooks/useEntradas';
import { getMaquininhas } from '@/services/maquininhas.service';
import { useToast } from '@/hooks/useToast';
import { Badge } from '@/components/ui/Badge';
import { PageLoading } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, formatDate } from '@/utils/formatters';
import type { Entrada, Maquininha } from '@/types';

const TIPOS = [
  { value: 'dinheiro',      label: 'Dinheiro',      icon: '💵' },
  { value: 'pix',           label: 'PIX',            icon: '⚡' },
  { value: 'debito',        label: 'Débito',         icon: '💳' },
  { value: 'credito',       label: 'Crédito',        icon: '💳' },
  { value: 'transferencia', label: 'Transferência',  icon: '🏦' },
  { value: 'alimentacao',   label: 'Alimentação',    icon: '🍽️' },
];

const FORM_VAZIO = {
  descricao:       '',
  valor_bruto:     '',
  taxa_percentual: '0',
  tipo:            'pix',
  maquininha_id:   'manual', // 'manual' ou id como string
  data:            new Date().toISOString().split('T')[0],
};

const card  = 'rounded-2xl border border-gray-100 dark:border-[#2a2a32] bg-white dark:bg-[#1a1a1f] shadow-sm';
const label = 'mb-1 block text-xs font-semibold text-gray-600 dark:text-zinc-400';
const input = 'w-full rounded-xl border border-gray-200 dark:border-[#3a3a44] bg-white dark:bg-[#111118] px-3 py-2 text-sm text-gray-900 dark:text-zinc-100 focus:outline-none focus:border-green-500 dark:focus:border-green-400 placeholder:text-gray-400 dark:placeholder:text-zinc-600';
const sel   = 'w-full rounded-xl border border-gray-200 dark:border-[#3a3a44] bg-white dark:bg-[#111118] px-3 py-2 text-sm text-gray-900 dark:text-zinc-100 focus:outline-none';

export default function EntradasPage() {
  const [filtroTipo, setFiltroTipo] = useState('');
  const { entradas, isLoading, criar, atualizar, excluir } = useEntradas({ tipo: filtroTipo || undefined });
  const { success, error: toastError } = useToast();

  // Maquininhas carregadas da API
  const [maquininhas, setMaquininhas] = useState<Maquininha[]>([]);
  useEffect(() => {
    getMaquininhas().then(ms => setMaquininhas(ms.filter(m => m.ativo)));
  }, []);

  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando]       = useState<Entrada | null>(null);
  const [form, setForm]               = useState(FORM_VAZIO);
  const [salvando, setSalvando]       = useState(false);

  if (isLoading) return <PageLoading />;

  // ── KPIs ────────────────────────────────────────────────────
  const totalBruto   = entradas.reduce((s, e) => s + e.valor_bruto, 0);
  const totalTaxas   = entradas.reduce((s, e) => s + (e.valor_bruto - e.valor_liquido), 0);
  const totalLiquido = entradas.reduce((s, e) => s + e.valor_liquido, 0);

  // ── Helpers ─────────────────────────────────────────────────
  function maquininhaById(id: string): Maquininha | undefined {
    return maquininhas.find(m => String(m.id) === id);
  }

  /** Calcula valor líquido com a taxa atual do form */
  function calcLiquido(bruto: string, taxa: string): number {
    const b = parseFloat(bruto) || 0;
    const t = parseFloat(taxa)  || 0;
    return parseFloat((b * (1 - t / 100)).toFixed(2));
  }

  // ── Handlers ────────────────────────────────────────────────
  function abrirNova() {
    setEditando(null);
    setForm(FORM_VAZIO);
    setModalAberto(true);
  }

  function abrirEditar(e: Entrada) {
    setEditando(e);
    setForm({
      descricao:       e.descricao,
      valor_bruto:     String(e.valor_bruto),
      taxa_percentual: String(e.taxa_percentual),
      tipo:            e.tipo,
      maquininha_id:   'manual',
      data:            e.data,
    });
    setModalAberto(true);
  }

  /** Ao selecionar maquininha: auto-preenche taxa e tipo */
  function handleSelectMaquininha(id: string) {
    if (id === 'manual') {
      setForm(p => ({ ...p, maquininha_id: 'manual', taxa_percentual: '0' }));
      return;
    }
    const m = maquininhaById(id);
    if (m) {
      setForm(p => ({
        ...p,
        maquininha_id:   String(m.id),
        taxa_percentual: String(m.taxa),
        tipo:            m.tipo,
      }));
    }
  }

  async function handleSalvar(ev: React.FormEvent) {
    ev.preventDefault();
    setSalvando(true);
    const maq = maquininhaById(form.maquininha_id);
    const payload: Omit<Entrada, 'id'> = {
      descricao:       form.descricao,
      valor_bruto:     parseFloat(form.valor_bruto),
      valor_liquido:   calcLiquido(form.valor_bruto, form.taxa_percentual),
      taxa_percentual: parseFloat(form.taxa_percentual),
      tipo:            form.tipo as Entrada['tipo'],
      maquininha:      maq ? maq.nome : undefined,
      maquininha_id:   maq ? maq.id : undefined, // vincula id real para o backend calcular taxa
      data:            form.data,
    };
    try {
      if (editando) { await atualizar(editando.id, payload); success('Entrada atualizada!'); }
      else          { await criar(payload);                  success('Entrada registrada!'); }
      setModalAberto(false);
    } catch {
      toastError('Erro ao salvar entrada.');
    } finally {
      setSalvando(false);
    }
  }

  async function handleExcluir(id: number) {
    try { await excluir(id); success('Entrada excluída.'); }
    catch { toastError('Erro ao excluir.'); }
  }

  // Preview em tempo real
  const liquido = calcLiquido(form.valor_bruto, form.taxa_percentual);
  const desconto = (parseFloat(form.valor_bruto) || 0) - liquido;

  return (
    <div className="space-y-4">

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Bruto',   value: totalBruto,   cls: 'text-gray-900 dark:text-zinc-100',   bg: 'bg-white dark:bg-[#1a1a1f]' },
          { label: 'Total Taxas',   value: totalTaxas,   cls: 'text-red-600 dark:text-red-400',     bg: 'bg-red-50 dark:bg-red-950/40' },
          { label: 'Total Líquido', value: totalLiquido, cls: 'text-green-700 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-950/40' },
        ].map(c => (
          <div key={c.label} className={`rounded-2xl border border-gray-100 dark:border-[#2a2a32] ${c.bg} p-4 shadow-sm`}>
            <p className="text-xs text-gray-500 dark:text-zinc-400">{c.label}</p>
            <p className={`text-lg font-bold ${c.cls}`}>{formatCurrency(c.value)}</p>
          </div>
        ))}
      </div>

      {/* Ações */}
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={abrirNova} className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors">
          <i className="bi bi-plus-lg" /> Nova Entrada
        </button>
        <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} className={`${sel} w-auto`}>
          <option value="">Todos os tipos</option>
          {TIPOS.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
        </select>
      </div>

      {/* Tabela */}
      <div className={`overflow-hidden ${card}`}>
        {entradas.length === 0 ? (
          <EmptyState icon="bi-arrow-down-circle" title="Nenhuma entrada" description="Registre seu primeiro recebimento" actionLabel="Nova Entrada" onAction={abrirNova} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 dark:border-[#2a2a32] bg-gray-50 dark:bg-[#111118]">
                <tr>
                  {['Data','Descrição','Tipo','Maquininha','Valor Bruto','Taxa','Valor Líquido','Ações'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-zinc-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-[#2a2a32]">
                {entradas.map(e => (
                  <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-[#27272d] transition-colors">
                    <td className="px-4 py-3 text-gray-500 dark:text-zinc-400">{formatDate(e.data)}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-zinc-100">{e.descricao || '—'}</td>
                    <td className="px-4 py-3"><Badge status={e.tipo} /></td>
                    <td className="px-4 py-3 text-gray-600 dark:text-zinc-400 text-xs">{e.maquininha || '—'}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-zinc-300">{formatCurrency(e.valor_bruto)}</td>
                    <td className="px-4 py-3 text-red-500 dark:text-red-400">{e.taxa_percentual}%</td>
                    <td className="px-4 py-3 font-semibold text-green-700 dark:text-green-400">{formatCurrency(e.valor_liquido)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => abrirEditar(e)} className="rounded-lg bg-gray-100 dark:bg-[#27272d] px-2 py-1 text-xs hover:bg-gray-200 transition-colors">✏️</button>
                        <button onClick={() => handleExcluir(e.id)} className="rounded-lg bg-red-100 dark:bg-red-950/50 px-2 py-1 text-xs text-red-600 hover:bg-red-200 transition-colors">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal criar/editar */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1a1a1f] border border-gray-100 dark:border-[#2a2a32] p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">
                {editando ? '✏️ Editar Entrada' : '💵 Nova Entrada'}
              </h2>
              <button onClick={() => setModalAberto(false)} className="text-gray-400 hover:text-gray-600"><i className="bi bi-x-lg" /></button>
            </div>

            <form onSubmit={handleSalvar} className="space-y-4">
              <div>
                <label className={label}>Descrição *</label>
                <input required value={form.descricao} onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))} className={input} placeholder="Ex: Venda produto X" />
              </div>

              {/* Maquininha — ITEM 02: dropdown com auto-taxa */}
              <div>
                <label className={label}>Maquininha / Forma de Recebimento *</label>
                <select
                  value={form.maquininha_id}
                  onChange={e => handleSelectMaquininha(e.target.value)}
                  className={sel}
                >
                  <option value="manual">Manual (sem maquininha)</option>
                  {maquininhas.map(m => (
                    <option key={m.id} value={String(m.id)}>
                      {m.nome} — {m.taxa}% taxa
                    </option>
                  ))}
                </select>
                {maquininhas.length === 0 && (
                  <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                    ⚠️ Nenhuma maquininha ativa. <a href="/maquininhas" className="underline">Cadastre uma</a>.
                  </p>
                )}
              </div>

              {/* Valor bruto + Taxa */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={label}>Valor Bruto (R$) *</label>
                  <input required type="number" step="0.01" min="0"
                    value={form.valor_bruto}
                    onChange={e => setForm(p => ({ ...p, valor_bruto: e.target.value }))}
                    className={input} placeholder="0,00" />
                </div>
                <div>
                  <label className={label}>Taxa (%)</label>
                  <input type="number" step="0.01" min="0" max="100"
                    value={form.taxa_percentual}
                    onChange={e => setForm(p => ({ ...p, taxa_percentual: e.target.value }))}
                    className={input} placeholder="0" />
                </div>
              </div>

              {/* Preview líquido em tempo real */}
              {form.valor_bruto && (
                <div className="rounded-xl bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 px-4 py-2.5 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-zinc-400">Valor líquido</span>
                    <strong className="text-green-700 dark:text-green-400 text-base">{formatCurrency(liquido)}</strong>
                  </div>
                  {desconto > 0 && (
                    <p className="text-xs text-red-500 dark:text-red-400 mt-0.5 text-right">
                      − {formatCurrency(desconto)} em taxa ({form.taxa_percentual}%)
                    </p>
                  )}
                </div>
              )}

              {/* Tipo */}
              <div>
                <label className={label}>Tipo *</label>
                <select value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))} className={sel}>
                  {TIPOS.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
                </select>
              </div>

              {/* Data */}
              <div>
                <label className={label}>Data *</label>
                <input required type="date" value={form.data} onChange={e => setForm(p => ({ ...p, data: e.target.value }))} className={input} />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalAberto(false)} className="flex-1 rounded-xl border border-gray-200 dark:border-[#3a3a44] py-2 text-sm text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-[#27272d] transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={salvando} className="flex-1 rounded-xl bg-green-600 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60 transition-colors">
                  {salvando ? 'Salvando...' : editando ? 'Salvar alterações' : 'Registrar Entrada'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
