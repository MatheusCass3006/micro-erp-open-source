// ============================================================
// SERVICE: Maquininhas — ITEM 01
// CRUD completo — alterna mock / API real
// ============================================================

import { api } from './api';
import type { Maquininha, TipoPagamento } from '@/types';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

// ── Mock inicial ──────────────────────────────────────────────
let _mock: Maquininha[] = [
  { id: 1, nome: 'PagSeguro Débito',   tipo: 'debito',      taxa: 1.99,  ativo: true  },
  { id: 2, nome: 'PagSeguro Crédito',  tipo: 'credito',     taxa: 3.49,  ativo: true  },
  { id: 3, nome: 'Mercado Pago PIX',   tipo: 'pix',         taxa: 0.99,  ativo: true  },
  { id: 4, nome: 'Dinheiro / Espécie', tipo: 'dinheiro',    taxa: 0,     ativo: true  },
  { id: 5, nome: 'Vale Alimentação',   tipo: 'alimentacao', taxa: 2.50,  ativo: false },
];
let _nextId = 10;

// ── Tipos do backend ──────────────────────────────────────────
// Backend retorna: { id, nome, tipo, taxa_percentual, ativa }
interface MaquininhaBackend {
  id:              number;
  nome:            string;
  tipo:            string;
  taxa_percentual: number;  // percentual já calculado (ex: 3.49)
  ativa:           boolean; // backend usa "ativa", não "ativo"
}

function adaptar(m: MaquininhaBackend): Maquininha {
  return {
    id:    m.id,
    nome:  m.nome,
    tipo:  m.tipo as TipoPagamento,
    taxa:  m.taxa_percentual,  // backend envia taxa_percentual
    ativo: m.ativa,            // backend envia "ativa", frontend usa "ativo"
  };
}

// ── Service functions ─────────────────────────────────────────

export async function getMaquininhas(): Promise<Maquininha[]> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 200));
    return [..._mock];
  }
  const res = await api.get<MaquininhaBackend[]>('/api/maquininhas');
  return (Array.isArray(res) ? res : []).map(adaptar);
}

export async function createMaquininha(
  data: Omit<Maquininha, 'id'>
): Promise<Maquininha> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 300));
    const nova = { ...data, id: _nextId++ };
    _mock.unshift(nova);
    return nova;
  }
  // Backend DTO espera: { nome, tipo, taxa_percentual }
  const payload = {
    nome:            data.nome,
    tipo:            data.tipo,
    taxa_percentual: data.taxa,  // frontend usa "taxa", backend espera "taxa_percentual"
  };
  const res = await api.post<MaquininhaBackend>('/api/maquininhas', payload);
  return adaptar(res);
}

export async function updateMaquininha(
  id: number,
  data: Partial<Omit<Maquininha, 'id'>>
): Promise<Maquininha> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 200));
    _mock = _mock.map(m => m.id === id ? { ...m, ...data } : m);
    return _mock.find(m => m.id === id)!;
  }
  // Mapeia campos frontend → backend
  const payload: Record<string, unknown> = {};
  if (data.nome  !== undefined) payload.nome            = data.nome;
  if (data.tipo  !== undefined) payload.tipo            = data.tipo;
  if (data.taxa  !== undefined) payload.taxa_percentual = data.taxa;
  if (data.ativo !== undefined) payload.ativa           = data.ativo;

  const res = await api.put<MaquininhaBackend>(`/api/maquininhas/${id}`, payload);
  return adaptar(res);
}

export async function deleteMaquininha(id: number): Promise<void> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 200));
    _mock = _mock.filter(m => m.id !== id);
    return;
  }
  return api.delete(`/api/maquininhas/${id}`);
}

export async function toggleMaquininha(id: number, ativo: boolean): Promise<Maquininha> {
  return updateMaquininha(id, { ativo });
}
