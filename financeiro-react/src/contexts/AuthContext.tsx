// ============================================================
// CONTEXT: Autenticação — MicroERP (SEM LOGIN)
// ============================================================

"use client";

import {
  createContext, useContext, useEffect,
  useState, useCallback, ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { Usuario } from "@/types/auth";

// ── Usuário fixo (modo sem login) ───────────────────────────────
const USUARIO_FIXO: Usuario = {
  id: 1,
  nome: "Usuario Master",
  email: "master@microerp.com",
  role: "admin",
  empresa: { id: 1, nome: "Minha Empresa", slug: "minha-empresa" },
};

// ── Contrato do contexto ──────────────────────────────────────
interface AuthContextValue {
  usuario: Usuario;
  isLoading: boolean;
  isAuthenticated: boolean;
  accessToken: string;
  login: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [usuario, setUsuario] = useState<Usuario>(USUARIO_FIXO);
  const [isLoading, setIsLoading] = useState(false);
  const [accessToken] = useState("mock-token-sem-login");

  // ── Login automático (sem precisar digitar nada) ─────────────
  const login = useCallback(async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 500)); // Simula login
    setUsuario(USUARIO_FIXO);
    setIsLoading(false);
    router.push("/dashboard");
  }, [router]);

  // ── Logout apenas redireciona para home ───────────────
  const logout = useCallback(() => {
    router.push("/");
  }, [router]);

  // Login automático ao iniciar
  useEffect(() => {
    login();
  }, [login]);

  return (
    <AuthContext.Provider
      value={{
        usuario,
        isLoading,
        isAuthenticated: true,
        accessToken,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}