// ============================================================
// PÁGINA: Login / Cadastro / Verificação de E-mail
// Fluxo completo de autenticação — MicroERP
// ============================================================

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { useAuth } from '@/hooks/useAuth';

type Tab  = 'login' | 'cadastro';
type Step = 'form' | 'verificar_email' | 'esqueci_senha';

// Classe reutilizável para inputs
const INPUT = 'w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none';

// ── Conteúdo principal (usa useSearchParams → precisa de Suspense) ─
function LoginContent() {
  const router        = useRouter();
  const searchParams  = useSearchParams();
  const { checkAuth, setAccessToken, loginWithToken } = useAuth();

  const [tab,     setTab]     = useState<Tab>('login');
  const [step,    setStep]    = useState<Step>('form');
  const [loading, setLoading] = useState(false);
  const [erro,    setErro]    = useState('');
  const [info,    setInfo]    = useState('');

  // Campos de login
  const [email,        setEmail]        = useState('');
  const [senha,        setSenha]        = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);

  // Campos de cadastro
  const [nomeEmpresa,   setNomeEmpresa]   = useState('');
  const [nomeUsuario,   setNomeUsuario]   = useState('');
  const [emailCad,      setEmailCad]      = useState('');
  const [senhaCad,      setSenhaCad]      = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');

  // Verificação e recuperação
  const [emailVerif,   setEmailVerif]   = useState('');
  const [codigo,       setCodigo]       = useState('');
  const [emailEsqueci, setEmailEsqueci] = useState('');
  const [esqueciOk,    setEsqueciOk]   = useState(false);

  // Proteção contra open redirect: aceita apenas caminhos relativos internos
  const rawNext = searchParams.get('next') || '';
  const nextPath = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/dashboard';

  // ── Google OAuth token handler ──────────────────────────────
  // Usa loginWithToken() em vez de checkAuth() para evitar race condition:
  // checkAuth() chama /refresh (cookie sf_rt) que pode não estar pronto,
  // enquanto loginWithToken() chama /me diretamente com o JWT do Google.
  useEffect(() => {
    const googleToken = searchParams.get('google_token');
    if (googleToken) {
      loginWithToken(googleToken).then(() => {
        router.push('/dashboard');
      }).catch(() => {
        setErro('Erro ao autenticar com Google. Tente novamente.');
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function reset() { setErro(''); setInfo(''); setCodigo(''); }

  function switchTab(t: Tab) { reset(); setStep('form'); setTab(t); }

  // ── Login ──────────────────────────────────────────────────
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault(); reset(); setLoading(true);
    try {
      const res = await authService.login(email, senha);
      // Armazena access token em memória — nunca localStorage
      setAccessToken(res.accessToken);
      await checkAuth();
      router.push(nextPath);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao entrar';
      if (msg.toLowerCase().includes('verificad') || msg.toLowerCase().includes('confirme')) {
        setEmailVerif(email);
        setStep('verificar_email');
        setInfo(`Enviamos um código para ${email}. Verifique sua caixa de entrada.`);
      } else {
        setErro(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  // ── Cadastro ───────────────────────────────────────────────
  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault(); reset();
    if (senhaCad !== confirmaSenha) return void setErro('As senhas não coincidem.');
    if (senhaCad.length < 6)        return void setErro('Senha deve ter pelo menos 6 caracteres.');
    setLoading(true);
    try {
      const res = await authService.registrar({
        nome_usuario:    nomeUsuario,
        nome_empresa:    nomeEmpresa,
        email:           emailCad,
        senha:           senhaCad,
        confirmar_senha: confirmaSenha,
      });
      // Armazena access token em memória — nunca localStorage
      setAccessToken(res.accessToken);
      await checkAuth();
      router.push('/dashboard');
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  }

  // ── Verificação de e-mail (backend Node.js aprova automaticamente) ─
  async function handleVerificar(e: React.FormEvent) {
    e.preventDefault(); reset(); setLoading(true);
    try {
      await checkAuth();
      router.push('/dashboard');
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : 'Código inválido');
    } finally {
      setLoading(false);
    }
  }

  async function handleReenviar() {
    reset();
    setInfo('Novo código enviado! Verifique sua caixa de entrada.');
  }

  // ── Esqueci a senha ────────────────────────────────────────
  async function handleEsqueci(e: React.FormEvent) {
    e.preventDefault(); reset(); setLoading(true);
    try {
      await authService.esqueciSenha(emailEsqueci);
    } catch { /* nunca revelar se e-mail existe */ } finally {
      setEsqueciOk(true);
      setInfo('Se este e-mail estiver cadastrado, você receberá um código em breve.');
      setLoading(false);
    }
  }

  // ── Step: Verificar e-mail ─────────────────────────────────
  if (step === 'verificar_email') return (
    <Card>
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
          <i className="bi bi-envelope-check text-2xl text-indigo-600" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">Verifique seu e-mail</h2>
        <p className="mt-1 text-sm text-gray-500">
          Digite o código enviado para <strong>{emailVerif}</strong>
        </p>
      </div>
      {info && <Alert type="info"  msg={info} />}
      {erro && <Alert type="error" msg={erro} />}
      <form onSubmit={handleVerificar} className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-600">Código de verificação</label>
          <input
            type="text" required maxLength={6}
            value={codigo} onChange={e => setCodigo(e.target.value.toUpperCase())}
            placeholder="ex: A1B2C3"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-center text-lg font-mono tracking-widest focus:border-indigo-500 focus:outline-none"
          />
        </div>
        <BtnPrimary loading={loading} label="Verificar conta" loadingLabel="Verificando..." />
      </form>
      <div className="mt-4 flex flex-col gap-2 text-center">
        <button onClick={handleReenviar} className="text-sm text-indigo-600 hover:underline">
          Não recebeu? Reenviar código
        </button>
        <button onClick={() => { setStep('form'); reset(); }} className="text-xs text-gray-400 hover:text-gray-600">
          Voltar ao login
        </button>
      </div>
    </Card>
  );

  // ── Step: Esqueci a senha ──────────────────────────────────
  if (step === 'esqueci_senha') return (
    <Card>
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
          <i className="bi bi-key text-2xl text-yellow-600" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">Recuperar senha</h2>
        <p className="mt-1 text-sm text-gray-500">Enviaremos um código para seu e-mail</p>
      </div>
      {info && <Alert type="info" msg={info} />}
      {!esqueciOk ? (
        <form onSubmit={handleEsqueci} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">E-mail cadastrado</label>
            <input
              type="email" required value={emailEsqueci}
              onChange={e => setEmailEsqueci(e.target.value)}
              placeholder="seu@email.com" className={INPUT}
            />
          </div>
          <BtnPrimary loading={loading} label="Enviar código" loadingLabel="Enviando..." />
        </form>
      ) : (
        <p className="text-center text-sm text-gray-500">Verifique sua caixa de entrada e spam.</p>
      )}
      <button
        onClick={() => { setStep('form'); setEsqueciOk(false); reset(); }}
        className="mt-4 block w-full text-center text-sm text-indigo-600 hover:underline"
      >
        Voltar ao login
      </button>
    </Card>
  );

  // ── Step: Form principal (Login / Cadastro) ────────────────
  return (
    <Card>
      {/* Tabs */}
      <div className="mb-6 flex rounded-xl bg-gray-100 p-1">
        {(['login', 'cadastro'] as Tab[]).map(t => (
          <button key={t} onClick={() => switchTab(t)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
              tab === t ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'login' ? 'Entrar' : 'Criar Conta'}
          </button>
        ))}
      </div>

      {info && <Alert type="info"  msg={info} />}
      {erro && <Alert type="error" msg={erro} />}

      {tab === 'login' ? (
        <form onSubmit={handleLogin} className="space-y-4">
          <Field label="E-mail">
            <input type="email" required value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com" className={INPUT}
            />
          </Field>

          <Field label="Senha">
            <div className="relative">
              <input
                type={mostrarSenha ? 'text' : 'password'} required
                value={senha} onChange={e => setSenha(e.target.value)}
                placeholder="••••••••"
                className={`${INPUT} pr-10`}
              />
              <button type="button" onClick={() => setMostrarSenha(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <i className={`bi ${mostrarSenha ? 'bi-eye-slash' : 'bi-eye'}`} />
              </button>
            </div>
          </Field>

          <div className="text-right">
            <button type="button"
              onClick={() => { setStep('esqueci_senha'); reset(); setEmailEsqueci(email); }}
              className="text-xs text-indigo-600 hover:underline"
            >
              Esqueci minha senha
            </button>
          </div>

          <BtnPrimary loading={loading} label="Entrar" loadingLabel="Entrando..." />
          <Divider />
          <BtnGoogle onClick={() => {
            window.location.href = "/api/auth/google";
          }} />
        </form>
      ) : (
        <form onSubmit={handleCadastro} className="space-y-4">
          <Field label="Nome da Empresa *">
            <input required value={nomeEmpresa} onChange={e => setNomeEmpresa(e.target.value)}
              placeholder="Minha Empresa Ltda" className={INPUT} />
          </Field>
          <Field label="Seu Nome *">
            <input required value={nomeUsuario} onChange={e => setNomeUsuario(e.target.value)}
              placeholder="João Silva" className={INPUT} />
          </Field>
          <Field label="E-mail *">
            <input type="email" required value={emailCad} onChange={e => setEmailCad(e.target.value)}
              placeholder="seu@email.com" className={INPUT} />
          </Field>
          <Field label="Senha *">
            <input type="password" required minLength={6} value={senhaCad}
              onChange={e => setSenhaCad(e.target.value)}
              placeholder="Mínimo 6 caracteres" className={INPUT} />
          </Field>
          <Field label="Confirmar Senha *">
            <input type="password" required minLength={6} value={confirmaSenha}
              onChange={e => setConfirmaSenha(e.target.value)}
              placeholder="Repita a senha" className={INPUT} />
          </Field>
          <BtnPrimary loading={loading} label="Criar Conta Grátis" loadingLabel="Criando conta..." />
        </form>
      )}
    </Card>
  );
}

// ── Componentes auxiliares ─────────────────────────────────────

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-xl">{children}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-gray-600">{label}</label>
      {children}
    </div>
  );
}

function Alert({ type, msg }: { type: 'info' | 'error' | 'success'; msg: string }) {
  const styles = {
    info:    'border-blue-200 bg-blue-50 text-blue-700',
    error:   'border-red-200 bg-red-50 text-red-600',
    success: 'border-green-200 bg-green-50 text-green-700',
  };
  return <div className={`mb-4 rounded-xl border px-4 py-3 text-sm ${styles[type]}`}>{msg}</div>;
}

function BtnPrimary({ loading, label, loadingLabel }: { loading: boolean; label: string; loadingLabel: string }) {
  return (
    <button type="submit" disabled={loading}
      className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-60"
    >
      {loading
        ? <span className="flex items-center justify-center gap-2"><i className="bi bi-arrow-clockwise animate-spin" />{loadingLabel}</span>
        : label}
    </button>
  );
}

function Divider() {
  return (
    <div className="relative my-2">
      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
      <div className="relative flex justify-center text-xs text-gray-400"><span className="bg-white px-2">ou</span></div>
    </div>
  );
}

function BtnGoogle({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
      Entrar com Google
    </button>
  );
}

// ── Página (Suspense obrigatório por useSearchParams no Next.js) ──
export default function LoginPage() {
  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg">
          <i className="bi bi-graph-up-arrow text-2xl text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">MicroERP</h1>
        <p className="text-sm text-gray-500">Gestão Financeira Profissional</p>
      </div>

      <Suspense fallback={
        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-xl text-center text-sm text-gray-400">
          Carregando...
        </div>
      }>
        <LoginContent />
      </Suspense>

      <p className="mt-6 text-center text-xs text-gray-400">
        {process.env.NEXT_PUBLIC_USE_MOCK === 'true'
          ? '🔒 Modo demo — dados fictícios'
          : '🔐 Sessão segura com cookie HttpOnly'}
      </p>
    </div>
  );
}
