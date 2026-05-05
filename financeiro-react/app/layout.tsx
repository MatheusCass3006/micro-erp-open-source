// ============================================================
// LAYOUT: Root — fonte, Bootstrap Icons, metadata e anti-flash de tema
// ============================================================

import type { Metadata } from 'next';

import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { ToastContainer } from '@/components/ui/Toast';
import './globals.css';

const inter = { variable: '--font-inter', className: 'font-sans' };

export const metadata: Metadata = {
  title: 'MicroERP — Gestão Financeira',
  description: 'Sistema ERP financeiro profissional',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MicroERP',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full antialiased`}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
        />
        {/* PWA: manifest e ícone Apple */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#6366f1" />

        {/* Script inline: aplica tema ANTES do primeiro paint — evita flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('microerp_tema') || 'light';
                  document.documentElement.setAttribute('data-theme', t);
                } catch(e) {}
              })();
            `,
          }}
        />

        {/* PWA: registra Service Worker */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(reg) {
                      console.log('[SW] Registrado:', reg.scope);
                    })
                    .catch(function(err) {
                      console.warn('[SW] Falha ao registrar:', err);
                    });
                });
              }
            `,
          }}
        />
      </head>
      {/* AuthProvider envolve toda a app — disponibiliza useAuth em qualquer componente */}
      <body className="min-h-full font-sans">
        <ToastProvider>
          <AuthProvider>{children}</AuthProvider>
          <ToastContainer />
        </ToastProvider>
      </body>
    </html>
  );
}
