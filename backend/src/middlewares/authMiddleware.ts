// ============================================================
// MIDDLEWARE: Autenticação e Autorização — MicroERP
//
// requireAuth()  → valida JWT por assinatura (sem DB lookup)
// requireAdmin() → verifica role "admin" no payload do JWT
//
// Separação de responsabilidades:
//   • requireAuth: QUEM você é (autenticação)
//   • requireAdmin: O QUE você pode fazer (autorização)
// ============================================================

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWTPayload } from "../modules/auth/services/AuthService";

// ── Extensão do tipo Request do Express ──────────────────────
export interface UsuarioContexto {
  usuario_id:   number;
  usuario_email: string;
  usuario_nome: string;
  empresa_id:   number;
  empresa_slug: string;
  empresa_nome: string;
  role:         string;
}

declare global {
  namespace Express {
    interface Request {
      usuario?: UsuarioContexto;
    }
  }
}

// ── requireAuth ───────────────────────────────────────────────
/**
 * Valida o JWT de acesso enviado no header `Authorization: Bearer <token>`.
 * NÃO consulta o banco — apenas verifica a assinatura e a expiração.
 *
 * Em caso de token expirado, retorna 401 com message "Token expirado"
 * para que o frontend saiba que deve chamar /api/auth/refresh.
 */
export function requireAuth() {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Não autenticado",
          code:    "MISSING_TOKEN",
        });
      }

      const secret = process.env.JWT_SECRET;
      if (!secret) {
        console.error("[Auth] JWT_SECRET não configurado");
        return res.status(500).json({
          success: false,
          message: "Erro de configuração do servidor",
        });
      }

      // jwt.verify lança JsonWebTokenError ou TokenExpiredError se inválido
      const payload = jwt.verify(token, secret) as JWTPayload;

      // Popula req.usuario com dados do payload — zero DB lookup
      req.usuario = {
        usuario_id:    payload.usuarioId,
        usuario_email: payload.email,
        usuario_nome:  payload.nome,
        empresa_id:    payload.empresaId,
        empresa_slug:  payload.empresaSlug,
        empresa_nome:  payload.empresaNome,
        role:          payload.role,
      };

      next();
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        return res.status(401).json({
          success: false,
          message: "Token expirado",
          code:    "TOKEN_EXPIRED",  // frontend usa esse código para disparar refresh
        });
      }

      return res.status(401).json({
        success: false,
        message: "Token inválido",
        code:    "INVALID_TOKEN",
      });
    }
  };
}

// ── requireAdmin ──────────────────────────────────────────────
/**
 * Verifica que o usuário autenticado tem role "admin".
 * DEVE ser usado APÓS requireAuth() — depende de req.usuario.
 *
 * Uso: router.get("/rota", requireAuth(), requireAdmin(), handler)
 */
export function requireAdmin() {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.usuario) {
      // Proteção defensiva: requireAdmin sem requireAuth antes
      return res.status(401).json({
        success: false,
        message: "Não autenticado",
      });
    }

    if (req.usuario.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Acesso restrito a administradores",
        code:    "FORBIDDEN",
      });
    }

    next();
  };
}

// ── requireRole ───────────────────────────────────────────────
/**
 * Versão genérica — aceita lista de roles permitidas.
 * Uso: requireRole(["admin", "gerente"])
 */
export function requireRole(rolesPermitidas: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.usuario || !rolesPermitidas.includes(req.usuario.role)) {
      return res.status(403).json({
        success: false,
        message: `Acesso restrito às roles: ${rolesPermitidas.join(", ")}`,
        code:    "FORBIDDEN",
      });
    }
    next();
  };
}
