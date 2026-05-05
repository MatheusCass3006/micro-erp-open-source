import { Request, Response } from "express";
import { UsuarioService } from "../services/UsuarioService";
import { criarUsuarioSchema } from "../dto/UsuarioDTO";
import { ValidationError, ForbiddenError } from "../../../shared/errors/AppError";

export class UsuarioController {
  private usuarioService = new UsuarioService();

  async listar(req: Request, res: Response) {
    if (!req.usuario) {
      return res.status(401).json({ success: false, message: "Não autenticado" });
    }

    if (req.usuario.role !== "admin") {
      throw new ForbiddenError("Acesso restrito a administradores");
    }

    const usuarios = await this.usuarioService.listar(req.usuario.empresa_id);

    return res.status(200).json({
      success: true,
      data: usuarios,
    });
  }

  async criar(req: Request, res: Response) {
    if (!req.usuario) {
      return res.status(401).json({ success: false, message: "Não autenticado" });
    }

    if (req.usuario.role !== "admin") {
      throw new ForbiddenError("Acesso restrito a administradores");
    }

    const validacao = criarUsuarioSchema.safeParse(req.body);

    if (!validacao.success) {
      const erros = validacao.error.issues.map((i) => i.message).join(", ");
      throw new ValidationError(erros);
    }

    const { nome, email, senha, role } = validacao.data;

    const usuario = await this.usuarioService.criar(
      nome,
      email,
      senha,
      role,
      req.usuario.empresa_id
    );

    return res.status(201).json({
      success: true,
      data: usuario,
    });
  }

  async desativar(req: Request, res: Response) {
    if (!req.usuario) {
      return res.status(401).json({ success: false, message: "Não autenticado" });
    }

    if (req.usuario.role !== "admin") {
      throw new ForbiddenError("Acesso restrito a administradores");
    }

    const usuarioId = parseInt(req.params.id as string);

    await this.usuarioService.desativar(
      usuarioId,
      req.usuario.empresa_id,
      req.usuario.usuario_id
    );

    return res.status(200).json({
      success: true,
      message: "Usuário desativado com sucesso",
    });
  }
}