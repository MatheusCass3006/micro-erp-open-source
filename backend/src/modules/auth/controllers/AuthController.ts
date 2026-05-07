// ============================================================
// CONTROLLER: Autenticação — MicroERP
//
// Fluxo de tokens:
//   Login    → access token no body + refresh token em cookie HttpOnly
//   Refresh  → valida refresh cookie, rotaciona, emite novo access token
//   Logout   → invalida refresh token no banco + limpa cookie
//   Me       → lê do JWT (sem DB) — rápido e stateless
// ============================================================

import { Request, Response }   from "express";
import { AuthService }          from "../services/AuthService";
import { registrarSchema, loginSchema } from "../dto/AuthDTO";
import { ValidationError }      from "../../../shared/errors/AppError";

// Duração do cookie de refresh (30 dias em ms)
const REFRESH_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000;

// Nome do cookie de refresh token
const REFRESH_COOKIE_NAME = "sf_rt";

export class AuthController {
  private authService = new AuthService();

  // ── Helpers ────────────────────────────────────────────────

  /** Define o cookie HttpOnly do refresh token */
  private setRefreshCookie(res: Response, token: string) {
    res.cookie(REFRESH_COOKIE_NAME, token, {
      httpOnly: true,                                              // invisível para JS
      sameSite: "strict",                                          // CSRF protection
      secure:   process.env.NODE_ENV === "production",            // HTTPS apenas em prod
      maxAge:   REFRESH_COOKIE_MAX_AGE,
      path:     "/api/auth",                                      // escopo restrito
    });
  }

  /** Remove o cookie de refresh token */
  private clearRefreshCookie(res: Response) {
    res.clearCookie(REFRESH_COOKIE_NAME, { path: "/api/auth" });
  }

  // ── Endpoints ──────────────────────────────────────────────

  async registrar(req: Request, res: Response) {
    const validacao = registrarSchema.safeParse(req.body);

    if (!validacao.success) {
      const erros = validacao.error.issues.map((i) => i.message).join(", ");
      throw new ValidationError(erros);
    }

    const { nome_usuario, nome_empresa, email, senha } = validacao.data;

    const resultado = await this.authService.registrar(
      nome_usuario, nome_empresa, email, senha,
    );

    this.setRefreshCookie(res, resultado.refreshToken);

    return res.status(201).json({
      success: true,
      data: {
        accessToken: resultado.accessToken,  // armazenado em memória no frontend
        usuario:     resultado.usuario,
        empresa:     resultado.empresa,
        role:        "admin",
      },
      message: "Conta criada com sucesso!",
    });
  }

  async login(req: Request, res: Response) {
    const validacao = loginSchema.safeParse(req.body);

    if (!validacao.success) {
      const erros = validacao.error.issues.map((i) => i.message).join(", ");
      throw new ValidationError(erros);
    }

    const { email, senha } = validacao.data;

    const resultado = await this.authService.login(email, senha);

    this.setRefreshCookie(res, resultado.refreshToken);

    return res.status(200).json({
      success: true,
      data: {
        accessToken: resultado.accessToken,  // 15 min — armazenado em memória
        usuario:     resultado.usuario,
        empresa:     resultado.empresa,
        role:        resultado.role,
      },
    });
  }

  /**
   * Troca o refresh token por um novo par de tokens.
   *
   * O refresh token vem automaticamente no cookie HttpOnly (navegador o envia).
   * Retorna novo access token no body e rotaciona o cookie de refresh.
   */
  async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token ausente. Faça login novamente.",
        code:    "MISSING_REFRESH_TOKEN",
      });
    }

    const resultado = await this.authService.refreshAccessToken(refreshToken);

    // Rotaciona o cookie — cookie antigo substituído pelo novo
    this.setRefreshCookie(res, resultado.newRefreshToken);

    return res.status(200).json({
      success: true,
      data: { accessToken: resultado.accessToken },
    });
  }

  async logout(req: Request, res: Response) {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

    // Invalida o token no banco se existir
    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    this.clearRefreshCookie(res);

    return res.status(200).json({
      success: true,
      message: "Logout realizado com sucesso",
    });
  }

  /**
   * Retorna os dados do usuário logado.
   * Lê diretamente do payload JWT injetado por requireAuth() — zero DB.
   */
  async me(req: Request, res: Response) {
    if (!req.usuario) {
      return res.status(401).json({ success: false, message: "Não autenticado" });
    }

    return res.status(200).json({
      success: true,
      data: {
        id:      req.usuario.usuario_id,
        nome:    req.usuario.usuario_nome,
        email:   req.usuario.usuario_email,
        role:    req.usuario.role,
        empresa: {
          id:   req.usuario.empresa_id,
          nome: req.usuario.empresa_nome,
          slug: req.usuario.empresa_slug,
        },
      },
    });
  }
}
