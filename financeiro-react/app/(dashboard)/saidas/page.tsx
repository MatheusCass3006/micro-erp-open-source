'use client';

// ============================================================
// PÁGINA: Saídas / Despesas — ITEM 05
// Tabs Empresa / Pessoal / Todas + filtro por categoria
// ============================================================

import { useState } from 'react';
import { useSaidas } from '@/hooks/useSaidas';
import { useToast } from '@/hooks/useToast';
import { PageLoading } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, formatDate } from '@/utils/formatters';
import type { Saida } from '@/types';

type Secao = 'todas' | 'empresa' | 'pessoal';

const CATEGORIAS_PADRAO = [
  'Aluguel', 'Funcionários', 'Fornecedores', 'Marketing',
  'Utilities', 'Impostos', 'Equipamentos', 'Alimentação', 'Outros',
];

const FORM_VAZIO = {
  descricao:   '',
  valor:       '',
  categoria:   'Outros',
  data:        new Date().toISOString().split('T')[0],
  observacao:  '',
  secao:       'empresa' as 'empresa' | 'pessoal',
};

const label  = 'mb-1 block text-xs font-semibold text-gray-600 dark:text-zinc-400';
const input  = 'w-full rounded-xl border border-gray-200 dark:border-[#3a3a44] bg-white dark:bg-[#111118] px-3 py-2 text-sm text-gray-900 dark:text-zinc-100 focus:outline-none focus:border-red-400 placeholder:text-gray-400 dark:placeholder:text-zinc-600';
const select = 'w-full rounded-xl border border-gray-200 dark:border-[#3a3a44] bg-white dark:bg-[#111118] px-3 py-2 text-sm text-gray-900 dark:text-zinc-100 focus:outline-none';
const card   = 'rounded-2xl border border-gray-100 dark:border-[#2a2a32] bg-white dark:bg-[#1a1a1f] shadow-sm';

export default function SaidasPage() {
  const { success, error: toastError } = useToast();

  // ── Seção (tabs) ──────────────────────────────────────────
  const [secaoAtiva, setSecaoAtiva] = useState<Secao>('todas');

  // ── Categorias dinâmicas ───────────────────────────────────
  const [categorias, setCategorias]           = useState<string[]>(CATEGORIAS_PADRAO);
  const [novaCategoria, setNovaCategoria]     = useState('');
  const [gerenciarAberto, setGerenciarAberto] = useState(false);

  // ── Saídas ────────────────────────────────────────────────
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const { saidas, isLoading, criar, atualizar, excluir } = useSaidas({ categoria: filtroCategoria || undefined });

  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando]       = useState<Saida | null>(null);
  const [form, setForm]               = useState(FORM_VAZIO);
  const [salvando, setSalvando]       = useState(false);

  if (isLoading) return <PageLoading />;

  // ── Filtro por seção ─────────────────────────────────────
  const saidasFiltradas = saidas.filter(s => {
    if (secaoAtiva === 'todas') return true;
    // Saídas sem secao definida entram em "empresa" por padrão
    const sec = s.secao ?? 'empresa';
    return sec === secaoAtiva;
  });

  const totalSaidas = saidasFiltradas.reduce((s, x) => s + x.valor, 0);
  const totalEmpresa = saidas.filter(s => (s.secao ?? 'empresa') === 'empresa').reduce((s, x) => s + x.valor, 0);
  const totalPessoal = saidas.filter(s => s.secao === 'pessoal').reduce((s, x) => s + x.valor, 0);

  const porCategoria = saidasFiltradas.reduce<Record<string, number>>((acc, s) => {
    acc[s.categoria] = (acc[s.categoria] || 0) + s.valor;
    return acc;
  }, {});

  // ── Handlers categoria ────────────────────────────────────
  function adicionarCategoria() {
    const nome = novaCategoria.trim();
    if (!nome || categorias.includes(nome)) return;
    setCategorias(prev => [...prev, nome]);
    setNovaCategoria('');
  }

  function removerCategoria(nome: string) {
    setCategorias(prev => prev.filter(c => c !== nome));
    if (form.categoria === nome)
      setForm(p => ({ ...p, categoria: categorias.find(c => c !== nome) || 'Outros' }));
  }

  // ── Handlers saídas ───────────────────────────────────────
  function abrirNova() {
    setEditando(null);
    setForm({ ...FORM_VAZIO, secao: secaoAtiva === 'pessoal' ? 'pessoal' : 'empresa' });
    setModalAberto(true);
  }

  function abrirEditar(s: Saida) {
    setEditando(s);
    setForm({
      descricao:  s.descricao,
      valor:      String(s.valor),
      categoria:  s.categoria,
      data:       s.data,
      observacao: s.observacao || '',
      secao:      s.secao ?? 'empresa',
    });
    setModalAberto(true);
  }

  async function handleSalvar(ev: React.FormEvent) {
    ev.preventDefault();
    setSalvando(true);
    const payload: Omit<Saida, 'id'> = {
      descricao:  form.descricao,
      valor:      parseFloat(form.valor),
      categoria:  form.categoria,
      data:       form.data,
      observacao: form.observacao || undefined,
      secao:      form.secao,
    };
    try {
      if (editando) { await atualizar(editando.id, payload); success('Saída atualizada!'); }
      else          { await criar(payload);                   success('Saída registrada!'); }
      setModalAberto(false);
    } catch {
      toastError('Erro ao salvar saída.');
    } finally {
      setSalvando(false);
    }
  }

  async function handleExcluir(id: number) {
    try { await excluir(id); success('Saída excluída.'); }
    catch { toastError('Erro ao excluir.'); }
  }

  return (
    <div className="space-y-4">

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-red-100 dark:border-red-900/40 bg-red-50 dark:bg-red-950/40 p-4">
          <p className="text-xs text-red-600 dark:text-red-400">
            {secaoAtiva === 'todas' ? 'Total de Saídas' : secaoAtiva === 'empresa' ? 'Total Empresa' : 'Total Pessoal'}
          </p>
          <p className="text-xl font-bold text-red-700 dark:text-red-400">{formatCurrency(totalSaidas)}</p>
        </div>
        {secaoAtiva === 'todas' && (
          <>
            <div className={`${card} p-4`}>
              <p className="text-xs text-gray-500 dark:text-zinc-500">🏢 Empresa</p>
              <p className="text-lg font-semibold text-gray-800 dark:text-zinc-200">{formatCurrency(totalEmpresa)}</p>
            </div>
            <div className={`${card} p-4`}>
              <p className="text-xs text-gray-500 dark:text-zinc-500">👤 Pessoal</p>
              <p className="text-lg font-semibold text-gray-800 dark:text-zinc-200">{formatCurrency(totalPessoal)}</p>
            </div>
          </>
        )}
        {Object.entries(porCategoria).slice(0, secaoAtiva === 'todas' ? 1 : 3).map(([cat, val]) => (
          <div key={cat} className={`${card} p-4`}>
            <p className="text-xs text-gray-500 dark:text-zinc-500">{cat}</p>
            <p className="text-lg font-semibold text-gray-800 dark:text-zinc-200">{formatCurrency(val)}</p>
          </div>
        ))}
      </div>

      {/* Tabs Empresa / Pessoal / Todas — ITEM 05 */}
      <div className="flex items-center gap-1 rounded-xl border border-gray-200 dark:border-[#3a3a44] bg-gray-50 dark:bg-[#111118] p-1 w-fit">
        {([
          ['todas',   '📋 Todas'],
          ['empresa', '🏢 Empresa'],
          ['pessoal', '👤 Pessoal'],
        ] as [Secao, string][]).map(([val, lbl]) => (
          <button
            key={val}
            onClick={() => setSecaoAtiva(val)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
              secaoAtiva === val
                ? 'bg-white dark:bg-[#1a1a1f] text-gray-900 dark:text-zinc-100 shadow-sm'
                : 'text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200'
            }`}
          >
            {lbl}
          </button>
        ))}
      </div>

      {/* Ações */}
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={abrirNova} className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors">
          <i className="bi bi-plus-lg" /> Nova Saída
        </button>

        <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)}
          className="rounded-xl border border-gray-200 dark:border-[#3a3a44] bg-white dark:bg-[#111118] px-3 py-2 text-sm text-gray-900 dark:text-zinc-100 focus:outline-none w-auto">
          <option value="">Todas as categorias</option>
          {categorias.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <button onClick={() => setGerenciarAberto(!gerenciarAberto)}
          className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-[#3a3a44] px-4 py-2 text-sm font-medium text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-[#27272d] transition-colors">
          <i className="bi bi-tags" /> Categorias {gerenciarAberto ? '▲' : '▼'}
        </button>
      </div>

      {/* Painel de categorias */}
      {gerenciarAberto && (
        <div className={`${card} p-5`}>
          <h3 className="mb-4 text-sm font-semibold text-gray-700 dark:text-zinc-300">Gerenciar Categorias</h3>
          <div className="mb-4 flex flex-wrap gap-2">
            {categorias.map(c => (
              <div key={c} className="flex items-center gap-1 rounded-lg border border-gray-200 dark:border-[#3a3a44] bg-gray-50 dark:bg-[#27272d] pl-3 pr-2 py-1.5">
                <span className="text-sm text-gray-700 dark:text-zinc-300">{c}</span>
                <button onClick={() => removerCategoria(c)} className="ml-1 flex h-4 w-4 items-center justify-center rounded-full text-gray-400 hover:bg-red-100 hover:text-red-600 transition-colors text-xs font-bold">✕</button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={novaCategoria} onChange={e => setNovaCategoria(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), adicionarCategoria())}
              className="flex-1 rounded-xl border border-gray-200 dark:border-[#3a3a44] bg-white dark:bg-[#111118] px-3 py-2 text-sm text-gray-900 dark:text-zinc-100 focus:outline-none"
              placeholder="Nova categoria... (Enter)" />
            <button onClick={adicionarCategoria} disabled={!novaCategoria.trim()}
              className="rounded-xl bg-gray-900 dark:bg-zinc-100 px-4 py-2 text-sm font-medium text-white dark:text-gray-900 hover:bg-gray-700 disabled:opacity-40 transition-colors">
              Adicionar
            </button>
          </div>
        </div>
      )}

      {/* Tabela */}
      <div className={`overflow-hidden ${card}`}>
        {saidasFiltradas.length === 0 ? (
          <EmptyState icon="bi-arrow-up-circle" title={`Nenhuma saída ${secaoAtiva !== 'todas' ? `(${secaoAtiva})` : ''}`} description="Registre despesas e acompanhe seus gastos" actionLabel="Nova Saída" onAction={abrirNova} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 dark:border-[#2a2a32] bg-gray-50 dark:bg-[#111118]">
                <tr>
                  {['Data','Descrição','Seção','Categoria','Valor','Ações'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-zinc-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-[#2a2a32]">
                {saidasFiltradas.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-[#27272d] transition-colors">
                    <td className="px-4 py-3 text-gray-500 dark:text-zinc-400">{formatDate(s.data)}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-zinc-100">
                      {s.descricao}
                      {s.observacao && <p className="text-xs text-gray-400 mt-0.5">{s.observacao}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        (s.secao ?? 'empresa') === 'empresa'
                          ? 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400'
                          : 'bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400'
                      }`}>
                        {(s.secao ?? 'empresa') === 'empresa' ? '🏢 Empresa' : '👤 Pessoal'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-orange-100 dark:bg-orange-950/50 px-2.5 py-0.5 text-xs font-medium text-orange-700 dark:text-orange-400">{s.categoria}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-red-600 dark:text-red-400">{formatCurrency(s.valor)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => abrirEditar(s)} className="rounded-lg bg-gray-100 dark:bg-[#27272d] px-2 py-1 text-xs hover:bg-gray-200 transition-colors">✏️</button>
                        <button onClick={() => handleExcluir(s.id)} className="rounded-lg bg-red-100 dark:bg-red-950/50 px-2 py-1 text-xs text-red-600 hover:bg-red-200 transition-colors">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1a1a1f] border border-gray-100 dark:border-[#2a2a32] p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">
                {editando ? '✏️ Editar Saída' : '📤 Nova Saída'}
              </h2>
              <button onClick={() => setModalAberto(false)} className="text-gray-400 hover:text-gray-600"><i className="bi bi-x-lg" /></button>
            </div>

            <form onSubmit={handleSalvar} className="space-y-4">
              {/* Seção — ITEM 05 */}
              <div>
                <label className={label}>Seção *</label>
                <div className="flex gap-2">
                  {([['empresa', '🏢 Empresa'], ['pessoal', '👤 Pessoal']] as const).map(([val, lbl]) => (
                    <button key={val} type="button"
                      onClick={() => setForm(p => ({ ...p, secao: val }))}
                      className={`flex-1 rounded-xl border py-2 text-sm font-semibold transition-colors ${
                        form.secao === val
                          ? 'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400'
                          : 'border-gray-200 dark:border-[#3a3a44] text-gray-500 hover:border-gray-300'
                      }`}>
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={label}>Descrição *</label>
                <input required value={form.descricao} onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))} className={input} placeholder="Ex: Aluguel do escritório" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={label}>Valor (R$) *</label>
                  <input required type="number" step="0.01" min="0" value={form.valor} onChange={e => setForm(p => ({ ...p, valor: e.target.value }))} className={input} placeholder="0,00" />
                </div>
                <div>
                  <label className={label}>Data *</label>
                  <input required type="date" value={form.data} onChange={e => setForm(p => ({ ...p, data: e.target.value }))} className={input} />
                </div>
              </div>

              <div>
                <label className={label}>Categoria *</label>
                <select value={form.categoria} onChange={e => setForm(p => ({ ...p, categoria: e.target.value }))} className={select}>
                  {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className={label}>Observação</label>
                <input value={form.observacao} onChange={e => setForm(p => ({ ...p, observacao: e.target.value }))} className={input} placeholder="Opcional" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalAberto(false)} className="flex-1 rounded-xl border border-gray-200 dark:border-[#3a3a44] py-2 text-sm text-gray-600 dark:text-zinc-400 hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={salvando} className="flex-1 rounded-xl bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60 transition-colors">
                  {salvando ? 'Salvando...' : editando ? 'Salvar alterações' : 'Registrar Saída'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
