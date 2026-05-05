// ============================================================
// TIPOS: Autenticação — MicroERP
// Contratos TypeScript alinhados ao backend JWT + Refresh Token
// ============================================================

export type Role = "admin" | "operador";

export interface Empresa {
  id:   number;
  nome: string;
  slug: string;
}

export interface Usuario {
  id:      number;
  nome:    string;
  email:   string;
  role:    Role;
  empresa: Empresa;
}

// ── Respostas do backend ──────────────────────────────────────

/** POST /api/auth/login */
export interface LoginResponse {
  accessToken: string;   // JWT de 15min — armazenar em memória
  usuario:     { id: number; nome: string; email: string };
  empresa:     Empresa;
  role:        Role;
}

/** POST /api/auth/registrar */
export interface RegistrarResponse {
  accessToken: string;
  usuario:     { id: number; nome: string; email: string };
  empresa:     Empresa;
  mensagem:    string;
}

/** POST /api/auth/refresh */
export interface RefreshResponse {
  accessToken: string;   // novo JWT (refresh rotacionou o cookie)
  usuario:     Usuario;  // hydratado via /me logo após
}

/** GET /api/auth/me */
export interface MeResponse {
  id:      number;
  nome:    string;
  email:   string;
  role:    Role;
  empresa: Empresa;
}
