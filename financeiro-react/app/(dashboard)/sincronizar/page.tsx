'use client';

// ============================================================
// PÁGINA: Sincronizar — ITEM 13
// Export de todos os dados como JSON + Import para restaurar.
// Não depende de endpoint dedicado no backend —
// usa os mesmos GET/POST das outras páginas.
// ============================================================

import { useRef, useState } from 'react';
import { getBoletos }  from '@/services/boletos.service';
import { getEntradas } from '@/services/entradas.service';
import { getSaidas }   from '@/services/saidas.service';
import { getNotas }    from '@/services/notas.service';
import { createBoleto }  from '@/services/boletos.service';
import { createEntrada } from '@/services/entradas.service';
import { createSaida }   from '@/services/saidas.service';
import { createNota }    from '@/services/notas.service';
import type { Boleto, Entrada, Saida, Nota, BoletoForm } from '@/types';

// ── Tipos ────────────────────────────────────────────────────

interface BackupJSON {
  versao:     string;
  exportadoEm: string;
  sistema:    'MicroERP';
  dados: {
    boletos:  Omit<Boleto,  'id'>[];
    entradas: Omit<Entrada, 'id'>[];
    saidas:   Omit<Saida,   'id'>[];
    notas:    Omit<Nota,    'id'>[];
  };
  totais: {
    boletos:  number;
    entradas: number;
    saidas:   number;
    notas:    number;
  };
}

type Etapa = 'idle' | 'exportando' | 'importando';

interface LogItem {
  tipo:    'info' | 'sucesso' | 'erro';
  mensagem: string;
}

// ── Helpers ──────────────────────────────────────────────────

const STORAGE_KEY = 'microerp_ultima_sincronizacao';

function salvarUltimaSincronizacao(tipo: 'export' | 'import') {
  const dados = { tipo, data: new Date().toISOString() };
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(dados)); } catch { /* noop */ }
}

function lerUltimaSincronizacao(): { tipo: string; data: string } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function formatarData(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day:    '2-digit', month: '2-digit', year:  'numeric',
    hour:   '2-digit', minute: '2-digit',
  });
}

// ── Estilos ───────────────────────────────────────────────────

const card = 'rounded-2xl border border-gray-100 dark:border-[#2a2a32] bg-white dark:bg-[#1a1a1f] shadow-sm p-6';

// ─────────────────────────────────────────────────────────────

export default function SincronizarPage() {
  const [etapa,   setEtapa]   = useState<Etapa>('idle');
  const [log,     setLog]     = useState<LogItem[]>([]);
  const [progresso, setProgresso] = useState(0); // 0-100

  const fileRef = useRef<HTMLInputElement>(null);

  // lê última sincronização do localStorage (client-only)
  const [ultimaSync] = useState<{ tipo: string; data: string } | null>(() => {
    if (typeof window === 'undefined') return null;
    return lerUltimaSincronizacao();
  });

  function addLog(tipo: LogItem['tipo'], mensagem: string) {
    setLog(prev => [...prev, { tipo, mensagem }]);
  }

  function resetar() {
    setEtapa('idle');
    setLog([]);
    setProgresso(0);
    if (fileRef.current) fileRef.current.value = '';
  }

  // ─────────────────────────────────────────────────────────────
  // EXPORTAR
  // ─────────────────────────────────────────────────────────────

  async function exportarDados() {
    setEtapa('exportando');
    setLog([]);
    setProgresso(0);

    try {
      addLog('info', '🔄 Buscando boletos...');
      const boletos = await getBoletos();
      setProgresso(25);

      addLog('info', '🔄 Buscando entradas...');
      const entradas = await getEntradas();
      setProgresso(50);

      addLog('info', '🔄 Buscando saídas...');
      const saidas = await getSaidas();
      setProgresso(75);

      addLog('info', '🔄 Buscando notas fiscais...');
      const notas = await getNotas();
      setProgresso(95);

      // Remove ids — ao importar, o backend vai gerar novos ids
      const backup: BackupJSON = {
        versao:      '2.0',
        exportadoEm: new Date().toISOString(),
        sistema:     'MicroERP',
        dados: {
          boletos:  boletos.map(({ id: _id, ...rest }) => rest),
          entradas: entradas.map(({ id: _id, ...rest }) => rest),
          saidas:   saidas.map(({ id: _id, ...rest }) => rest),
          notas:    notas.map(({ id: _id, ...rest }) => rest),
        },
        totais: {
          boletos:  boletos.length,
          entradas: entradas.length,
          saidas:   saidas.length,
          notas:    notas.length,
        },
      };

      // Trigger download
      const json = JSON.stringify(backup, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      const data = new Date().toISOString().split('T')[0];
      a.href     = url;
      a.download = `microerp-backup-${data}.json`;
      a.click();
      URL.revokeObjectURL(url);

      setProgresso(100);
      addLog('sucesso', `✅ Exportação concluída! ${boletos.length} boletos, ${entradas.length} entradas, ${saidas.length} saídas, ${notas.length} notas.`);
      salvarUltimaSincronizacao('export');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      addLog('erro', `❌ Falha na exportação: ${msg}`);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // IMPORTAR
  // ─────────────────────────────────────────────────────────────

  async function handleArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setEtapa('importando');
    setLog([]);
    setProgresso(0);

    try {
      // Lê e parseia o JSON
      const texto = await file.text();
      const backup = JSON.parse(texto) as BackupJSON;

      // Validação básica
      if (backup.sistema !== 'MicroERP' || !backup.dados) {
        throw new Error('Arquivo inválido — não é um backup do MicroERP.');
      }

      addLog('info', `📂 Backup de ${formatarData(backup.exportadoEm)} detectado (v${backup.versao})`);
      addLog('info', `📊 Itens encontrados: ${backup.totais.boletos} boletos, ${backup.totais.entradas} entradas, ${backup.totais.saidas} saídas, ${backup.totais.notas} notas.`);

      const total =
        backup.dados.boletos.length +
        backup.dados.entradas.length +
        backup.dados.saidas.length +
        backup.dados.notas.length || 1;

      let done = 0;

      // Importa boletos
      addLog('info', `🔄 Importando ${backup.dados.boletos.length} boletos...`);
      for (const b of backup.dados.boletos) {
        try { await createBoleto(b as BoletoForm); } catch { /* continua mesmo com erro individual */ }
        done++;
        setProgresso(Math.round((done / total) * 100));
      }

      // Importa entradas
      addLog('info', `🔄 Importando ${backup.dados.entradas.length} entradas...`);
      for (const e of backup.dados.entradas) {
        try { await createEntrada(e); } catch { /* noop */ }
        done++;
        setProgresso(Math.round((done / total) * 100));
      }

      // Importa saídas
      addLog('info', `🔄 Importando ${backup.dados.saidas.length} saídas...`);
      for (const s of backup.dados.saidas) {
        try { await createSaida(s); } catch { /* noop */ }
        done++;
        setProgresso(Math.round((done / total) * 100));
      }

      // Importa notas
      addLog('info', `🔄 Importando ${backup.dados.notas.length} notas fiscais...`);
      for (const n of backup.dados.notas) {
        try { await createNota(n); } catch { /* noop */ }
        done++;
        setProgresso(Math.round((done / total) * 100));
      }

      setProgresso(100);
      addLog('sucesso', '✅ Importação concluída! Recarregue as páginas para ver os dados.');
      salvarUltimaSincronizacao('import');

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao ler arquivo';
      addLog('erro', `❌ Falha na importação: ${msg}`);
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────

  const ocupado = etapa !== 'idle';

  return (
    <div className="space-y-6 max-w-2xl">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">☁️ Sincronizar</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
          Exporte todos os dados como JSON para backup ou importe para restaurar registros.
        </p>
      </div>

      {/* Última sincronização */}
      {ultimaSync && (
        <div className="flex items-center gap-3 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 px-4 py-3">
          <i className="bi bi-clock-history text-indigo-500" />
          <p className="text-sm text-indigo-700 dark:text-indigo-300">
            Última sincronização:{' '}
            <span className="font-semibold">
              {ultimaSync.tipo === 'export' ? 'Exportação' : 'Importação'}
            </span>{' '}
            em {formatarData(ultimaSync.data)}
          </p>
        </div>
      )}

      {/* Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

        {/* Card Exportar */}
        <div className={card}>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/50">
              <i className="bi bi-cloud-arrow-down-fill text-xl text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-zinc-100">Exportar Dados</h2>
              <p className="text-xs text-gray-500 dark:text-zinc-400">Download em JSON</p>
            </div>
          </div>

          <p className="mb-5 text-sm text-gray-600 dark:text-zinc-400">
            Baixa um arquivo <code className="rounded bg-gray-100 dark:bg-[#27272d] px-1 text-xs">.json</code> com todos os seus boletos, entradas, saídas e notas fiscais.
          </p>

          <ul className="mb-5 space-y-1 text-xs text-gray-500 dark:text-zinc-500">
            <li className="flex items-center gap-2"><i className="bi bi-check2 text-green-500" /> Boletos</li>
            <li className="flex items-center gap-2"><i className="bi bi-check2 text-green-500" /> Entradas</li>
            <li className="flex items-center gap-2"><i className="bi bi-check2 text-green-500" /> Saídas / Despesas</li>
            <li className="flex items-center gap-2"><i className="bi bi-check2 text-green-500" /> Notas Fiscais</li>
          </ul>

          <button
            onClick={exportarDados}
            disabled={ocupado}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {etapa === 'exportando' ? (
              <><i className="bi bi-arrow-clockwise animate-spin" /> Exportando...</>
            ) : (
              <><i className="bi bi-cloud-arrow-down" /> Exportar Tudo</>
            )}
          </button>
        </div>

        {/* Card Importar */}
        <div className={card}>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/50">
              <i className="bi bi-cloud-arrow-up-fill text-xl text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-zinc-100">Importar Dados</h2>
              <p className="text-xs text-gray-500 dark:text-zinc-400">Restaurar de JSON</p>
            </div>
          </div>

          <p className="mb-5 text-sm text-gray-600 dark:text-zinc-400">
            Selecione um arquivo <code className="rounded bg-gray-100 dark:bg-[#27272d] px-1 text-xs">.json</code> exportado pelo MicroERP para restaurar os dados.
          </p>

          <div className="mb-5 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-3 py-2">
            <p className="text-xs text-amber-700 dark:text-amber-400">
              ⚠️ A importação <strong>adiciona</strong> registros — não substitui os existentes. Use com cuidado para evitar duplicatas.
            </p>
          </div>

          <label className={`w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-emerald-300 dark:border-emerald-700 py-2.5 text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 cursor-pointer transition-colors ${ocupado ? 'opacity-60 pointer-events-none' : ''}`}>
            {etapa === 'importando' ? (
              <><i className="bi bi-arrow-clockwise animate-spin" /> Importando...</>
            ) : (
              <><i className="bi bi-cloud-arrow-up" /> Selecionar Arquivo</>
            )}
            <input
              ref={fileRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleArquivo}
              disabled={ocupado}
            />
          </label>
        </div>

      </div>

      {/* Progresso + Log */}
      {(ocupado || log.length > 0) && (
        <div className="rounded-2xl border border-gray-100 dark:border-[#2a2a32] bg-white dark:bg-[#1a1a1f] shadow-sm p-5 space-y-4">

          {/* Barra de progresso */}
          {ocupado && (
            <div>
              <div className="mb-1 flex items-center justify-between text-xs text-gray-500 dark:text-zinc-400">
                <span>{etapa === 'exportando' ? 'Exportando...' : 'Importando...'}</span>
                <span>{progresso}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-[#27272d]">
                <div
                  className="h-2 rounded-full bg-indigo-500 transition-all duration-300"
                  style={{ width: `${progresso}%` }}
                />
              </div>
            </div>
          )}

          {/* Log de atividades */}
          <div className="space-y-1.5 font-mono text-xs">
            {log.map((item, i) => (
              <p
                key={i}
                className={
                  item.tipo === 'sucesso' ? 'text-green-600 dark:text-green-400' :
                  item.tipo === 'erro'    ? 'text-red-600 dark:text-red-400' :
                                           'text-gray-500 dark:text-zinc-400'
                }
              >
                {item.mensagem}
              </p>
            ))}
          </div>

          {/* Botão resetar quando terminou */}
          {!ocupado && log.length > 0 && (
            <button
              onClick={resetar}
              className="mt-2 rounded-lg border border-gray-200 dark:border-[#3a3a44] px-4 py-1.5 text-xs text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-[#27272d] transition-colors"
            >
              Limpar log
            </button>
          )}
        </div>
      )}

      {/* Instruções */}
      <div className="rounded-2xl border border-gray-100 dark:border-[#2a2a32] bg-gray-50 dark:bg-[#111118] p-5">
        <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-zinc-300">📖 Como usar</h3>
        <ol className="space-y-2 text-sm text-gray-500 dark:text-zinc-400 list-decimal list-inside">
          <li>Clique em <strong className="text-gray-700 dark:text-zinc-300">Exportar Tudo</strong> para baixar o backup completo.</li>
          <li>Guarde o arquivo <code className="rounded bg-gray-100 dark:bg-[#27272d] px-1 text-xs">.json</code> em local seguro.</li>
          <li>Para restaurar, use <strong className="text-gray-700 dark:text-zinc-300">Selecionar Arquivo</strong> e escolha o backup.</li>
          <li>Após importar, recarregue as páginas (Boletos, Entradas, etc.) para ver os dados.</li>
        </ol>
      </div>

    </div>
  );
}
