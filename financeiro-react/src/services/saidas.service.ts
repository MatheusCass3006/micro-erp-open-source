// ============================================================
// SERVICE: Saídas / Despesas
//
// MAPEAMENTO backend → frontend:
//   categoria_nome → categoria  (string display name)
//   forma_pagamento é enviada como 'pix' por padrão no create
// ============================================================

import { mockSaidas } from '@/mocks/data';
import { api } from './api';
import type { Saida } from '@/types';

let _saidas: Saida[] = [...mockSaidas];
let _nextId = 200;

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

// ── Tipos internos do backend ──────────────────────────────────────────────────

interface SaidaBackend {
  id:              number;
  categoria_id:    number | null;
  categoria_nome:  string | null;
  descricao:       string | null;
  valor:           number;
  data:            string;
  forma_pagamento: string;
  observacao:      string | null;
}

interface SaidaListResponse {
  total: number;
  items: SaidaBackend[];
}

// ── Adaptador backend → frontend ──────────────────────────────────────────────

function adaptarSaida(s: SaidaBackend): Saida {
  return {
    id:          s.id,
    descricao:   s.descricao ?? '',
    valor:       s.valor,
    categoria:   s.categoria_nome ?? 'Outros',
    data:        s.data,
    observacao:  s.observacao ?? undefined,
  };
}

// ── Service functions ──────────────────────────────────────────────────────────

export async function getSaidas(params?: { categoria?: string; mes?: number; ano?: number }): Promise<Saida[]> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 300));
    let result = [..._saidas];
    if (params?.categoria) result = result.filter(s => s.categoria === params.categoria);
    if (params?.mes) result = result.filter(s => new Date(s.data).getMonth() + 1 === params.mes);
    if (params?.ano) result = result.filter(s => new Date(s.data).getFullYear() === params.ano);
    return result;
  }

  // ── Backend real ──────────────────────────────────────────────────────────────
  const qs = new URLSearchParams();
  if (params?.mes) qs.set('mes', String(params.mes));
  if (params?.ano) qs.set('ano', String(params.ano));

  const response = await api.get<SaidaListResponse>(`/api/saidas?${qs}`);
  const items = Array.isArray(response) ? response : (response.items ?? []);

  let saidas = items.map(adaptarSaida);

  // Filtro por categoria feito no frontend
  if (params?.categoria) {
    saidas = saidas.filter(s => s.categoria === params.categoria);
  }

  return saidas;
}

export async function createSaida(data: Omit<Saida, 'id'>): Promise<Saida> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 400));
    const nova = { ...data, id: _nextId++ };
    _saidas.unshift(nova);
    return nova;
  }

  // ── Backend real ──────────────────────────────────────────────────────────────
  // Backend espera: {categoria_id?, descricao?, valor, data?, forma_pagamento, observacao?}
  // categoria_id=null → backend registra sem categoria (aceito)
  // forma_pagamento → enviamos 'pix' como padrão; futuramente expor no formulário
  const payload = {
    categoria_id:    null,   // TODO: lookup categoria_id por nome quando implementarmos seleção
    descricao:       data.descricao,
    valor:           data.valor,
    data:            data.data,
    forma_pagamento: 'pix', // padrão para compatibilidade; formulário não expõe campo ainda
    observacao:      data.observacao || undefined,
  };

  const criada = await api.post<SaidaBackend>('/api/saidas', payload);
  return adaptarSaida(criada);
}

export async function updateSaida(id: number, data: Partial<Saida>): Promise<Saida> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 300));
    _saidas = _saidas.map(s => s.id === id ? { ...s, ...data } : s);
    return _saidas.find(s => s.id === id)!;
  }

  const payload: Record<string, unknown> = {};
  if (data.descricao  !== undefined) payload.descricao  = data.descricao;
  if (data.valor      !== undefined) payload.valor      = data.valor;
  if (data.data       !== undefined) payload.data       = data.data;
  if (data.observacao !== undefined) payload.observacao = data.observacao;

  const atualizada = await api.patch<SaidaBackend>(`/api/saidas/${id}`, payload);
  return adaptarSaida(atualizada);
}

export async function deleteSaida(id: number): Promise<void> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 300));
    _saidas = _saidas.filter(s => s.id !== id);
    return;
  }
  return api.delete(`/api/saidas/${id}`);
}
