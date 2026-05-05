'use client';

// ============================================================
// PÁGINA: Maquininhas — ITEM 01
// CRUD completo: listar, criar, editar, excluir, toggle ativo.
// Desbloqueia: dropdown de maquininhas nas Entradas (ITEM 02).
// ============================================================

import { useState } from 'react';
import { useMaquininhas } from '@/hooks/useMaquininhas';
import { useToast } from '@/hooks/useToast';
import { PageLoading } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Maquininha, TipoPagamento } from '@/types';

// ── Constantes ────────────────────────────────────────────────
const TIPOS: { val: TipoPagamento; label: string; icon: string }[] = [
  { val: 'pix',          label: 'PIX',            icon: '⚡' },
  { val: 'debito',       label: 'Débito',          icon: '💳' },
  { val: 'credito',      label: 'Crédito',         icon: '💳' },
  { val: 'dinheiro',     label: 'Dinheiro',        icon: '💵' },
  { val: 'alimentacao',  label: 'Alimentação',     icon: '🍽️' },
  { val: 'transferencia',label: 'Transferência',   icon: '🏦' },
];

const TIPO_LABEL: Record<TipoPagamento, string> = Object.fromEntries(
  TIPOS.map(t => [t.val, t.label])
) as Record<TipoPagamento, string>;

const TIPO_ICON: Record<TipoPagamento, string> = Object.fromEntries(
  TIPOS.map(t => [t.val, t.icon])
) as Record<TipoPagamento, string>;

// ── Estilos ────────────────────────────────────────────────────
const card  = 'rounded-2xl border border-gray-100 dark:border-[#2a2a32] bg-white dark:bg-[#1a1a1f] shadow-sm';
const lbl   = 'mb-1 block text-xs font-semibold text-gray-600 dark:text-zinc-400';
const inp   = 'w-full rounded-xl border border-gray-200 dark:border-[#3a3a44] bg-white dark:bg-[#111118] px-3 py-2 text-sm text-gray-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none';
const th    = 'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-zinc-500';
const td    = 'px-4 py-3 text-sm';

// ── Form vazio ─────────────────────────────────────────────────
const FORM_VAZIO: Omit<Maquininha, 'id'> = {
  nome:  '',
  tipo:  'pix',
  taxa:  0,
  ativo: true,
};

// ─────────────────────────────────────────────────────────────

export default function MaquininhasPage() {
  const { maquininhas, isLoading, error, criar, atualizar, excluir, toggle } = useMaquininhas();
  const { success, error: toastError } = useToast();

  const [modalAberto,  setModalAberto]  = useState(false);
  const [editando,     setEditando]     = useState<Maquininha | null>(null); // null = criar novo
  const [form,         setForm]         = useState<Omit<Maquininha, 'id'>>(FORM_VAZIO);
  const [salvando,     setSalvando]     = useState(false);

  if (isLoading) return <PageLoading />;

  // ── KPIs ───────────────────────────────────────────────────
  const totalAtivas   = maquininhas.filter(m => m.ativo).length;
  const totalInativas = maquininhas.filter(m => !m.ativo).length;

  // ── Handlers modal ─────────────────────────────────────────
  function abrirCriar() {
    setEditando(null);
    setForm(FORM_VAZIO);
    setModalAberto(true);
  }

  function abrirEditar(m: Maquininha) {
    setEditando(m);
    setForm({ nome: m.nome, tipo: m.tipo, taxa: m.taxa, ativo: m.ativo });
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setEditando(null);
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    try {
      if (editando) {
        await atualizar(editando.id, form);
        success('Maquininha atualizada!');
      } else {
        await criar(form);
        success('Maquininha cadastrada!');
      }
      fecharModal();
    } catch {
      toastError('Erro ao salvar maquininha.');
    } finally {
      setSalvando(false);
    }
  }

  async function handleExcluir(m: Maquininha) {
    if (!confirm(`Excluir "${m.nome}"?`)) return;
    try {
      await excluir(m.id);
      success(`"${m.nome}" excluída.`);
    } catch {
      toastError('Erro ao excluir maquininha.');
    }
  }

  async function handleToggle(m: Maquininha) {
    try {
      await toggle(m.id, !m.ativo);
      success(`"${m.nome}" ${!m.ativo ? 'ativada' : 'desativada'}.`);
    } catch {
      toastError('Erro ao alterar status.');
    }
  }

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">💳 Maquininhas</h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-zinc-400">
            Gerencie as formas de recebimento e taxas
          </p>
        </div>
        <button
          onClick={abrirCriar}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
        >
          <i className="bi bi-plus-lg" /> Nova Maquininha
        </button>
      </div>

      {/* Erro */}
      {error && (
        <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 px-4 py-3">
          <p className="text-sm text-red-700 dark:text-red-400">❌ {error}</p>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total',    value: maquininhas.length, color: 'text-gray-900 dark:text-zinc-100',    bg: 'bg-white dark:bg-[#1a1a1f]' },
          { label: 'Ativas',   value: totalAtivas,         color: 'text-green-700 dark:text-green-400',  bg: 'bg-green-50 dark:bg-green-950/40' },
          { label: 'Inativas', value: totalInativas,       color: 'text-gray-400 dark:text-zinc-500',    bg: 'bg-gray-50 dark:bg-[#27272d]' },
        ].map(c => (
          <div key={c.label} className={`rounded-2xl border border-gray-100 dark:border-[#2a2a32] ${c.bg} p-4 shadow-sm`}>
            <p className="text-xs text-gray-500 dark:text-zinc-400">{c.label}</p>
            <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Tabela */}
      <div className={`overflow-hidden ${card}`}>
        {maquininhas.length === 0 ? (
          <EmptyState
            icon="bi-credit-card-2-front"
            title="Nenhuma maquininha cadastrada"
            description="Cadastre formas de recebimento para usar nas Entradas"
            actionLabel="Nova Maquininha"
            onAction={abrirCriar}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 dark:border-[#2a2a32] bg-gray-50 dark:bg-[#111118]">
                <tr>
                  {['Status', 'Nome', 'Tipo', 'Taxa %', 'Ações'].map(h => (
                    <th key={h} className={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-[#2a2a32]">
                {maquininhas.map(m => (
                  <tr key={m.id} className={`hover:bg-gray-50 dark:hover:bg-[#27272d] transition-colors ${!m.ativo ? 'opacity-50' : ''}`}>

                    {/* Toggle ativo/inativo */}
                    <td className={td}>
                      <button
                        onClick={() => handleToggle(m)}
                        title={m.ativo ? 'Clique para desativar' : 'Clique para ativar'}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
                          m.ativo
                            ? 'bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400 hover:bg-green-200'
                            : 'bg-gray-100 dark:bg-[#27272d] text-gray-400 dark:text-zinc-500 hover:bg-gray-200'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${m.ativo ? 'bg-green-500' : 'bg-gray-400'}`} />
                        {m.ativo ? 'Ativa' : 'Inativa'}
                      </button>
                    </td>

                    <td className={`${td} font-medium text-gray-900 dark:text-zinc-100`}>{m.nome}</td>

                    <td className={td}>
                      <span className="flex items-center gap-1.5 text-gray-600 dark:text-zinc-300">
                        <span>{TIPO_ICON[m.tipo]}</span>
                        {TIPO_LABEL[m.tipo]}
                      </span>
                    </td>

                    <td className={td}>
                      {m.taxa === 0 ? (
                        <span className="text-green-600 dark:text-green-400 font-semibold">Sem taxa</span>
                      ) : (
                        <span className="font-semibold text-gray-900 dark:text-zinc-100">
                          {m.taxa.toFixed(2)}%
                        </span>
                      )}
                    </td>

                    <td className={td}>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => abrirEditar(m)}
                          className="rounded-lg bg-indigo-100 dark:bg-indigo-950/50 px-2 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 transition-colors"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => handleExcluir(m)}
                          className="rounded-lg bg-red-100 dark:bg-red-950/50 px-2 py-1 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-200 transition-colors"
                        >
                          🗑️
                        </button>
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
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#1a1a1f] border border-gray-100 dark:border-[#2a2a32] p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900 dark:text-zinc-100">
                {editando ? '✏️ Editar Maquininha' : '➕ Nova Maquininha'}
              </h2>
              <button onClick={fecharModal} className="text-gray-400 dark:text-zinc-500 hover:text-gray-600">
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <form onSubmit={handleSalvar} className="space-y-4">
              {/* Nome */}
              <div>
                <label className={lbl}>Nome *</label>
                <input
                  required
                  value={form.nome}
                  onChange={e => setForm(p => ({ ...p, nome: e.target.value }))}
                  className={inp}
                  placeholder="Ex: PagSeguro Crédito"
                />
              </div>

              {/* Tipo */}
              <div>
                <label className={lbl}>Tipo *</label>
                <select
                  value={form.tipo}
                  onChange={e => setForm(p => ({ ...p, tipo: e.target.value as TipoPagamento }))}
                  className={inp}
                >
                  {TIPOS.map(t => (
                    <option key={t.val} value={t.val}>
                      {t.icon} {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Taxa */}
              <div>
                <label className={lbl}>Taxa % *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  required
                  value={form.taxa === 0 ? '' : form.taxa}
                  onChange={e => setForm(p => ({ ...p, taxa: parseFloat(e.target.value) || 0 }))}
                  className={inp}
                  placeholder="0,00"
                />
                <p className="mt-1 text-xs text-gray-400 dark:text-zinc-500">Use 0 para Dinheiro/PIX sem taxa</p>
              </div>

              {/* Ativo toggle */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setForm(p => ({ ...p, ativo: !p.ativo }))}
                  className={`relative h-6 w-11 rounded-full transition-colors ${form.ativo ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-[#3a3a44]'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${form.ativo ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
                <span className="text-sm text-gray-700 dark:text-zinc-300">
                  {form.ativo ? 'Ativa' : 'Inativa'}
                </span>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={fecharModal}
                  className="flex-1 rounded-xl border border-gray-200 dark:border-[#3a3a44] py-2 text-sm text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-[#27272d] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="flex-1 rounded-xl bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors"
                >
                  {salvando ? 'Salvando...' : editando ? 'Atualizar' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
