// ============================================================
// CONTEXT: Autenticação — MicroERP
// ============================================================

"use client";

import {
  createContext, useContext, useEffect,
  useState, useCallback, ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { Usuario } from "@/types/auth";
import { configureApi } from "@/services/api";

// ── Contrato do contexto ──────────────────────────────────────
interface AuthContextValue {
  usuario: Usuario | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  accessToken: string | null;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  setAccessToken: (token: string | null) => void;
  loginWithToken: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Começa true para o check inicial
  const [accessToken, setAccessTokenState] = useState<string | null>(null);

  // Expõe o setter do token para a camada de API e outros componentes
  const setAccessToken = useCallback((token: string | null) => {
    setAccessTokenState(token);
  }, []);

  // ── Sincronização inicial (Refresh) ──────────────────────────
  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      const { accessToken: newToken, usuario: user } = await authService.refresh();
      setAccessToken(newToken);
      setUsuario(user);
    } catch {
      setAccessToken(null);
      setUsuario(null);
    } finally {
      setIsLoading(false);
    }
  }, [setAccessToken]);

  // ── Login convencional ──────────────────────────────────────
  const login = useCallback(async (email: string, senha: string) => {
    setIsLoading(true);
    try {
      const data = await authService.login(email, senha);
      setAccessToken(data.accessToken);
      setUsuario({
        id: data.usuario.id,
        nome: data.usuario.nome,
        email: data.usuario.email,
        role: data.role,
        empresa: data.empresa
      });
      router.push("/dashboard");
    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [router, setAccessToken]);

  // ── Login com token externo (Google/Invite) ──────────────────
  const loginWithToken = useCallback(async (token: string) => {
    setIsLoading(true);
    try {
      setAccessToken(token);
      const user = await authService.me(token);
      if (!user) throw new Error('Não foi possível carregar os dados do usuário. Verifique a conexão com a API.');
      setUsuario({
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role,
        empresa: user.empresa
      });
    } catch (err) {
      setAccessToken(null);
      setUsuario(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [setAccessToken]);

  // ── Logout ───────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await authService.logout();
    setAccessToken(null);
    setUsuario(null);
    router.push("/login");
  }, [router, setAccessToken]);

  // ── Inicialização ────────────────────────────────────────────
  useEffect(() => {
    // Configura a camada de API para usar o estado deste contexto
    configureApi(
      () => accessToken,
      setAccessToken,
      () => { setUsuario(null); router.push("/login"); }
    );
  }, [accessToken, setAccessToken, router]);

  // Tenta restaurar sessão ao carregar a página
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <AuthContext.Provider
      value={{
        usuario,
        isLoading,
        isAuthenticated: !!usuario,
        accessToken,
        login,
        logout,
        checkAuth,
        setAccessToken,
        loginWithToken
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