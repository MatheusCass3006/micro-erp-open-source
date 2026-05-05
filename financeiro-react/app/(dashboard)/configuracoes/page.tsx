'use client';

// ============================================================
// PÁGINA: Configurações — ITEM 06
// Três abas: Empresa (config chave/valor), SMTP, Usuários
// Totalmente conectado ao backend Node.js
// ============================================================

import { useEffect, useState, useCallback } from 'react';
import { getConfiguracoes, saveConfiguracoes, testarEmail, type ConfigMap } from '@/services/configuracoes.service';
import { getUsuarios, createUsuario, deleteUsuario, type Usuario } from '@/services/usuarios.service';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';

type Tab = 'empresa' | 'smtp' | 'usuarios';

const card  = 'rounded-2xl border border-gray-100 dark:border-[#2a2a32] bg-white dark:bg-[#1a1a1f] shadow-sm';
const label = 'mb-1 block text-xs font-semibold text-gray-600 dark:text-zinc-400';
const input = 'w-full rounded-xl border border-gray-200 dark:border-[#3a3a44] bg-white dark:bg-[#111118] px-3 py-2 text-sm text-gray-900 dark:text-zinc-100 focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none';
const btn   = 'rounded-xl bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors';

// ── Chaves de configuração da empresa ─────────────────────────
const CHAVES_EMPRESA = [
  { chave: 'nome_empresa',      label: 'Nome da Empresa',     placeholder: 'Minha Empresa Ltda', type: 'text' },
  { chave: 'alerta_vencimento_dias', label: 'Alertar boletos com (dias de antecedência)', placeholder: '3', type: 'number' },
];

const CHAVES_SMTP = [
  { chave: 'email_remetente',    label: 'E-mail Remetente',  placeholder: 'seuemail@gmail.com',  type: 'email' },
  { chave: 'email_senha',        label: 'Senha (App Password)', placeholder: 'xxxx xxxx xxxx xxxx', type: 'password' },
  { chave: 'email_destinatario', label: 'E-mail Destinatário (relatórios)',  placeholder: 'destino@empresa.com', type: 'email' },
  { chave: 'email_smtp_host',    label: 'Servidor SMTP',     placeholder: 'smtp.gmail.com',      type: 'text' },
  { chave: 'email_smtp_porta',   label: 'Porta SMTP',        placeholder: '587',                 type: 'number' },
];

// ── Formulário de novo usuário ─────────────────────────────────
const NOVO_USER_VAZIO = { nome: '', email: '', senha: '', role: 'operador' as 'admin' | 'operador' };

// ─────────────────────────────────────────────────────────────

export default function ConfiguracoesPage() {
  const { usuario } = useAuth();
  const toast = useToast();
  const isAdmin = usuario?.role === 'admin';

  const [tab, setTab] = useState<Tab>('empresa');

  // ── Estado de configs (chave → valor) ─────────────────────
  const [configs, setConfigs]     = useState<Record<string, string>>({});
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando]   = useState(false);

  // ── Estado SMTP ───────────────────────────────────────────
  const [testando, setTestando] = useState(false);

  // ── Estado usuários ───────────────────────────────────────
  const [usuarios, setUsuarios]         = useState<Usuario[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [modalUser, setModalUser]       = useState(false);
  const [novoUser, setNovoUser]         = useState(NOVO_USER_VAZIO);
  const [criandoUser, setCriandoUser]   = useState(false);

  // ── Carregar configs ──────────────────────────────────────
  const carregarConfigs = useCallback(async () => {
    setCarregando(true);
    try {
      const data: ConfigMap = await getConfiguracoes();
      // Normaliza: { chave: { valor, descricao } } → { chave: valor }
      const mapa: Record<string, string> = {};
      for (const [k, v] of Object.entries(data)) {
        mapa[k] = typeof v === 'object' && 'valor' in v ? (v as { valor: string }).valor : String(v);
      }
      setConfigs(mapa);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao carregar configurações');
    } finally {
      setCarregando(false);
    }
  }, [toast]);

  // ── Carregar usuários (admin only) ────────────────────────
  const carregarUsuarios = useCallback(async () => {
    if (!isAdmin) return;
    setLoadingUsers(true);
    try {
      const data = await getUsuarios();
      setUsuarios(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao carregar usuários');
    } finally {
      setLoadingUsers(false);
    }
  }, [isAdmin, toast]);

  useEffect(() => { carregarConfigs(); }, [carregarConfigs]);
  useEffect(() => { if (tab === 'usuarios') carregarUsuarios(); }, [tab, carregarUsuarios]);

  // ── Salvar configs ────────────────────────────────────────
  async function handleSalvarConfigs(chaves: string[]) {
    setSalvando(true);
    try {
      const subset: Record<string, string> = {};
      for (const k of chaves) subset[k] = configs[k] ?? '';
      await saveConfiguracoes(subset);
      toast.success('Configurações salvas com sucesso!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar configurações');
    } finally {
      setSalvando(false);
    }
  }

  // ── Testar e-mail ─────────────────────────────────────────
  async function handleTestarEmail() {
    setTestando(true);
    try {
      const res = await testarEmail();
      toast.success(res.mensagem || 'E-mail de teste enviado!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Falha ao enviar e-mail de teste');
    } finally {
      setTestando(false);
    }
  }

  // ── Criar usuário ─────────────────────────────────────────
  async function handleCriarUsuario(e: React.FormEvent) {
    e.preventDefault();
    setCriandoUser(true);
    try {
      const criado = await createUsuario(novoUser);
      setUsuarios(prev => [...prev, criado]);
      setModalUser(false);
      setNovoUser(NOVO_USER_VAZIO);
      toast.success(`Usuário ${criado.nome} criado com sucesso!`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao criar usuário');
    } finally {
      setCriandoUser(false);
    }
  }

  // ── Desativar usuário ─────────────────────────────────────
  async function handleDesativarUsuario(u: Usuario) {
    if (!confirm(`Desativar o usuário "${u.nome}"? Ele perderá acesso ao sistema.`)) return;
    try {
      await deleteUsuario(u.id);
      setUsuarios(prev => prev.map(x => x.id === u.id ? { ...x, ativo: false } : x));
      toast.success(`Usuário ${u.nome} desativado.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao desativar usuário');
    }
  }

  function setConfig(chave: string, valor: string) {
    setConfigs(prev => ({ ...prev, [chave]: valor }));
  }

  // ─────────────────────────────────────────────────────────
  return (
    <div className="space-y-4 max-w-3xl">

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-gray-100 dark:bg-[#27272d] p-1 w-fit">
        {([
          { id: 'empresa',  label: '🏢 Empresa' },
          { id: 'smtp',     label: '📧 E-mail SMTP' },
          { id: 'usuarios', label: '👥 Usuários' },
        ] as { id: Tab; label: string }[]).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              tab === t.id
                ? 'bg-white dark:bg-[#1a1a1f] shadow text-gray-900 dark:text-zinc-100'
                : 'text-gray-500 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {carregando && (
        <div className={`${card} flex items-center gap-3 p-6 text-sm text-gray-500 dark:text-zinc-400`}>
          <i className="bi bi-arrow-clockwise animate-spin" /> Carregando configurações...
        </div>
      )}

      {/* ── ABA: Empresa ──────────────────────────────────── */}
      {!carregando && tab === 'empresa' && (
        <div className={`${card} p-6`}>
          <h3 className="mb-1 text-base font-semibold text-gray-900 dark:text-zinc-100">Dados da Empresa</h3>
          <p className="mb-5 text-xs text-gray-500 dark:text-zinc-400">Informações gerais usadas nos relatórios e notificações.</p>

          <div className="space-y-4 max-w-lg">
            {CHAVES_EMPRESA.map(f => (
              <div key={f.chave}>
                <label className={label}>{f.label}</label>
                <input
                  type={f.type}
                  value={configs[f.chave] ?? ''}
                  onChange={e => setConfig(f.chave, e.target.value)}
                  className={input}
                  placeholder={f.placeholder}
                />
              </div>
            ))}

            <button onClick={() => handleSalvarConfigs(CHAVES_EMPRESA.map(f => f.chave))}
              disabled={salvando} className={btn}>
              {salvando ? <><i className="bi bi-arrow-clockwise animate-spin mr-1" />Salvando...</> : 'Salvar dados'}
            </button>
          </div>
        </div>
      )}

      {/* ── ABA: SMTP ─────────────────────────────────────── */}
      {!carregando && tab === 'smtp' && (
        <div className={`${card} p-6`}>
          <h3 className="mb-1 text-base font-semibold text-gray-900 dark:text-zinc-100">Configuração de E-mail SMTP</h3>
          <p className="mb-5 text-xs text-gray-500 dark:text-zinc-400">
            Usado para enviar relatórios e alertas de vencimento. Para Gmail, use uma{' '}
            <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer"
               className="text-indigo-600 dark:text-indigo-400 underline">
              senha de aplicativo
            </a>.
          </p>

          <div className="space-y-4 max-w-lg">
            {CHAVES_SMTP.map(f => (
              <div key={f.chave}>
                <label className={label}>{f.label}</label>
                <input
                  type={f.type}
                  value={configs[f.chave] ?? ''}
                  onChange={e => setConfig(f.chave, e.target.value)}
                  className={input}
                  placeholder={f.placeholder}
                  autoComplete={f.chave === 'email_senha' ? 'new-password' : undefined}
                />
              </div>
            ))}

            <div className="flex flex-wrap gap-3 pt-1">
              <button onClick={() => handleSalvarConfigs(CHAVES_SMTP.map(f => f.chave))}
                disabled={salvando} className={btn}>
                {salvando ? <><i className="bi bi-arrow-clockwise animate-spin mr-1" />Salvando...</> : 'Salvar SMTP'}
              </button>

              <button onClick={handleTestarEmail} disabled={testando}
                className="rounded-xl border border-green-300 dark:border-green-700 px-5 py-2 text-sm font-medium text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/40 disabled:opacity-60 transition-colors">
                {testando
                  ? <><i className="bi bi-arrow-clockwise animate-spin mr-1" />Enviando...</>
                  : <><i className="bi bi-envelope-check mr-1" />Testar e-mail</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ABA: Usuários ─────────────────────────────────── */}
      {tab === 'usuarios' && (
        <>
          {!isAdmin && (
            <div className={`${card} p-6 text-center`}>
              <i className="bi bi-shield-lock text-3xl text-gray-300 dark:text-zinc-600" />
              <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
                Apenas administradores podem gerenciar usuários.
              </p>
            </div>
          )}

          {isAdmin && (
            <div className={`overflow-hidden ${card}`}>
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#2a2a32] p-5">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-zinc-100">Usuários da Conta</h3>
                  <p className="text-xs text-gray-500 dark:text-zinc-400">{usuarios.length} usuário{usuarios.length !== 1 ? 's' : ''} cadastrado{usuarios.length !== 1 ? 's' : ''}</p>
                </div>
                <button onClick={() => setModalUser(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 transition-colors">
                  <i className="bi bi-person-plus" /> Novo usuário
                </button>
              </div>

              {loadingUsers ? (
                <div className="flex items-center gap-3 px-5 py-8 text-sm text-gray-400 dark:text-zinc-500">
                  <i className="bi bi-arrow-clockwise animate-spin" /> Carregando usuários...
                </div>
              ) : usuarios.length === 0 ? (
                <div className="py-10 text-center text-sm text-gray-400 dark:text-zinc-500">
                  Nenhum usuário encontrado.
                </div>
              ) : (
                <div className="divide-y divide-gray-50 dark:divide-[#2a2a32]">
                  {usuarios.map(u => (
                    <div key={u.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-[#27272d] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-sm font-semibold text-indigo-700 dark:text-indigo-400">
                          {u.nome.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-zinc-100">{u.nome}</p>
                          <p className="text-xs text-gray-500 dark:text-zinc-500">{u.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          u.role === 'admin'
                            ? 'bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400'
                            : 'bg-gray-100 dark:bg-[#27272d] text-gray-600 dark:text-zinc-400'
                        }`}>
                          {u.role}
                        </span>

                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
                          u.ativo
                            ? 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400'
                            : 'bg-gray-100 dark:bg-[#27272d] text-gray-500 dark:text-zinc-500'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${u.ativo ? 'bg-green-400' : 'bg-gray-400'}`} />
                          {u.ativo ? 'Ativo' : 'Inativo'}
                        </span>

                        {u.ativo && u.id !== usuario?.id && (
                          <button onClick={() => handleDesativarUsuario(u)}
                            className="rounded-lg bg-red-100 dark:bg-red-950/40 px-2 py-1 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
                            Desativar
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Modal: criar usuário */}
          {modalUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
              <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1a1a1f] border border-gray-100 dark:border-[#2a2a32] p-6 shadow-2xl">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">👤 Novo Usuário</h2>
                  <button onClick={() => { setModalUser(false); setNovoUser(NOVO_USER_VAZIO); }}
                    className="text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300">
                    <i className="bi bi-x-lg" />
                  </button>
                </div>

                <form onSubmit={handleCriarUsuario} className="space-y-4">
                  <div>
                    <label className={label}>Nome completo *</label>
                    <input required value={novoUser.nome}
                      onChange={e => setNovoUser(p => ({ ...p, nome: e.target.value }))}
                      className={input} placeholder="João Silva" />
                  </div>
                  <div>
                    <label className={label}>E-mail *</label>
                    <input required type="email" value={novoUser.email}
                      onChange={e => setNovoUser(p => ({ ...p, email: e.target.value }))}
                      className={input} placeholder="joao@empresa.com" />
                  </div>
                  <div>
                    <label className={label}>Senha inicial *</label>
                    <input required type="password" value={novoUser.senha} minLength={6}
                      onChange={e => setNovoUser(p => ({ ...p, senha: e.target.value }))}
                      className={input} placeholder="Mínimo 6 caracteres" autoComplete="new-password" />
                  </div>
                  <div>
                    <label className={label}>Perfil</label>
                    <select value={novoUser.role}
                      onChange={e => setNovoUser(p => ({ ...p, role: e.target.value as 'admin' | 'operador' }))}
                      className={input}>
                      <option value="operador">Operador</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button type="submit" disabled={criandoUser} className={`${btn} flex-1`}>
                      {criandoUser ? <><i className="bi bi-arrow-clockwise animate-spin mr-1" />Criando...</> : 'Criar usuário'}
                    </button>
                    <button type="button" onClick={() => { setModalUser(false); setNovoUser(NOVO_USER_VAZIO); }}
                      className="rounded-xl border border-gray-200 dark:border-[#3a3a44] px-4 py-2 text-sm font-medium text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-[#27272d] transition-colors">
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
