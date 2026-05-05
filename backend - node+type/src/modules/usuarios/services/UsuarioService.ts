import { AppDataSource } from "../../../database";
import { Usuario } from "../../../database/entities/Usuario";
import { UsuarioEmpresa } from "../../../database/entities/UsuarioEmpresa";
import { AppError, NotFoundError } from "../../../shared/errors/AppError";
import bcrypt from "bcryptjs";

export class UsuarioService {
  private usuarioRepo = AppDataSource.getRepository(Usuario);
  private usuarioEmpresaRepo = AppDataSource.getRepository(UsuarioEmpresa);

  async listar(empresaId: number) {
    const vinculos = await this.usuarioEmpresaRepo.find({
      where: { empresaId },
    });

    const resultado = [];
    for (const v of vinculos) {
      const usuario = await this.usuarioRepo.findOne({
        where: { id: v.usuarioId },
      });
      if (usuario) {
        resultado.push({
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          ativo: usuario.ativo && v.ativa,
          role: v.role,
          voce: false,
        });
      }
    }

    return resultado.sort((a, b) => a.nome.localeCompare(b.nome));
  }

  async criar(
    nome: string,
    email: string,
    senha: string,
    role: string,
    empresaId: number
  ) {
    const emailLower = email.toLowerCase().trim();

    const existente = await this.usuarioRepo.findOne({
      where: { email: emailLower },
    });

    if (existente) {
      throw new AppError("Email já cadastrado no sistema", 400);
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const usuario = this.usuarioRepo.create({
      nome: nome.trim(),
      email: emailLower,
      senhaHash,
      ativo: true,
    });
    await this.usuarioRepo.save(usuario);

    const vinculo = this.usuarioEmpresaRepo.create({
      usuarioId: usuario.id,
      empresaId,
      role,
      ativa: true,
    });
    await this.usuarioEmpresaRepo.save(vinculo);

    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      role,
    };
  }

  async desativar(usuarioId: number, empresaId: number, solicitanteId: number) {
    if (usuarioId === solicitanteId) {
      throw new AppError("Não pode desativar seu próprio usuário", 400);
    }

    const vinculo = await this.usuarioEmpresaRepo.findOne({
      where: { usuarioId, empresaId },
    });

    if (!vinculo) {
      throw new NotFoundError("Usuário");
    }

    vinculo.ativa = false;
    await this.usuarioEmpresaRepo.save(vinculo);

    return { ok: true };
  }

  async buscarPorId(usuarioId: number, empresaId: number) {
    const vinculo = await this.usuarioEmpresaRepo.findOne({
      where: { usuarioId, empresaId },
    });

    if (!vinculo) {
      throw new NotFoundError("Usuário");
    }

    const usuario = await this.usuarioRepo.findOne({
      where: { id: usuarioId },
    });

    if (!usuario) {
      throw new NotFoundError("Usuário");
    }

    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      role: vinculo.role,
      ativo: vinculo.ativa,
    };
  }
}