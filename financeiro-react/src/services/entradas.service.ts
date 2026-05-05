// ============================================================
// SERVICE: Entradas
// Alterna entre mock in-memory e API real via env var
//
// MAPEAMENTO backend → frontend:
//   maquininha_nome → maquininha  (string display name)
//   taxa_aplicada   → taxa_percentual (% da máquina)
//   tipo            → derivado do maquininha_nome (simplificado)
// ============================================================

import { mockEntradas } from '@/mocks/data';
import { api } from './api';
import type { Entrada, TipoPagamento } from '@/types';

// Estado mock in-memory (mutável localmente durante a sessão)
let _entradas: Entrada[] = [...mockEntradas];
let _nextId = 100;

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

// ── Tipos internos do backend ──────────────────────────────────────────────────

interface EntradaBackend {
  id:              number;
  maquininha_id:   number | null;
  maquininha_nome: string;
  descricao:       string | null;
  valor_bruto:     number;
  taxa_aplicada:   number;
  valor_taxa:      number;
  valor_liquido:   number;
  data:            string;
  observacao:      string | null;
}

interface EntradaListResponse {
  total: number;
  items: EntradaBackend[];
}

// ── Adaptador backend → frontend ──────────────────────────────────────────────

/**
 * Converte o formato do backend (com maquininha_id + nome) para o formato
 * simplificado do frontend (com tipo + maquininha como string).
 * Enquanto não há lookup de tipo por maquininha_id, usamos 'pix' como padrão.
 */
function adaptarEntrada(e: EntradaBackend): Entrada {
  // Tenta inferir o tipo pelo nome da máquina (heurística simples)
  const nomeLower = (e.maquininha_nome ?? '').toLowerCase();
  let tipo: TipoPagamento = 'pix';
  if (nomeLower.includes('dinheiro') || nomeLower.includes('espécie') || nomeLower.includes('especie')) tipo = 'dinheiro';
  else if (nomeLower.includes('débito') || nomeLower.includes('debito')) tipo = 'debito';
  else if (nomeLower.includes('crédito') || nomeLower.includes('credito')) tipo = 'credito';
  else if (nomeLower.includes('transfer') || nomeLower.includes('ted') || nomeLower.includes('doc')) tipo = 'transferencia';
  else if (nomeLower.includes('alimenta') || nomeLower.includes('ticket') || nomeLower.includes('vale')) tipo = 'alimentacao';

  return {
    id:              e.id,
    descricao:       e.descricao ?? '',
    valor_bruto:     e.valor_bruto,
    valor_liquido:   e.valor_liquido,
    taxa_percentual: e.taxa_aplicada,
    tipo,
    maquininha:      e.maquininha_nome !== 'Manual' ? e.maquininha_nome : undefined,
    data:            e.data,
  };
}

// ── Service functions ──────────────────────────────────────────────────────────

export async function getEntradas(params?: { tipo?: string; mes?: number; ano?: number }): Promise<Entrada[]> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 300));
    let result = [..._entradas];
    if (params?.tipo) result = result.filter(e => e.tipo === params.tipo);
    if (params?.mes) result = result.filter(e => new Date(e.data).getMonth() + 1 === params.mes);
    if (params?.ano) result = result.filter(e => new Date(e.data).getFullYear() === params.ano);
    return result;
  }

  // ── Backend real ──────────────────────────────────────────────────────────────
  const qs = new URLSearchParams();
  // Backend não filtra por tipo, mas filtra por mês/ano
  if (params?.mes) qs.set('mes', String(params.mes));
  if (params?.ano) qs.set('ano', String(params.ano));

  const response = await api.get<EntradaListResponse>(`/api/entradas?${qs}`);
  const items = Array.isArray(response) ? response : (response.items ?? []);

  let entradas = items.map(adaptarEntrada);

  // Filtro por tipo é feito no frontend (backend não suporta)
  if (params?.tipo) {
    entradas = entradas.filter(e => e.tipo === params.tipo);
  }

  return entradas;
}

export async function createEntrada(data: Omit<Entrada, 'id'>): Promise<Entrada> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 400));
    const nova = { ...data, id: _nextId++ };
    _entradas.unshift(nova);
    return nova;
  }

  // ── Backend real ──────────────────────────────────────────────────────────────
  // Backend espera: {maquininha_id?, descricao?, valor_bruto, data?, observacao?}
  const payload = {
    maquininha_id: data.maquininha_id ?? null, // usa o id real da maquininha selecionada
    descricao:     data.descricao,
    valor_bruto:   data.valor_bruto,
    data:          data.data,
  };

  const criada = await api.post<EntradaBackend>('/api/entradas', payload);
  return adaptarEntrada(criada);
}

export async function updateEntrada(id: number, data: Partial<Entrada>): Promise<Entrada> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 300));
    _entradas = _entradas.map(e => e.id === id ? { ...e, ...data } : e);
    return _entradas.find(e => e.id === id)!;
  }

  const payload: Record<string, unknown> = {};
  if (data.descricao   !== undefined) payload.descricao    = data.descricao;
  if (data.valor_bruto !== undefined) payload.valor_bruto  = data.valor_bruto;
  if (data.data        !== undefined) payload.data         = data.data;
  if (data.maquininha_id !== undefined) payload.maquininha_id = data.maquininha_id;

  const atualizada = await api.put<EntradaBackend>(`/api/entradas/${id}`, payload);
  return adaptarEntrada(atualizada);
}

export async function deleteEntrada(id: number): Promise<void> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 300));
    _entradas = _entradas.filter(e => e.id !== id);
    return;
  }
  return api.delete(`/api/entradas/${id}`);
}
