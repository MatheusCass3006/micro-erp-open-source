// ============================================================
// COMPONENTE: Sidebar
// Navegação lateral do sistema. Responsiva (mobile-first).
// Segue padrão visual do Linear/Notion
// ITEM 08: botão de Feedback no rodapé
// ============================================================

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { enviarFeedback, FeedbackPayload } from '@/services/feedback.service';
import { useToast } from '@/hooks/useToast';

interface NavItem {
  href:   string;
  icon:   string;
  label:  string;
  badge?: string;
}

interface NavGroup {
  titulo?: string;
  items:   NavItem[];
}

const navGroups: NavGroup[] = [
  {
    items: [
      { href: '/dashboard',    icon: 'bi-grid-1x2-fill',             label: 'Dashboard' },
      { href: '/boletos',      icon: 'bi-file-earmark-text-fill',     label: 'Boletos' },
      { href: '/entradas',     icon: 'bi-arrow-down-circle-fill',     label: 'Entradas' },
      { href: '/maquininhas',  icon: 'bi-credit-card-2-front-fill',   label: 'Maquininhas' },
      { href: '/saidas',       icon: 'bi-arrow-up-circle-fill',       label: 'Saídas / Despesas' },
      { href: '/relatorio',    icon: 'bi-bar-chart-fill',             label: 'Relatório' },
    ],
  },
  {
    titulo: 'Documentos',
    items: [
      { href: '/notas',        icon: 'bi-receipt',                    label: 'Notas Fiscais' },
      { href: '/estoque',      icon: 'bi-boxes',                      label: 'Estoque' },
      { href: '/sincronizar',  icon: 'bi-cloud-arrow-up-down-fill',   label: 'Sincronizar' },
    ],
  },
  {
    titulo: 'Sistema',
    items: [
      { href: '/configuracoes', icon: 'bi-gear-fill',                 label: 'Configurações' },
    ],
  },
];

interface SidebarProps {
  empresaNome?: string;
  usuarioNome?: string;
  onLogout?: () => void;
}

// ── Modal de Feedback (ITEM 08) ───────────────────────────────
function ModalFeedback({ onClose }: { onClose: () => void }) {
  const { success, error } = useToast();
  const [tipo,     setTipo]     = useState<FeedbackPayload['tipo']>('sugestao');
  const [mensagem, setMensagem] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function handleEnviar(e: React.FormEvent) {
    e.preventDefault();
    if (!mensagem.trim()) return;
    setEnviando(true);
    try {
      await enviarFeedback({ tipo, mensagem: mensagem.trim() });
      success('Feedback enviado! Obrigado 🙏');
      onClose();
    } catch {
      error('Erro ao enviar feedback. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  }

  const tipos: { val: FeedbackPayload['tipo']; label: string; icon: string }[] = [
    { val: 'sugestao', label: 'Sugestão',  icon: '💡' },
    { val: 'elogio',   label: 'Elogio',    icon: '⭐' },
    { val: 'problema', label: 'Problema',  icon: '🐛' },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-start p-4 sm:items-center sm:justify-start sm:pl-64">
      <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#1a1a1f] border border-gray-100 dark:border-[#2a2a32] p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900 dark:text-zinc-100">💬 Enviar Feedback</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300">
            <i className="bi bi-x-lg text-sm" />
          </button>
        </div>

        <form onSubmit={handleEnviar} className="space-y-3">
          {/* Tipo */}
          <div className="flex gap-2">
            {tipos.map(t => (
              <button
                key={t.val}
                type="button"
                onClick={() => setTipo(t.val)}
                className={`flex-1 rounded-xl border py-2 text-xs font-semibold transition-colors ${
                  tipo === t.val
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400'
                    : 'border-gray-200 dark:border-[#3a3a44] text-gray-500 dark:text-zinc-400 hover:border-gray-300'
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* Mensagem */}
          <textarea
            required
            rows={3}
            placeholder="Descreva sua sugestão, elogio ou problema..."
            value={mensagem}
            onChange={e => setMensagem(e.target.value)}
            className="w-full resize-none rounded-xl border border-gray-200 dark:border-[#3a3a44] bg-white dark:bg-[#111118] px-3 py-2 text-sm text-gray-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none"
          />

          <button
            type="submit"
            disabled={enviando || !mensagem.trim()}
            className="w-full rounded-xl bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors"
          >
            {enviando ? 'Enviando...' : 'Enviar Feedback'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Sidebar principal ─────────────────────────────────────────
export function Sidebar({ empresaNome = 'MicroERP', usuarioNome = 'Usuário', onLogout }: SidebarProps) {
  const pathname = usePathname();
  const [feedbackAberto, setFeedbackAberto] = useState(false);

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 flex w-60 flex-col bg-[#1a1a2e]">
        {/* Brand */}
        <div className="border-b border-white/10 px-5 py-6">
          <p className="text-[11px] font-semibold uppercase tracking-[2px] text-blue-300">💼 Empresa</p>
          <h1 className="mt-1 text-lg font-bold text-white">{empresaNome}</h1>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
          {navGroups.map((group, gi) => (
            <div key={gi}>
              {group.titulo && (
                <p className="mb-1 px-4 text-[10px] font-semibold uppercase tracking-[2px] text-white/30">
                  {group.titulo}
                </p>
              )}
              {group.items.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`mb-1 flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-white/15 text-white'
                        : 'text-white/60 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <i className={`bi ${item.icon} w-5 text-center text-lg`} />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] font-semibold text-white/40">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer com botão de Feedback (ITEM 08) */}
        <div className="border-t border-white/10 p-4 space-y-2">
          {/* Feedback */}
          <button
            onClick={() => setFeedbackAberto(true)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-white/50 hover:bg-white/10 hover:text-white/80 transition-colors"
          >
            <i className="bi bi-chat-dots" /> Enviar Feedback
          </button>

          <p className="text-xs text-white/50 px-1">👤 {usuarioNome}</p>
          <button
            onClick={onLogout}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/20 py-1.5 text-xs text-white/60 hover:border-white/40 hover:text-white transition-colors"
          >
            <i className="bi bi-box-arrow-right" /> Sair
          </button>
          <p className="text-center text-[10px] text-white/25">MicroERP v2.0</p>
        </div>
      </aside>

      {/* Modal de Feedback */}
      {feedbackAberto && <ModalFeedback onClose={() => setFeedbackAberto(false)} />}
    </>
  );
}
