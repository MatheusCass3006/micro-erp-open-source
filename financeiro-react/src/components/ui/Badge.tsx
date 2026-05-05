// ============================================================
// COMPONENTE: Badge
// Badge de status para boletos, entradas, saídas etc.
// Aceita qualquer string — mostra fallback para status desconhecido
// ============================================================

interface BadgeProps {
  status: string;
  label?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  // Boletos
  pendente:      { label: 'Pendente',     className: 'bg-yellow-100 text-yellow-800 border border-yellow-200' },
  pago:          { label: 'Pago ✅',      className: 'bg-green-100 text-green-800 border border-green-200' },
  atrasado:      { label: 'Atrasado ⚠️',  className: 'bg-red-100 text-red-800 border border-red-200' },
  cancelado:     { label: 'Cancelado',    className: 'bg-gray-100 text-gray-600 border border-gray-200' },
  // Tipos de pagamento (Entradas)
  dinheiro:      { label: '💵 Dinheiro',  className: 'bg-emerald-100 text-emerald-800 border border-emerald-200' },
  pix:           { label: '⚡ PIX',       className: 'bg-blue-100 text-blue-800 border border-blue-200' },
  debito:        { label: '💳 Débito',    className: 'bg-indigo-100 text-indigo-800 border border-indigo-200' },
  credito:       { label: '💳 Crédito',   className: 'bg-purple-100 text-purple-800 border border-purple-200' },
  transferencia: { label: '🏦 Transferência', className: 'bg-cyan-100 text-cyan-800 border border-cyan-200' },
  alimentacao:   { label: '🍽️ Alimentação', className: 'bg-orange-100 text-orange-800 border border-orange-200' },
  // Notas
  processada:    { label: '✅ Processada', className: 'bg-green-100 text-green-800 border border-green-200' },
};

export function Badge({ status, label }: BadgeProps) {
  const config = statusConfig[status] ?? { label: status, className: 'bg-gray-100 text-gray-600 border border-gray-200' };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}>
      {label ?? config.label}
    </span>
  );
}
