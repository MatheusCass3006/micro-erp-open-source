// ============================================================
// SERVIÇO: Autenticação — MicroERP
//
// Responsabilidades:
//   login()    → obtém accessToken + seta cookie de refresh (backend)
//   refresh()  → troca cookie de refresh por novo accessToken + dados do usuário
//   logout()   → invalida refresh token no banco + limpa cookie
//   me()       → lê dados do usuário com o accessToken atual
// ============================================================

import {
  LoginResponse, RegistrarResponse,
  MeResponse, Usuario, Role,
} from "@/types/auth";

const BASE_URL   = process.env.NEXT_PUBLIC_API_URL ?? "";
const USE_MOCK   = process.env.NEXT_PUBLIC_USE_MOCK === "true";

// ── Mock para desenvolvimento sem backend ─────────────────────
const MOCK_USUARIO: Usuario = {
  id:      1,
  nome:    "Matheus Dev",
  email:   "dev@microerp.com",
  role:    "admin",
  empresa: { id: 1, nome: "MicroERP Demo", slug: "microerp-demo" },
};

// ── Extrator de erro do body da resposta ──────────────────────
async function extractError(res: Response): Promise<string> {
  try {
    const body = await res.json() as { message?: string; detail?: string };
    return body.message || body.detail || `Erro ${res.status}`;
  } catch {
    return `Erro ${res.status}`;
  }
}

export const authService = {
  // ── Login ───────────────────────────────────────────────────
  async login(email: string, senha: string): Promise<LoginResponse> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 600));
      return {
        accessToken: "mock-access-token",
        usuario:     { id: 1, nome: "Matheus Dev", email },
        empresa:     { id: 1, nome: "MicroERP Demo", slug: "microerp-demo" },
        role:        "admin",
      };
    }

    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method:      "POST",
      credentials: "include",   // recebe o cookie sf_rt
      headers:     { "Content-Type": "application/json" },
      body:        JSON.stringify({ email, senha }),
    });

    if (!res.ok) throw new Error(await extractError(res));

    const body = await res.json() as { data: LoginResponse };
    const data = body.data;

    // Salva credenciais para auto-login
    localStorage.setItem('desktop_creds', JSON.stringify({
      email,
      password: senha,
      accessToken: data.accessToken,
    }));

    return data;
  },

  // ── Cadastro ────────────────────────────────────────────────
  async registrar(dados: {
    nome_usuario:    string;
    nome_empresa:    string;
    email:           string;
    senha:           string;
    confirmar_senha: string;
  }): Promise<RegistrarResponse> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 800));
      return {
        accessToken: "mock-access-token",
        usuario:     { id: 1, nome: dados.nome_usuario, email: dados.email },
        empresa:     { id: 1, nome: dados.nome_empresa, slug: "empresa-demo" },
        mensagem:    "Conta criada com sucesso!",
      };
    }

    const res = await fetch(`${BASE_URL}/api/auth/registrar`, {
      method:      "POST",
      credentials: "include",
      headers:     { "Content-Type": "application/json" },
      body:        JSON.stringify(dados),
    });

    if (!res.ok) throw new Error(await extractError(res));

    const body = await res.json() as { data: RegistrarResponse; message: string };
    return { ...body.data, mensagem: body.message || "Conta criada com sucesso!" };
  },

  // ── Refresh — restaura sessão usando o cookie HttpOnly ───────
  /**
   * Chama POST /api/auth/refresh.
   * O cookie sf_rt é enviado automaticamente pelo browser.
   * Retorna o novo accessToken + dados do usuário (via /me em seguida).
   *
   * Lança erro se não houver sessão válida.
   */
  async refresh(): Promise<{ accessToken: string; usuario: Usuario }> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 200));
      return { accessToken: "mock-access-token", usuario: MOCK_USUARIO };
    }

    // 1. Troca o cookie por novo accessToken
    const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method:      "POST",
      credentials: "include",  // envia cookie sf_rt
    });

    if (!res.ok) throw new Error("Sem sessão ativa");

    const body = await res.json() as { data: { accessToken: string } };
    const accessToken = body.data.accessToken;

    // 2. Busca dados do usuário com o novo token (rápido — JWT, sem DB)
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      credentials: "include",
      headers:     { Authorization: `Bearer ${accessToken}` },
      cache:       "no-store",
    });

    if (!meRes.ok) throw new Error("Erro ao carregar usuário");

    const meBody = await meRes.json() as { data: MeResponse };
    const me     = meBody.data;

    const usuario: Usuario = {
      id:      me.id,
      nome:    me.nome,
      email:   me.email,
      role:    me.role as Role,
      empresa: me.empresa,
    };

    return { accessToken, usuario };
  },

  // ── Logout ───────────────────────────────────────────────────
  async logout(): Promise<void> {
    if (USE_MOCK) return;

    await fetch(`${BASE_URL}/api/auth/logout`, {
      method:      "POST",
      credentials: "include",   // envia cookie para o backend invalidar
    }).catch(() => {});           // nunca falhar no logout
  },

  // ── Me: dados do usuário atual ────────────────────────────────
  // Usado diretamente pelo authService.refresh() — não precisa de uso externo.
  async me(accessToken: string): Promise<MeResponse | null> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 100));
      return {
        id:      MOCK_USUARIO.id,
        nome:    MOCK_USUARIO.nome,
        email:   MOCK_USUARIO.email,
        role:    MOCK_USUARIO.role,
        empresa: MOCK_USUARIO.empresa,
      };
    }

    const res = await fetch(`${BASE_URL}/api/auth/me`, {
      credentials: "include",
      headers:     { Authorization: `Bearer ${accessToken}` },
      cache:       "no-store",
    });

    if (!res.ok) return null;

    const body = await res.json() as { data: MeResponse };
    return body.data ?? null;
  },

  // ── Esqueci a senha ──────────────────────────────────────────
  async esqueciSenha(email: string): Promise<void> {
    if (USE_MOCK) { await new Promise((r) => setTimeout(r, 500)); return; }

    await fetch(`${BASE_URL}/api/auth/esqueci-senha`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email }),
    }).catch(() => {});
  },
};
