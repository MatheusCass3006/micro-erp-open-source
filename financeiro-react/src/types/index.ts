// ============================================================
// TIPOS GLOBAIS — MicroERP
// Todos os tipos do sistema em um único ponto de verdade
// ============================================================

// ── Autenticação ──────────────────────────────────────────────
export interface Usuario {
  id: number;
  nome: string;
  email: string;
  role: 'admin' | 'financeiro' | 'operador';
  ativo: boolean;
}

export interface Empresa {
  id: number;
  nome: string;
  cnpj?: string;
}

export interface AuthState {
  usuario: Usuario | null;
  empresa: Empresa | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ── Financeiro ────────────────────────────────────────────────
export interface Boleto {
  id: number;
  descricao: string;
  beneficiario: string;
  valor: number;
  vencimento: string;
  status: 'pendente' | 'pago' | 'atrasado' | 'cancelado';
  data_pagamento?: string;
  linha_digitavel?: string;
  observacao?: string;
}

export type TipoPagamento = 'dinheiro' | 'pix' | 'debito' | 'credito' | 'transferencia' | 'alimentacao';

export interface Maquininha {
  id: number;
  nome: string;
  tipo: TipoPagamento;
  taxa: number;
  ativo: boolean;
}

export interface Entrada {
  id: number;
  descricao: string;
  valor_bruto: number;
  valor_liquido: number;
  taxa_percentual: number;
  tipo: TipoPagamento;
  maquininha?: string;    // nome da maquininha (display)
  maquininha_id?: number; // id para vínculo real com o backend
  data: string;
}

export interface Saida {
  id: number;
  descricao: string;
  valor: number;
  categoria: string;
  data: string;
  observacao?: string;
  secao?: 'empresa' | 'pessoal'; // ITEM 05
}

export interface NotaItem {
  id?: number;
  produto: string;
  codigo?: string;
  quantidade: number;
  unidade: string;
  valor_unitario: number;
}

export interface Nota {
  id: number;
  numero: string;
  fornecedor: string;
  valor_total: number;
  data_emissao: string;
  status: 'pendente' | 'processada';
  itens: NotaItem[];
}

export interface Categoria {
  id: number;
  nome: string;
  tipo: 'empresa' | 'pessoal';
}

// ── Dashboard ─────────────────────────────────────────────────
// Mapeado ao contrato real do backend Node.js:
//   GET /api/dashboard/resumo   → entradas, saidas, saldo, boletos, notas
//   GET /api/dashboard/evolucao → array mensal
//   GET /api/dashboard/top-despesas → top por categoria
export interface DashboardData {
  // Entradas do mês
  total_entradas_bruto: number;
  total_entradas_liquido: number;
  total_taxas: number;

  // Saídas do mês
  total_saidas: number;

  // Saldo
  saldo_mes: number;
  saldo_positivo: boolean;

  // Boletos pendentes (backend não expõe boletos pagos no resumo)
  boletos_pendentes: number;          // quantidade
  valor_boletos_pendentes: number;    // valor total pendente

  // Notas fiscais do mês
  notas_quantidade: number;
  notas_valor_total: number;

  // Top despesas por categoria
  saidas_por_categoria: { categoria: string; secao: string; total: number }[];

  // Evolução mensal (últimos N meses)
  grafico_meses: { mes: string; entradas: number; saidas: number; saldo: number }[];
}

// ── Configurações ─────────────────────────────────────────────
export interface Configuracoes {
  nome_empresa?: string;
  moeda?: string;
  tema?: 'light' | 'dark';
  alertas_vencimento?: number;
  notificacoes?: boolean;
}

// ── API helpers ───────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
}

// ── Form types (sem id) ───────────────────────────────────────
export type BoletoForm = Omit<Boleto, 'id'>;
export type EntradaForm = Omit<Entrada, 'id'>;
export type SaidaForm = Omit<Saida, 'id'>;
export type NotaForm = Omit<Nota, 'id'>;
