// ============================================================
// SERVICE: Autenticação — MicroERP
//
// Padrão: Access Token (JWT, 15min) + Refresh Token (UUID, 30d)
//
//  • Access Token  → payload completo, validado por assinatura (sem DB)
//  • Refresh Token → opaco (UUID), persistido em `sessoes`, rotacionado
//                    a cada uso (reuse detection automático)
// ============================================================

import { AppDataSource } from "../../../database";
import { Empresa }        from "../../../database/entities/Empresa";
import { Usuario }        from "../../../database/entities/Usuario";
import { UsuarioEmpresa } from "../../../database/entities/UsuarioEmpresa";
import { Sessao }         from "../../../database/entities/Sessao";
import { AppError }       from "../../../shared/errors/AppError";
import bcrypt             from "bcryptjs";
import jwt                from "jsonwebtoken";
import { v4 as uuidv4 }   from "uuid";

// ── Payload do JWT ────────────────────────────────────────────
export interface JWTPayload {
  usuarioId:   number;
  empresaId:   number;
  empresaNome: string;
  empresaSlug: string;
  role:        string;
  nome:        string;
  email:       string;
  iat?:        number;
  exp?:        number;
}

// ── Durações ──────────────────────────────────────────────────
const ACCESS_TOKEN_TTL  = "15m";          // access token: 15 minutos
const REFRESH_TOKEN_DAYS = 30;            // refresh token: 30 dias

export class AuthService {
  private usuarioRepo        = AppDataSource.getRepository(Usuario);
  private empresaRepo        = AppDataSource.getRepository(Empresa);
  private usuarioEmpresaRepo = AppDataSource.getRepository(UsuarioEmpresa);
  private sessaoRepo         = AppDataSource.getRepository(Sessao);

  // ── Helpers privados ─────────────────────────────────────────

  /** Obtém o JWT_SECRET — lança erro se não configurado (nunca usa fallback) */
  private getJWTSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET não configurado no ambiente");
    return secret;
  }

  /** Gera um JWT de acesso (curta duração, 15min) */
  gerarAccessToken(
    usuarioId:   number,
    empresaId:   number,
    empresaNome: string,
    empresaSlug: string,
    role:        string,
    nome:        string,
    email:       string,
  ): string {
    return jwt.sign(
      { usuarioId, empresaId, empresaNome, empresaSlug, role, nome, email },
      this.getJWTSecret(),
      { expiresIn: ACCESS_TOKEN_TTL },
    );
  }

  /** Cria e persiste um refresh token (UUID opaco) no banco */
  private async criarRefreshToken(usuarioId: number, empresaId: number): Promise<string> {
    const token    = uuidv4();
    const expiresEm = new Date();
    expiresEm.setDate(expiresEm.getDate() + REFRESH_TOKEN_DAYS);

    await this.sessaoRepo.save(
      this.sessaoRepo.create({ token, usuarioId, empresaId, expiresEm }),
    );

    return token;
  }

  /**
   * Valida um JWT de acesso por assinatura.
   * NÃO faz consulta ao banco — rápido e stateless.
   * Retorna o payload ou null se inválido/expirado.
   */
  validarAccessToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, this.getJWTSecret()) as JWTPayload;
    } catch {
      return null;
    }
  }

  // ── Operações principais ──────────────────────────────────────

  async registrar(
    nome_usuario: string,
    nome_empresa: string,
    email:        string,
    senha:        string,
  ) {
    const emailLower = email.toLowerCase().trim();

    const existente = await this.usuarioRepo.findOne({ where: { email: emailLower } });
    if (existente) throw new AppError("Este e-mail já está cadastrado", 400);

    // Slug da empresa: apenas letras, números e hífens
    const slug = nome_empresa
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "empresa";

    const empresa = await this.empresaRepo.save(
      this.empresaRepo.create({ nome: nome_empresa, slug, ativa: true }),
    );

    const senhaHash = await bcrypt.hash(senha, 12);  // cost 12 em produção

    const usuario = await this.usuarioRepo.save(
      this.usuarioRepo.create({
        nome:             nome_usuario.trim(),
        email:            emailLower,
        senhaHash,
        emailVerificado:  true,
        ativo:            true,
      }),
    );

    await this.usuarioEmpresaRepo.save(
      this.usuarioEmpresaRepo.create({
        usuarioId: usuario.id,
        empresaId: empresa.id,
        role:      "admin",
        ativa:     true,
      }),
    );

    const refreshToken = await this.criarRefreshToken(usuario.id, empresa.id);
    const accessToken  = this.gerarAccessToken(
      usuario.id, empresa.id, empresa.nome, empresa.slug, "admin",
      usuario.nome, usuario.email,
    );

    return {
      accessToken,
      refreshToken,
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
      empresa: { id: empresa.id, nome: empresa.nome, slug: empresa.slug },
    };
  }

  async login(email: string, senha: string) {
    const emailLower = email.toLowerCase().trim();

    const usuario = await this.usuarioRepo.findOne({
      where: { email: emailLower, ativo: true },
    });

    // Mesmo erro para email e senha — evita user enumeration
    if (!usuario?.senhaHash) throw new AppError("E-mail ou senha incorretos", 401);

    const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);
    if (!senhaValida)   throw new AppError("E-mail ou senha incorretos", 401);

    if (!usuario.emailVerificado) {
      throw new AppError("Confirme seu e-mail antes de entrar", 403);
    }

    const vinculo = await this.usuarioEmpresaRepo.findOne({
      where: { usuarioId: usuario.id, ativa: true },
    });
    if (!vinculo) throw new AppError("Usuário sem empresa vinculada", 400);

    const empresa = await this.empresaRepo.findOne({ where: { id: vinculo.empresaId } });
    if (!empresa?.ativa) throw new AppError("Empresa inativa ou não encontrada", 403);

    const refreshToken = await this.criarRefreshToken(usuario.id, empresa.id);
    const accessToken  = this.gerarAccessToken(
      usuario.id, empresa.id, empresa.nome, empresa.slug, vinculo.role,
      usuario.nome, usuario.email,
    );

    return {
      accessToken,
      refreshToken,
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
      empresa: { id: empresa.id, nome: empresa.nome, slug: empresa.slug },
      role:    vinculo.role,
    };
  }

  /**
   * Troca um refresh token por um novo par de tokens (rotação).
   *
   * Reuse Detection: se o refresh token já foi usado/deletado, qualquer
   * tentativa de reutilizá-lo resulta em 401. Isso detecta tokens roubados
   * — o atacante usa o token, o legítimo tenta e recebe 401.
   */
  async refreshAccessToken(refreshToken: string): Promise<{
    accessToken:      string;
    newRefreshToken:  string;
  }> {
    const sessao = await this.sessaoRepo.findOne({ where: { token: refreshToken } });

    if (!sessao) {
      throw new AppError("Sessão inválida ou expirada. Faça login novamente.", 401);
    }

    // Token expirado: limpa e rejeita
    if (new Date() > sessao.expiresEm) {
      await this.sessaoRepo.delete({ id: sessao.id });
      throw new AppError("Sessão expirada. Faça login novamente.", 401);
    }

    // Carrega usuário, empresa e vínculo em paralelo
    const [usuario, empresa, vinculo] = await Promise.all([
      this.usuarioRepo.findOne({ where: { id: sessao.usuarioId, ativo: true } }),
      this.empresaRepo.findOne({ where: { id: sessao.empresaId! } }),
      this.usuarioEmpresaRepo.findOne({
        where: { usuarioId: sessao.usuarioId, empresaId: sessao.empresaId!, ativa: true },
      }),
    ]);

    if (!usuario || !empresa || !vinculo) {
      await this.sessaoRepo.delete({ id: sessao.id });
      throw new AppError("Usuário ou empresa inválidos.", 401);
    }

    // Rotaciona: apaga o token antigo e cria um novo
    await this.sessaoRepo.delete({ id: sessao.id });
    const newRefreshToken = await this.criarRefreshToken(usuario.id, empresa.id);

    const accessToken = this.gerarAccessToken(
      usuario.id, empresa.id, empresa.nome, empresa.slug, vinculo.role,
      usuario.nome, usuario.email,
    );

    return { accessToken, newRefreshToken };
  }

  /** Invalida um refresh token (logout) */
  async logout(refreshToken: string): Promise<void> {
    await this.sessaoRepo.delete({ token: refreshToken });
  }

  /** Remove todas as sessões de um usuário (logout de todos os dispositivos) */
  async logoutTodos(usuarioId: number): Promise<void> {
    await this.sessaoRepo.delete({ usuarioId });
  }

}
