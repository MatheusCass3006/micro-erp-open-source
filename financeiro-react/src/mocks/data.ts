// ============================================================
// MOCK DATA — MicroERP
// Dados realistas para desenvolvimento sem backend real
// ============================================================

import type { Boleto, Maquininha, Entrada, Saida, DashboardData } from '@/types';

export const mockBoletos: Boleto[] = [
  { id: 1, descricao: 'Conta de Luz CEMIG', beneficiario: 'CEMIG', valor: 320.50, vencimento: '2026-04-15', status: 'pago', data_pagamento: '2026-04-14' },
  { id: 2, descricao: 'Internet Claro Fibra', beneficiario: 'Claro', valor: 149.90, vencimento: '2026-04-20', status: 'pendente' },
  { id: 3, descricao: 'Aluguel Comercial', beneficiario: 'Imobiliária SP', valor: 2800.00, vencimento: '2026-04-05', status: 'pago', data_pagamento: '2026-04-05' },
  { id: 4, descricao: 'Conta de Água SAAE', beneficiario: 'SAAE', valor: 85.30, vencimento: '2026-04-28', status: 'pendente' },
  { id: 5, descricao: 'Seguro Empresarial', beneficiario: 'Porto Seguro', valor: 520.00, vencimento: '2026-03-30', status: 'atrasado' },
];

export const mockMaquininhas: Maquininha[] = [
  { id: 1, nome: 'Dinheiro', tipo: 'dinheiro', taxa: 0, ativo: true },
  { id: 2, nome: 'PIX', tipo: 'pix', taxa: 0, ativo: true },
  { id: 3, nome: 'Débito Sicoob', tipo: 'debito', taxa: 1.5, ativo: true },
  { id: 4, nome: 'Crédito Sicoob', tipo: 'credito', taxa: 2.8, ativo: true },
  { id: 5, nome: 'Vale Alimentação', tipo: 'alimentacao', taxa: 1.2, ativo: true },
];

export const mockEntradas: Entrada[] = [
  { id: 1, descricao: 'Venda produtos', tipo: 'pix', maquininha: 'PIX', valor_bruto: 1500.00, taxa_percentual: 0, valor_liquido: 1500.00, data: '2026-04-18' },
  { id: 2, descricao: 'Venda do dia', tipo: 'debito', maquininha: 'Débito Sicoob', valor_bruto: 800.00, taxa_percentual: 1.5, valor_liquido: 788.00, data: '2026-04-17' },
  { id: 3, descricao: 'Venda balcão', tipo: 'dinheiro', maquininha: 'Dinheiro', valor_bruto: 450.00, taxa_percentual: 0, valor_liquido: 450.00, data: '2026-04-16' },
  { id: 4, descricao: 'Pedido grande', tipo: 'credito', maquininha: 'Crédito Sicoob', valor_bruto: 1200.00, taxa_percentual: 2.8, valor_liquido: 1166.40, data: '2026-04-15' },
  { id: 5, descricao: 'Serviço avulso', tipo: 'pix', maquininha: 'PIX', valor_bruto: 320.00, taxa_percentual: 0, valor_liquido: 320.00, data: '2026-04-14' },
];

export const mockSaidas: Saida[] = [
  { id: 1, descricao: 'Compra de mercadorias', categoria: 'Fornecedores', valor: 1800.00, data: '2026-04-10' },
  { id: 2, descricao: 'Folha de pagamento', categoria: 'Funcionários', valor: 2500.00, data: '2026-04-05' },
  { id: 3, descricao: 'Supermercado', categoria: 'Outros', valor: 350.00, data: '2026-04-12' },
  { id: 4, descricao: 'Gasolina', categoria: 'Outros', valor: 280.00, data: '2026-04-08' },
  { id: 5, descricao: 'Redes sociais', categoria: 'Marketing', valor: 600.00, data: '2026-04-03' },
];

export const mockDashboard: DashboardData = {
  total_entradas_bruto:    4270.00,
  total_entradas_liquido:  4224.40,
  total_taxas:             45.60,
  total_saidas:            5530.00,
  saldo_mes:              -1305.60,
  saldo_positivo:          false,
  boletos_pendentes:       2,
  valor_boletos_pendentes: 235.20,
  notas_quantidade:        3,
  notas_valor_total:       5200.00,
  saidas_por_categoria: [
    { categoria: 'Funcionários',  secao: 'empresa', total: 2500.00 },
    { categoria: 'Fornecedores',  secao: 'empresa', total: 1800.00 },
    { categoria: 'Marketing',     secao: 'empresa', total: 600.00 },
    { categoria: 'Outros',        secao: 'empresa', total: 630.00 },
  ],
  grafico_meses: [
    { mes: 'nov.', entradas: 3200, saidas: 1800, saldo: 1400 },
    { mes: 'dez.', entradas: 4100, saidas: 2200, saldo: 1900 },
    { mes: 'jan.', entradas: 2900, saidas: 1500, saldo: 1400 },
    { mes: 'fev.', entradas: 3800, saidas: 2100, saldo: 1700 },
    { mes: 'mar.', entradas: 4224, saidas: 3120, saldo: 1104 },
    { mes: 'abr.', entradas: 3600, saidas: 5530, saldo: -1930 },
  ],
};
