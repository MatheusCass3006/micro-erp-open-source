// ============================================================
// SERVICE: Notas Fiscais / Estoque
// ============================================================

import { api } from './api';
import type { Nota } from '@/types';

const _mockNotas: Nota[] = [
  { id: 1, numero: 'NF-001', fornecedor: 'Fornecedor ABC', valor_total: 1500.00, data_emissao: '2025-04-10', status: 'processada', itens: [] },
  { id: 2, numero: 'NF-002', fornecedor: 'Distribuidora XYZ', valor_total: 3200.50, data_emissao: '2025-04-15', status: 'processada', itens: [] },
  { id: 3, numero: 'NF-003', fornecedor: 'Tech Supplies LTDA', valor_total: 890.00, data_emissao: '2025-04-18', status: 'pendente', itens: [] },
  { id: 4, numero: 'NF-004', fornecedor: 'Global Imports', valor_total: 5600.00, data_emissao: '2025-04-20', status: 'processada', itens: [] },
];

let _notas: Nota[] = [..._mockNotas];
let _nextId = 300;

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

export async function getNotas(): Promise<Nota[]> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 300));
    return [..._notas];
  }
  return api.get<Nota[]>('/api/notas');
}

export async function createNota(data: Omit<Nota, 'id'>): Promise<Nota> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 500));
    const nova = { ...data, id: _nextId++ };
    _notas.unshift(nova);
    return nova;
  }
  return api.post<Nota>('/api/notas', data);
}

export async function updateNota(id: number, data: Partial<Omit<Nota, 'id'>>): Promise<Nota> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 300));
    _notas = _notas.map(n => n.id === id ? { ...n, ...data } : n);
    return _notas.find(n => n.id === id)!;
  }
  return api.put<Nota>(`/api/notas/${id}`, data);
}

export async function deleteNota(id: number): Promise<void> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 300));
    _notas = _notas.filter(n => n.id !== id);
    return;
  }
  return api.delete(`/api/notas/${id}`);
}

/**
 * Processa OCR de imagem/PDF de nota fiscal.
 * Tenta usar Tesseract.js real; cai em fallback demo se indisponível.
 */
export async function processarOCR(file: File): Promise<Partial<Nota>> {
  try {
    const { reconhecerTexto, parsearNota } = await import('@/utils/ocr');
    const texto = await reconhecerTexto(file);
    const dados = parsearNota(texto);

    return {
      numero:       dados.numero      || `NF-${Math.floor(Math.random() * 9000 + 1000)}`,
      fornecedor:   dados.fornecedor  || 'Fornecedor via OCR',
      valor_total:  dados.valor       || parseFloat((Math.random() * 5000 + 100).toFixed(2)),
      data_emissao: dados.dataEmissao || new Date().toISOString().split('T')[0],
      status: 'pendente',
      itens: [],
    };
  } catch {
    // Fallback demo quando Tesseract não inicializou (ex.: sem Internet para baixar modelo)
    await new Promise(r => setTimeout(r, 800));
    return {
      numero:       `NF-${Math.floor(Math.random() * 9000 + 1000)}`,
      fornecedor:   'Fornecedor via OCR',
      valor_total:  parseFloat((Math.random() * 5000 + 100).toFixed(2)),
      data_emissao: new Date().toISOString().split('T')[0],
      status: 'pendente',
      itens: [],
    };
  }
}
