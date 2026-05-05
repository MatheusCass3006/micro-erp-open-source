// ============================================================
// COMPONENTE: Topbar
// Barra superior com título, data e toggle de tema dark/light
// ============================================================

'use client';

import { useState, useEffect } from 'react';

interface TopbarProps {
  title: string;
  onMenuToggle?: () => void;
}

function aplicarTema(tema: 'light' | 'dark') {
  document.documentElement.setAttribute('data-theme', tema);
}

export function Topbar({ title, onMenuToggle }: TopbarProps) {
  const [dataHoje, setDataHoje] = useState('');
  const [tema, setTema] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const hoje = new Date();
    setDataHoje(hoje.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }));

    const temaSalvo = (localStorage.getItem('microerp_tema') as 'light' | 'dark') || 'light';
    setTema(temaSalvo);
    aplicarTema(temaSalvo);
  }, []);

  function alternarTema() {
    const novo: 'light' | 'dark' = tema === 'dark' ? 'light' : 'dark';
    setTema(novo);
    localStorage.setItem('microerp_tema', novo);
    aplicarTema(novo);
  }

  const isDark = tema === 'dark';

  return (
    <header
      className={`flex items-center justify-between px-6 py-4 border-b transition-colors duration-200
        ${isDark
          ? 'bg-[#111118] border-[#2a2a32] text-zinc-100'
          : 'bg-white border-gray-200 text-gray-900'
        }`}
    >
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <button
          onClick={onMenuToggle}
          className={`rounded-lg p-1.5 lg:hidden transition-colors
            ${isDark ? 'text-zinc-400 hover:bg-white/10' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          <i className="bi bi-list text-xl" />
        </button>
        <h2 className={`text-xl font-bold ${isDark ? 'text-zinc-100' : 'text-gray-900'}`}>
          {title}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        {/* Data */}
        {dataHoje && (
          <span className={`hidden rounded-full px-3 py-1 text-xs sm:block
            ${isDark ? 'bg-white/10 text-zinc-400' : 'bg-gray-100 text-gray-600'}`}
          >
            {dataHoje}
          </span>
        )}

        {/* Toggle tema */}
        <button
          onClick={alternarTema}
          title={isDark ? 'Modo escuro — clique para claro' : 'Modo claro — clique para escuro'}
          className={`rounded-lg p-2 text-lg transition-colors
            ${isDark ? 'hover:bg-white/10 text-amber-400' : 'hover:bg-gray-100 text-gray-600'}`}
        >
          {isDark ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  );
}
