'use client';

// ============================================================
// PÁGINA: Notas Fiscais — ITEM 04 + ITEM 15
// Editar nota + itens individuais (add/remove/calc total)
// Câmera ao vivo (ITEM 15)
// ============================================================

import { useRef, useState } from 'react';
import { useNotas } from '@/hooks/useNotas';
import { useToast } from '@/hooks/useToast';
import { PageLoading } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { processarOCR } from '@/services/notas.service';
import type { Nota, NotaItem } from '@/types';

const card  = 'rounded-2xl border border-gray-100 dark:border-[#2a2a32] bg-white dark:bg-[#1a1a1f] shadow-sm';
const label = 'mb-1 block text-xs font-semibold text-gray-600 dark:text-zinc-400';
const input = 'w-full rounded-xl border border-gray-200 dark:border-[#3a3a44] bg-white dark:bg-[#111118] px-3 py-2 text-sm text-gray-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none';
const tdIn  = 'rounded-lg border border-gray-200 dark:border-[#3a3a44] bg-white dark:bg-[#111118] px-2 py-1 text-xs text-gray-900 dark:text-zinc-100 focus:border-indigo-400 focus:outline-none w-full';

const FORM_VAZIO: Omit<Nota, 'id'> = {
  numero: '', fornecedor: '', valor_total: 0,
  data_emissao: new Date().toISOString().split('T')[0],
  status: 'pendente', itens: [],
};

const ITEM_VAZIO: Omit<NotaItem, 'id'> = {
  produto: '', codigo: '', quantidade: 1, unidade: 'un', valor_unitario: 0,
};

type CameraEstado = 'fechado' | 'streaming' | 'capturado' | 'processando';

export default function NotasPage() {
  const { notas, isLoading, criar, atualizar, excluir } = useNotas();
  const { success, error: toastError } = useToast();

  // OCR upload
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrErro, setOcrErro]       = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  // Modal nota
  const [modalAberto, setModalAberto] = useState(false);
  const [editando,    setEditando]    = useState<Nota | null>(null);
  const [form,        setForm]        = useState<Omit<Nota, 'id'>>(FORM_VAZIO);
  const [salvando,    setSalvando]    = useState(false);

  // Câmera (ITEM 15)
  const [cameraEstado,     setCameraEstado]     = useState<CameraEstado>('fechado');
  const [cameraErro,       setCameraErro]       = useState('');
  const [imagemCapturada,  setImagemCapturada]  = useState<string | null>(null);
  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  if (isLoading) return <PageLoading />;

  // ── Itens helpers ────────────────────────────────────────
  function calcTotal(itens: Omit<NotaItem, 'id'>[]): number {
    return parseFloat(itens.reduce((s, i) => s + i.quantidade * i.valor_unitario, 0).toFixed(2));
  }

  function addItem() {
    const novosItens = [...form.itens, { ...ITEM_VAZIO }];
    setForm(p => ({ ...p, itens: novosItens, valor_total: calcTotal(novosItens) }));
  }

  function removeItem(idx: number) {
    const novosItens = form.itens.filter((_, i) => i !== idx);
    setForm(p => ({ ...p, itens: novosItens, valor_total: calcTotal(novosItens) }));
  }

  function updateItem(idx: number, campo: keyof Omit<NotaItem, 'id'>, valor: string | number) {
    const novosItens = form.itens.map((item, i) => i === idx ? { ...item, [campo]: valor } : item);
    setForm(p => ({
      ...p,
      itens: novosItens,
      // Recalcula total apenas se não foi editado manualmente
      valor_total: novosItens.some(it => it.valor_unitario > 0) ? calcTotal(novosItens) : p.valor_total,
    }));
  }

  // ── Modal nota ──────────────────────────────────────────
  function abrirNovaNota() {
    setEditando(null);
    setForm(FORM_VAZIO);
    setModalAberto(true);
  }

  function abrirEditar(nota: Nota) {
    setEditando(nota);
    setForm({ numero: nota.numero, fornecedor: nota.fornecedor, valor_total: nota.valor_total, data_emissao: nota.data_emissao, status: nota.status, itens: nota.itens ?? [] });
    setModalAberto(true);
  }

  async function handleArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setOcrErro('');
    setOcrLoading(true);
    try {
      const dados = await processarOCR(file);
      setEditando(null);
      setForm({ ...FORM_VAZIO, ...dados });
      setModalAberto(true);
    } catch {
      setOcrErro('❌ Erro ao processar arquivo. Verifique se é imagem ou PDF válido.');
    } finally {
      setOcrLoading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    try {
      if (editando) { await atualizar(editando.id, form); success('Nota atualizada!'); }
      else          { await criar(form);                   success('Nota cadastrada!'); }
      setModalAberto(false);
      setForm(FORM_VAZIO);
    } catch {
      toastError('Erro ao salvar nota.');
    } finally {
      setSalvando(false);
    }
  }

  async function handleExcluir(id: number) {
    try { await excluir(id); success('Nota excluída.'); }
    catch { toastError('Erro ao excluir nota.'); }
  }

  // ── Câmera (ITEM 15) ─────────────────────────────────────
  function pararCamera() {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }

  function fecharCamera() {
    pararCamera();
    setCameraEstado('fechado');
    setCameraErro('');
    setImagemCapturada(null);
  }

  async function abrirCamera() {
    setCameraErro('');
    setImagemCapturada(null);
    setCameraEstado('streaming');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      streamRef.current = stream;
      requestAnimationFrame(() => {
        if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play().catch(() => null); }
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      setCameraErro(msg.includes('NotAllowed') ? '📵 Permissão negada.' : '❌ Câmera indisponível.');
      setCameraEstado('fechado');
    }
  }

  function capturarFoto() {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current, c = canvasRef.current;
    c.width = v.videoWidth || 1280; c.height = v.videoHeight || 720;
    c.getContext('2d')?.drawImage(v, 0, 0, c.width, c.height);
    setImagemCapturada(c.toDataURL('image/jpeg', 0.92));
    pararCamera();
    setCameraEstado('capturado');
  }

  async function refazerFoto() { setImagemCapturada(null); await abrirCamera(); }

  async function processarFotoCapturada() {
    if (!canvasRef.current) return;
    setCameraEstado('processando');
    try {
      const blob: Blob = await new Promise((res, rej) =>
        canvasRef.current!.toBlob(b => b ? res(b) : rej(new Error('fail')), 'image/jpeg', 0.92));
      const dados = await processarOCR(new File([blob], 'camera_nota.jpg', { type: 'image/jpeg' }));
      fecharCamera();
      setEditando(null);
      setForm({ ...FORM_VAZIO, ...dados });
      setModalAberto(true);
    } catch {
      setCameraErro('❌ Erro no OCR. Tente novamente.');
      setCameraEstado('capturado');
    }
  }

  const totalProcessadas = notas.filter(n => n.status === 'processada').reduce((s, n) => s + n.valor_total, 0);

  return (
    <div className="space-y-4">

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total de Notas', value: `${notas.length}`,                                        color: 'text-gray-900 dark:text-zinc-100',    bg: 'bg-white dark:bg-[#1a1a1f]' },
          { label: 'Processadas',    value: `${notas.filter(n => n.status === 'processada').length}`,  color: 'text-green-700 dark:text-green-400',   bg: 'bg-green-50 dark:bg-green-950/40' },
          { label: 'Valor Total',    value: formatCurrency(totalProcessadas),                          color: 'text-indigo-700 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/40' },
        ].map(c => (
          <div key={c.label} className={`rounded-2xl border border-gray-100 dark:border-[#2a2a32] ${c.bg} p-4 shadow-sm`}>
            <p className="text-xs text-gray-500 dark:text-zinc-400">{c.label}</p>
            <p className={`text-lg font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Ações */}
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={abrirNovaNota} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
          <i className="bi bi-plus-lg" /> Nova Nota
        </button>
        <label className={`flex cursor-pointer items-center gap-2 rounded-xl border border-indigo-300 dark:border-indigo-700 px-4 py-2 text-sm font-medium text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 transition-colors ${ocrLoading ? 'opacity-60 pointer-events-none' : ''}`}>
          {ocrLoading ? <><i className="bi bi-arrow-clockwise animate-spin" /> Processando...</> : <><i className="bi bi-camera" /> Scan com OCR</>}
          <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleArquivo} />
        </label>
        <button onClick={abrirCamera} disabled={ocrLoading} className="flex items-center gap-2 rounded-xl border border-emerald-300 dark:border-emerald-700 px-4 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 transition-colors disabled:opacity-60">
          <i className="bi bi-camera-video" /> Tirar Foto
        </button>
      </div>

      {ocrErro && (
        <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 px-4 py-3">
          <p className="text-sm text-red-700 dark:text-red-400">{ocrErro}</p>
          <button onClick={() => setOcrErro('')} className="mt-1 text-xs text-red-500 underline">Fechar</button>
        </div>
      )}

      {/* Tabela */}
      <div className={`overflow-hidden ${card}`}>
        {notas.length === 0 ? (
          <EmptyState icon="bi-receipt" title="Nenhuma nota fiscal" description="Adicione notas, escaneie ou tire uma foto" actionLabel="Nova Nota" onAction={abrirNovaNota} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 dark:border-[#2a2a32] bg-gray-50 dark:bg-[#111118]">
                <tr>
                  {['Número','Fornecedor','Data Emissão','Itens','Valor Total','Status','Ações'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-zinc-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-[#2a2a32]">
                {notas.map(n => (
                  <tr key={n.id} className="hover:bg-gray-50 dark:hover:bg-[#27272d] transition-colors">
                    <td className="px-4 py-3 font-mono text-sm font-medium text-gray-900 dark:text-zinc-100">{n.numero}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-zinc-300">{n.fornecedor}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-zinc-400">{formatDate(n.data_emissao)}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-zinc-400">{n.itens?.length ?? 0} item(s)</td>
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-zinc-100">{formatCurrency(n.valor_total)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${n.status === 'processada' ? 'bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400' : 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400'}`}>
                        {n.status === 'processada' ? '✅ Processada' : '⏳ Pendente'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => abrirEditar(n)} className="rounded-lg bg-indigo-100 dark:bg-indigo-950/50 px-2 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 transition-colors">✏️ Editar</button>
                        <button onClick={() => handleExcluir(n.id)} className="rounded-lg bg-red-100 dark:bg-red-950/50 px-2 py-1 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-200 transition-colors">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── MODAL CÂMERA (ITEM 15) ── */}
      {cameraEstado !== 'fechado' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#1a1a1f] border border-gray-100 dark:border-[#2a2a32] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-[#2a2a32]">
              <div className="flex items-center gap-2">
                <i className="bi bi-camera-video text-emerald-600" />
                <h2 className="text-base font-bold text-gray-900 dark:text-zinc-100">
                  {cameraEstado === 'streaming' ? 'Câmera ao Vivo' : cameraEstado === 'capturado' ? 'Foto Capturada' : 'Processando OCR...'}
                </h2>
              </div>
              <button onClick={fecharCamera} disabled={cameraEstado === 'processando'} className="text-gray-400 hover:text-gray-600 disabled:opacity-40"><i className="bi bi-x-lg text-lg" /></button>
            </div>
            <div className="p-5 space-y-4">
              {cameraErro && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{cameraErro}</div>}
              <div className="relative overflow-hidden rounded-xl bg-black aspect-video">
                {cameraEstado === 'streaming' && <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />}
                {(cameraEstado === 'capturado' || cameraEstado === 'processando') && imagemCapturada && <img src={imagemCapturada} alt="Captura" className="w-full h-full object-cover" />}
                {cameraEstado === 'processando' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 gap-3">
                    <div className="h-10 w-10 rounded-full border-4 border-emerald-400 border-t-transparent animate-spin" />
                    <p className="text-sm font-medium text-white">Analisando com OCR...</p>
                  </div>
                )}
                {cameraEstado === 'streaming' && <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="w-4/5 h-4/5 border-2 border-white/40 rounded-lg" /></div>}
              </div>
              <canvas ref={canvasRef} className="hidden" />
              <div className="flex gap-3">
                {cameraEstado === 'streaming' && (
                  <>
                    <button onClick={fecharCamera} className="flex-1 rounded-xl border border-gray-200 dark:border-[#3a3a44] py-2.5 text-sm text-gray-600 dark:text-zinc-400 hover:bg-gray-50 transition-colors">Cancelar</button>
                    <button onClick={capturarFoto} className="flex-[2] flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"><i className="bi bi-camera" /> Capturar</button>
                  </>
                )}
                {cameraEstado === 'capturado' && (
                  <>
                    <button onClick={refazerFoto} className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-[#3a3a44] py-2.5 text-sm text-gray-600 dark:text-zinc-400 hover:bg-gray-50 transition-colors"><i className="bi bi-arrow-counterclockwise" /> Refazer</button>
                    <button onClick={processarFotoCapturada} className="flex-[2] flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"><i className="bi bi-magic" /> Processar com OCR</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL NOTA (criar/editar + itens) — ITEM 04 ── */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-[#1a1a1f] border border-gray-100 dark:border-[#2a2a32] shadow-2xl max-h-[90vh] flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[#2a2a32] flex-shrink-0">
              <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">
                {editando ? '✏️ Editar Nota Fiscal' : '🧾 Nova Nota Fiscal'}
              </h2>
              <button onClick={() => setModalAberto(false)} className="text-gray-400 hover:text-gray-600"><i className="bi bi-x-lg" /></button>
            </div>

            {/* Body scrollável */}
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

              {/* Banner OCR */}
              {form.fornecedor === 'Fornecedor via OCR' && (
                <div className="rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 px-3 py-2">
                  <p className="text-xs text-indigo-700 dark:text-indigo-400">✨ Campos preenchidos via OCR — revise antes de salvar.</p>
                </div>
              )}

              {/* Campos principais */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={label}>Número *</label>
                  <input required value={form.numero} onChange={e => setForm(p => ({ ...p, numero: e.target.value }))} className={input} placeholder="NF-0001" />
                </div>
                <div>
                  <label className={label}>Data Emissão *</label>
                  <input required type="date" value={form.data_emissao} onChange={e => setForm(p => ({ ...p, data_emissao: e.target.value }))} className={input} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={label}>Fornecedor *</label>
                  <input required value={form.fornecedor} onChange={e => setForm(p => ({ ...p, fornecedor: e.target.value }))} className={input} placeholder="Nome do fornecedor" />
                </div>
                <div>
                  <label className={label}>Status</label>
                  <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as Nota['status'] }))}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#3a3a44] bg-white dark:bg-[#111118] px-3 py-2 text-sm text-gray-900 dark:text-zinc-100 focus:outline-none">
                    <option value="pendente">⏳ Pendente</option>
                    <option value="processada">✅ Processada</option>
                  </select>
                </div>
              </div>

              {/* ── Seção de Itens — ITEM 04 ── */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-zinc-300">📦 Itens da Nota</h3>
                  <button type="button" onClick={addItem}
                    className="flex items-center gap-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors">
                    <i className="bi bi-plus-lg" /> Adicionar item
                  </button>
                </div>

                {form.itens.length === 0 ? (
                  <div className="rounded-xl border-2 border-dashed border-gray-200 dark:border-[#3a3a44] py-6 text-center">
                    <p className="text-xs text-gray-400 dark:text-zinc-500">Nenhum item. Clique em "Adicionar item" para começar.</p>
                  </div>
                ) : (
                  <div className="space-y-2 overflow-x-auto">
                    {/* Header das colunas */}
                    <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-zinc-500 px-1">
                      <span>Produto</span><span>Código</span><span>Qtd</span><span>Un.</span><span>Vlr. Unit.</span><span />
                    </div>
                    {form.itens.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-1 items-center">
                        <input value={item.produto} onChange={e => updateItem(idx, 'produto', e.target.value)} className={tdIn} placeholder="Produto" />
                        <input value={item.codigo ?? ''} onChange={e => updateItem(idx, 'codigo', e.target.value)} className={tdIn} placeholder="Código" />
                        <input type="number" min="0.01" step="0.01" value={item.quantidade}
                          onChange={e => updateItem(idx, 'quantidade', parseFloat(e.target.value) || 0)} className={tdIn} />
                        <input value={item.unidade} onChange={e => updateItem(idx, 'unidade', e.target.value)} className={tdIn} placeholder="un" />
                        <input type="number" min="0" step="0.01" value={item.valor_unitario}
                          onChange={e => updateItem(idx, 'valor_unitario', parseFloat(e.target.value) || 0)} className={tdIn} placeholder="0,00" />
                        <button type="button" onClick={() => removeItem(idx)}
                          className="flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:bg-red-100 hover:text-red-500 transition-colors text-xs">✕</button>
                      </div>
                    ))}

                    {/* Subtotal dos itens */}
                    <div className="flex justify-end pt-1 text-xs text-gray-500 dark:text-zinc-400">
                      <span>Subtotal itens: <strong className="text-indigo-600 dark:text-indigo-400">{formatCurrency(calcTotal(form.itens))}</strong></span>
                    </div>
                  </div>
                )}
              </div>

              {/* Valor Total (editável manualmente) */}
              <div>
                <label className={label}>Valor Total (R$) *</label>
                <input required type="number" step="0.01" min="0"
                  value={form.valor_total === 0 ? '' : form.valor_total}
                  onChange={e => setForm(p => ({ ...p, valor_total: parseFloat(e.target.value) || 0 }))}
                  className={input} placeholder="0,00" />
                {form.itens.length > 0 && (
                  <button type="button" onClick={() => setForm(p => ({ ...p, valor_total: calcTotal(p.itens) }))}
                    className="mt-1 text-xs text-indigo-500 hover:underline">
                    ↑ Usar subtotal dos itens ({formatCurrency(calcTotal(form.itens))})
                  </button>
                )}
              </div>
            </div>

            {/* Footer fixo */}
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100 dark:border-[#2a2a32] flex-shrink-0">
              <button type="button" onClick={() => setModalAberto(false)}
                className="flex-1 rounded-xl border border-gray-200 dark:border-[#3a3a44] py-2 text-sm text-gray-600 dark:text-zinc-400 hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button onClick={handleSalvar} disabled={salvando}
                className="flex-1 rounded-xl bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors">
                {salvando ? 'Salvando...' : editando ? 'Salvar Alterações' : 'Salvar Nota'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
