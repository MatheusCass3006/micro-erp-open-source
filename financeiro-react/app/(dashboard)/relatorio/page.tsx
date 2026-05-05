'use client';

// ============================================================
// PÁGINA: Relatório — ITEM 03
// Filtros de período + tipo, tabela de resultado,
// exportação CSV (abre no Excel) e PDF (window.print).
// ============================================================

import { useState, useMemo, useRef } from 'react';
import { getBoletos }  from '@/services/boletos.service';
import { getEntradas } from '@/services/entradas.service';
import { getSaidas }   from '@/services/saidas.service';
import { getNotas }    from '@/services/notas.service';
import { formatCurrency, formatDate } from '@/utils/formatters';

type TipoRelatorio = 'entradas' | 'saidas' | 'boletos' | 'notas';

interface LinhaRelatorio {
  data:     string;
  descricao:string;
  categoria:string;
  valor:    number;
  extra:    string; // taxa / status / fornecedor / etc.
}

const card = 'rounded-2xl border border-gray-100 dark:border-[#2a2a32] bg-white dark:bg-[#1a1a1f] shadow-sm';

const TIPOS: { val: TipoRelatorio; label: string; icon: string; cor: string }[] = [
  { val: 'entradas', label: 'Entradas',       icon: '📥', cor: 'text-green-700 dark:text-green-400' },
  { val: 'saidas',   label: 'Saídas',         icon: '📤', cor: 'text-red-600 dark:text-red-400' },
  { val: 'boletos',  label: 'Boletos',        icon: '📄', cor: 'text-blue-700 dark:text-blue-400' },
  { val: 'notas',    label: 'Notas Fiscais',  icon: '🧾', cor: 'text-indigo-700 dark:text-indigo-400' },
];

// ── Helpers de exportação ─────────────────────────────────────

function gerarCSV(linhas: LinhaRelatorio[], titulo: string): void {
  const BOM = '﻿'; // BOM para Excel reconhecer UTF-8
  const header = 'Data,Descrição,Categoria,Valor (R$),Detalhe\n';
  const rows = linhas.map(l =>
    [l.data, `"${l.descricao}"`, `"${l.categoria}"`,
     l.valor.toFixed(2).replace('.', ','), `"${l.extra}"`].join(',')
  ).join('\n');
  const csv = BOM + `Relatório: ${titulo}\n\n` + header + rows;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `relatorio-${titulo.toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function imprimirPDF(ref: HTMLDivElement | null): void {
  if (!ref) return;
  const conteudo = ref.innerHTML;
  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) return;
  win.document.write(`
    <!DOCTYPE html><html lang="pt-BR"><head>
    <meta charset="UTF-8">
    <title>Relatório MicroERP</title>
    <style>
      body { font-family: Arial, sans-serif; font-size: 12px; padding: 20px; color: #111; }
      table { width: 100%; border-collapse: collapse; margin-top: 16px; }
      th { background: #f3f4f6; text-align: left; padding: 8px; font-size: 10px; text-transform: uppercase; }
      td { padding: 8px; border-bottom: 1px solid #e5e7eb; }
      h1 { font-size: 18px; margin-bottom: 4px; }
      .total { font-weight: bold; font-size: 14px; margin-top: 12px; }
      @media print { .no-print { display: none; } }
    </style></head><body>
    ${conteudo}
    </body></html>
  `);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); win.close(); }, 500);
}

// ─────────────────────────────────────────────────────────────

export default function RelatorioPage() {
  const hoje  = new Date().toISOString().split('T')[0];
  const inicio30 = new Date(Date.now() - 30 * 864e5).toISOString().split('T')[0];

  const [tipo,       setTipo]       = useState<TipoRelatorio>('entradas');
  const [dataInicio, setDataInicio] = useState(inicio30);
  const [dataFim,    setDataFim]    = useState(hoje);
  const [linhas,     setLinhas]     = useState<LinhaRelatorio[] | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro,       setErro]       = useState('');
  const printRef = useRef<HTMLDivElement>(null);

  // ── Gerar relatório ─────────────────────────────────────────
  async function gerarRelatorio() {
    setCarregando(true);
    setErro('');
    setLinhas(null);

    try {
      let resultado: LinhaRelatorio[] = [];

      const dentroPeriodo = (data: string) => data >= dataInicio && data <= dataFim;

      if (tipo === 'entradas') {
        const dados = await getEntradas();
        resultado = dados
          .filter(e => dentroPeriodo(e.data))
          .map(e => ({
            data:      e.data,
            descricao: e.descricao || 'Entrada',
            categoria: e.tipo,
            valor:     e.valor_liquido,
            extra:     `Taxa: ${e.taxa_percentual}% | Bruto: ${formatCurrency(e.valor_bruto)}`,
          }));
      }

      if (tipo === 'saidas') {
        const dados = await getSaidas();
        resultado = dados
          .filter(s => dentroPeriodo(s.data))
          .map(s => ({
            data:      s.data,
            descricao: s.descricao,
            categoria: s.categoria,
            valor:     s.valor,
            extra:     s.observacao || (s.secao === 'pessoal' ? 'Pessoal' : 'Empresa'),
          }));
      }

      if (tipo === 'boletos') {
        const dados = await getBoletos();
        resultado = dados
          .filter(b => dentroPeriodo(b.vencimento))
          .map(b => ({
            data:      b.vencimento,
            descricao: b.descricao,
            categoria: b.status,
            valor:     b.valor,
            extra:     b.beneficiario,
          }));
      }

      if (tipo === 'notas') {
        const dados = await getNotas();
        resultado = dados
          .filter(n => dentroPeriodo(n.data_emissao))
          .map(n => ({
            data:      n.data_emissao,
            descricao: `NF ${n.numero}`,
            categoria: n.status,
            valor:     n.valor_total,
            extra:     n.fornecedor,
          }));
      }

      // Ordena por data desc
      resultado.sort((a, b) => b.data.localeCompare(a.data));
      setLinhas(resultado);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao gerar relatório.');
    } finally {
      setCarregando(false);
    }
  }

  const totalValor = useMemo(() => linhas?.reduce((s, l) => s + l.valor, 0) ?? 0, [linhas]);
  const tipoInfo = TIPOS.find(t => t.val === tipo)!;

  return (
    <div className="space-y-5 max-w-5xl">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">📊 Relatório</h1>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-zinc-400">Gere relatórios por período e exporte em CSV ou PDF</p>
      </div>

      {/* Painel de filtros */}
      <div className={`${card} p-5`}>
        <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-zinc-300">🔍 Filtros</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Tipo */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-zinc-400">Tipo de dados</label>
            <div className="grid grid-cols-2 gap-1.5">
              {TIPOS.map(t => (
                <button key={t.val} type="button" onClick={() => setTipo(t.val)}
                  className={`rounded-xl border py-2 text-xs font-semibold transition-colors ${
                    tipo === t.val
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400'
                      : 'border-gray-200 dark:border-[#3a3a44] text-gray-500 dark:text-zinc-400 hover:border-gray-300'
                  }`}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Período */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-zinc-400">Data início</label>
            <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-[#3a3a44] bg-white dark:bg-[#111118] px-3 py-2 text-sm text-gray-900 dark:text-zinc-100 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-zinc-400">Data fim</label>
            <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-[#3a3a44] bg-white dark:bg-[#111118] px-3 py-2 text-sm text-gray-900 dark:text-zinc-100 focus:outline-none" />
          </div>
        </div>

        <button onClick={gerarRelatorio} disabled={carregando}
          className="mt-4 flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors">
          {carregando ? <><i className="bi bi-arrow-clockwise animate-spin" /> Gerando...</> : <><i className="bi bi-bar-chart" /> Gerar Relatório</>}
        </button>
      </div>

      {/* Erro */}
      {erro && (
        <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-700 dark:text-red-400">❌ {erro}</div>
      )}

      {/* Resultado */}
      {linhas !== null && (
        <div ref={printRef} className="space-y-4">

          {/* Header do resultado */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">
                {tipoInfo.icon} {tipoInfo.label} — {formatDate(dataInicio)} a {formatDate(dataFim)}
              </h2>
              <p className="text-sm text-gray-500 dark:text-zinc-400">
                {linhas.length} registro{linhas.length !== 1 ? 's' : ''} encontrado{linhas.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Botões de export */}
            <div className="flex gap-2 no-print">
              <button onClick={() => gerarCSV(linhas, tipoInfo.label)}
                className="flex items-center gap-2 rounded-xl border border-green-300 dark:border-green-700 px-3 py-2 text-sm font-medium text-green-700 dark:text-green-400 hover:bg-green-50 transition-colors">
                <i className="bi bi-file-earmark-excel" /> CSV / Excel
              </button>
              <button onClick={() => imprimirPDF(printRef.current)}
                className="flex items-center gap-2 rounded-xl border border-red-300 dark:border-red-700 px-3 py-2 text-sm font-medium text-red-700 dark:text-red-400 hover:bg-red-50 transition-colors">
                <i className="bi bi-file-earmark-pdf" /> PDF
              </button>
            </div>
          </div>

          {linhas.length === 0 ? (
            <div className={`${card} py-12 text-center`}>
              <i className="bi bi-inbox text-3xl text-gray-300 dark:text-zinc-600" />
              <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">Nenhum registro no período selecionado.</p>
            </div>
          ) : (
            <>
              {/* Tabela */}
              <div className={`overflow-hidden ${card}`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-gray-100 dark:border-[#2a2a32] bg-gray-50 dark:bg-[#111118]">
                      <tr>
                        {['Data','Descrição','Categoria / Status','Valor','Detalhe'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-zinc-500">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-[#2a2a32]">
                      {linhas.map((l, i) => (
                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-[#27272d] transition-colors">
                          <td className="px-4 py-3 text-gray-500 dark:text-zinc-400 whitespace-nowrap">{formatDate(l.data)}</td>
                          <td className="px-4 py-3 font-medium text-gray-900 dark:text-zinc-100">{l.descricao}</td>
                          <td className="px-4 py-3">
                            <span className="rounded-full bg-gray-100 dark:bg-[#27272d] px-2.5 py-0.5 text-xs text-gray-600 dark:text-zinc-300">{l.categoria}</span>
                          </td>
                          <td className={`px-4 py-3 font-semibold ${tipoInfo.cor}`}>{formatCurrency(l.valor)}</td>
                          <td className="px-4 py-3 text-xs text-gray-400 dark:text-zinc-500">{l.extra}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t border-gray-100 dark:border-[#2a2a32] bg-gray-50 dark:bg-[#111118]">
                      <tr>
                        <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-gray-700 dark:text-zinc-300">
                          Total ({linhas.length} registros)
                        </td>
                        <td className={`px-4 py-3 text-base font-bold ${tipoInfo.cor}`}>{formatCurrency(totalValor)}</td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
