// ============================================================
// CAMADA DE API — MicroERP
//
// Fluxo de autenticação:
//   1. Envia access token (JWT) no header Authorization: Bearer
//   2. Se receber 401 com code TOKEN_EXPIRED → chama /api/auth/refresh
//      (o cookie HttpOnly sf_rt é enviado automaticamente pelo browser)
//   3. Atualiza o access token em memória e retenta a request original
//   4. Se refresh falhar → limpa estado e redireciona para /login
//
// Anti-loop: _refreshPromise garante que múltiplos 401 simultâneos
// disparam apenas UM refresh — as outras requests aguardam o resultado.
// ============================================================

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

// ── Callbacks injetados pelo AuthContext ──────────────────────
// Desacoplam api.ts de AuthContext sem criar dependência circular.
let _getToken:   (() => string | null) | null = null;
let _setToken:   ((token: string | null) => void) | null = null;
let _onLogout:   (() => void) | null = null;

/**
 * Chamado pelo AuthContext ao montar a aplicação.
 * Wires os callbacks de acesso/atualização do access token.
 */
export function configureApi(
  getToken:  () => string | null,
  setToken:  (token: string | null) => void,
  onLogout:  () => void,
) {
  _getToken  = getToken;
  _setToken  = setToken;
  _onLogout  = onLogout;
}

// ── Deduplicação de refresh paralelo ─────────────────────────
// Garante que múltiplos 401 simultâneos disparam apenas 1 refresh.
let _refreshPromise: Promise<string | null> | null = null;

async function doRefresh(): Promise<string | null> {
  // Se já existe um refresh em andamento, aguarda o mesmo resultado
  if (_refreshPromise) return _refreshPromise;

  _refreshPromise = (async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
        method:      "POST",
        credentials: "include",   // envia o cookie sf_rt automaticamente
      });

      if (!res.ok) {
        // Refresh falhou — sessão encerrada
        _setToken?.(null);
        _onLogout?.();
        return null;
      }

      const body = await res.json() as { data?: { accessToken?: string } };
      const newToken = body.data?.accessToken ?? null;
      _setToken?.(newToken);
      return newToken;
    } catch {
      _setToken?.(null);
      _onLogout?.();
      return null;
    } finally {
      _refreshPromise = null;   // libera para o próximo ciclo
    }
  })();

  return _refreshPromise;
}

// ── Request principal ─────────────────────────────────────────
interface RequestOptions {
  method:   string;
  path:     string;
  body?:    unknown;
  isRetry?: boolean;   // true = segunda tentativa após refresh (sem novo refresh)
}

async function request<T>(opts: RequestOptions): Promise<T> {
  const { method, path, body, isRetry = false } = opts;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Injeta o access token se disponível
  const token = _getToken?.();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    credentials: "include",   // envia cookies (necessário para o refresh cookie)
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // ── 401: token expirado — tenta refresh (uma vez) ─────────────
  if (response.status === 401 && !isRetry) {
    const errBody = await response.json().catch(() => ({}) as Record<string, unknown>);
    const code = (errBody as { code?: string }).code;

    // Só faz refresh se o código indicar expiração (não auth inválida)
    if (code === "TOKEN_EXPIRED" || code === "MISSING_TOKEN") {
      const newToken = await doRefresh();

      if (newToken) {
        // Retenta a request original com o novo token
        return request<T>({ ...opts, isRetry: true });
      }
    }

    // Refresh falhou ou token inválido — redireciona para login
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Sessão expirada. Faça login novamente.");
  }

  // ── Outros erros HTTP ─────────────────────────────────────────
  if (!response.ok) {
    const error = await response.json().catch(() => ({}) as Record<string, unknown>);
    const msg = (error as { message?: string }).message
      || (error as { detail?: string }).detail
      || `Erro ${response.status}`;
    throw new Error(msg);
  }

  // ── Desembrulha envelope { success, data } do backend ─────────
  const responseBody = await response.json() as { data?: T } | T;

  if (
    responseBody &&
    typeof responseBody === "object" &&
    "data" in responseBody &&
    (responseBody as { data?: T }).data !== undefined
  ) {
    return (responseBody as { data: T }).data;
  }

  return responseBody as T;
}

// ── Helpers de verbos HTTP ────────────────────────────────────
export const api = {
  get:    <T>(path: string)                 => request<T>({ method: "GET",    path }),
  post:   <T>(path: string, body?: unknown) => request<T>({ method: "POST",   path, body }),
  put:    <T>(path: string, body?: unknown) => request<T>({ method: "PUT",    path, body }),
  patch:  <T>(path: string, body?: unknown) => request<T>({ method: "PATCH",  path, body }),
  delete: <T>(path: string)                 => request<T>({ method: "DELETE", path }),
};
