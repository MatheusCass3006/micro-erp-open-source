// ============================================================
// LAYOUT: Dashboard (área autenticada)
// Proteção via useEffect + AuthContext (middleware.ts desativado —
// incompatível com Turbopack). Redireciona para /login se não autenticado.
// ============================================================

'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { useAuth } from '@/hooks/useAuth';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':     'Dashboard',
  '/boletos':       'Boletos',
  '/entradas':      'Entradas',
  '/maquininhas':   'Maquininhas',
  '/saidas':        'Saídas / Despesas',
  '/relatorio':     'Relatório',
  '/notas':         'Notas Fiscais',
  '/estoque':       'Estoque',
  '/sincronizar':   'Sincronizar',
  '/configuracoes': 'Configurações',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const { usuario, isLoading, isAuthenticated, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const title = PAGE_TITLES[pathname] || 'MicroERP';

  // Proteção de rota: redireciona para /login se não autenticado após load
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Skeleton mínimo enquanto carrega sessão
  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: 'var(--bg-base)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center animate-pulse">
            <i className="bi bi-graph-up-arrow text-white text-lg" />
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar com dados reais do usuário */}
      <div className={`fixed inset-y-0 left-0 z-30 transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar
          empresaNome={usuario?.empresa?.nome ?? 'MicroERP'}
          usuarioNome={usuario?.nome ?? '...'}
          onLogout={logout}
        />
      </div>

      {/* Conteúdo principal */}
      <div className="flex flex-1 flex-col lg:pl-60">
        <Topbar
          title={title}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
