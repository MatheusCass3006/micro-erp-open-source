// ============================================================
// FORMATADORES — MicroERP
// Funções puras de formatação. Sem dependências externas.
// ============================================================

/**
 * Formata valor para moeda brasileira
 * @example formatCurrency(1234.56) → "R$ 1.234,56"
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formata data ISO para data brasileira
 * @example formatDate("2026-04-23") → "23/04/2026"
 */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('pt-BR');
}

/**
 * Formata data completa com dia da semana
 * @example formatDateFull("2026-04-23") → "quinta-feira, 23 de abril de 2026"
 */
export function formatDateFull(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Formata percentual
 * @example formatPercent(1.5) → "1,50%"
 */
export function formatPercent(value: number): string {
  return `${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
}

/**
 * Emoji por tipo de maquininha
 */
export function tipoIcon(tipo: string): string {
  const map: Record<string, string> = {
    dinheiro: '💵',
    pix: '💙',
    debito: '💳',
    credito: '💳',
    alimentacao: '🍽️',
  };
  return map[tipo] || '💳';
}

/**
 * Cor de badge por status do boleto
 */
export function statusBadgeClass(status: string): string {
  const map: Record<string, string> = {
    pendente: 'bg-yellow-100 text-yellow-800',
    pago: 'bg-green-100 text-green-800',
    atrasado: 'bg-red-100 text-red-800',
    cancelado: 'bg-gray-100 text-gray-600',
  };
  return map[status] || 'bg-gray-100 text-gray-600';
}

/**
 * Retorna o mês atual como número (1-12)
 */
export function getMesAtual(): number {
  return new Date().getMonth() + 1;
}

/**
 * Retorna o ano atual
 */
export function getAnoAtual(): number {
  return new Date().getFullYear();
}

/**
 * Gera array de anos para select (atual - 3 até atual + 1)
 */
export function getAnosDisponiveis(): number[] {
  const atual = getAnoAtual();
  return Array.from({ length: 5 }, (_, i) => atual + 1 - i);
}

/**
 * Nomes dos meses em português
 */
export const MESES = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' },
];
