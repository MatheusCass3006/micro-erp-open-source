// ============================================================
// COMPONENTE: StatCard
// Card de estatística do dashboard (Recebido, Boletos, Saldo...)
// Segue padrão visual: Stripe / Linear / Notion
// ============================================================

interface StatCardProps {
  label: string;
  value: string;
  subtitle?: string;
  icon: string;
  gradient: 'green' | 'red' | 'blue' | 'orange';
}

const gradientMap: Record<string, string> = {
  green:  'from-green-500 to-emerald-400',
  red:    'from-red-600 to-red-400',
  blue:   'from-slate-800 to-blue-900',
  orange: 'from-orange-500 to-amber-400',
};

export function StatCard({ label, value, subtitle, icon, gradient }: StatCardProps) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradientMap[gradient]} p-5 text-white shadow-lg`}>
      {/* Círculo decorativo */}
      <div className="absolute -right-5 -top-5 h-24 w-24 rounded-full bg-white/10" />

      <p className="text-xs font-semibold uppercase tracking-widest opacity-80">{label}</p>
      <p className="my-1 text-2xl font-bold">{value}</p>
      {subtitle && <p className="text-xs opacity-70">{subtitle}</p>}

      {/* Ícone Bootstrap */}
      <i className={`bi ${icon} absolute right-5 top-1/2 -translate-y-1/2 text-4xl opacity-20`} />
    </div>
  );
}
