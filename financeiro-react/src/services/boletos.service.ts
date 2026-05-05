// ============================================================
// BOLETOS SERVICE — MicroERP
// ============================================================

import type { Boleto, BoletoForm } from '@/types';
import { mockBoletos } from '@/mocks/data';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

// Estado local para mock (simula banco em memória)
let _mockData = [...mockBoletos];

export async function getBoletos(filtros?: { status?: string; mes?: number }): Promise<Boleto[]> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 200));
    let result = [..._mockData];
    if (filtros?.status) result = result.filter(b => b.status === filtros.status);
    if (filtros?.mes) result = result.filter(b => new Date(b.vencimento).getMonth() + 1 === filtros.mes);
    return result;
  }

  const params = new URLSearchParams();
  if (filtros?.status) params.set('status', filtros.status);
  if (filtros?.mes) params.set('mes', String(filtros.mes));
  const { api } = await import('./api');
  return api.get<Boleto[]>(`/api/boletos?${params}`);
}

export async function createBoleto(data: BoletoForm): Promise<Boleto> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 200));
    const novo: Boleto = { id: Date.now(), ...data, status: 'pendente' };
    _mockData.unshift(novo);
    return novo;
  }
  const { api } = await import('./api');
  return api.post<Boleto>('/api/boletos', data);
}

export async function updateBoleto(id: number, data: Partial<Boleto>): Promise<Boleto> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 200));
    const idx = _mockData.findIndex(b => b.id === id);
    // Bug #3 fix: idx pode ser -1 se item não for encontrado → _mockData[-1] = undefined → crash
    if (idx === -1) throw new Error(`Boleto ${id} não encontrado`);
    _mockData[idx] = { ..._mockData[idx], ...data };
    return { ..._mockData[idx] };
  }
  // Backend usa PUT (substituição parcial), não PATCH
  const { api } = await import('./api');
  return api.put<Boleto>(`/api/boletos/${id}`, data);
}

export async function deleteBoleto(id: number): Promise<void> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 200));
    _mockData = _mockData.filter(b => b.id !== id);
    return;
  }
  const { api } = await import('./api');
  return api.delete(`/api/boletos/${id}`);
}
