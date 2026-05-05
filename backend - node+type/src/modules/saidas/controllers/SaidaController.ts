import { Request, Response } from "express";
import { SaidaService } from "../services/SaidaService";
import { criarSaidaSchema, atualizarSaidaSchema, criarCategoriaSchema, atualizarCategoriaSchema } from "../dto/SaidaDTO";
import { ValidationError } from "../../../shared/errors/AppError";

function asString(val: unknown): string | undefined {
  if (Array.isArray(val)) val = val[0];
  return typeof val === "string" ? val : undefined;
}

function asNumber(val: unknown): number | undefined {
  if (Array.isArray(val)) val = val[0];
  return typeof val === "string" ? parseInt(val) : undefined;
}

export class SaidaController {
  private saidaService = new SaidaService();

  async listar(req: Request, res: Response) {
    const { mes, ano, secao, categoria_id, skip = 0, limit = 500 } = req.query;

    const resultado = await this.saidaService.listar(
      req.usuario!.empresa_id,
      asNumber(mes),
      asNumber(ano),
      asString(secao),
      asNumber(categoria_id),
      asNumber(skip) || 0,
      asNumber(limit) || 500
    );

    return res.status(200).json({
      success: true,
      data: resultado,
    });
  }

  async criar(req: Request, res: Response) {
    const validacao = criarSaidaSchema.safeParse(req.body);

    if (!validacao.success) {
      const erros = validacao.error.issues.map((i) => i.message).join(", ");
      throw new ValidationError(erros);
    }

    const saida = await this.saidaService.criar(
      req.usuario!.empresa_id,
      validacao.data
    );

    return res.status(201).json({
      success: true,
      data: saida,
    });
  }

  async atualizar(req: Request, res: Response) {
    const saidaId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);

    const validacao = atualizarSaidaSchema.safeParse(req.body);

    if (!validacao.success) {
      const erros = validacao.error.issues.map((i) => i.message).join(", ");
      throw new ValidationError(erros);
    }

    const saida = await this.saidaService.atualizar(
      saidaId,
      req.usuario!.empresa_id,
      validacao.data
    );

    return res.status(200).json({
      success: true,
      data: saida,
    });
  }

  async deletar(req: Request, res: Response) {
    const saidaId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);

    await this.saidaService.deletar(
      saidaId,
      req.usuario!.empresa_id,
      req.usuario!.usuario_id
    );

    return res.status(200).json({
      success: true,
      message: "Saída deletada com sucesso",
    });
  }

  async listarCategorias(req: Request, res: Response) {
    const { secao } = req.query;

    const categorias = await this.saidaService.listarCategorias(
      req.usuario!.empresa_id,
      asString(secao)
    );

    return res.status(200).json({
      success: true,
      data: categorias,
    });
  }

  async criarCategoria(req: Request, res: Response) {
    const validacao = criarCategoriaSchema.safeParse(req.body);

    if (!validacao.success) {
      const erros = validacao.error.issues.map((i) => i.message).join(", ");
      throw new ValidationError(erros);
    }

    const categoria = await this.saidaService.criarCategoria(
      req.usuario!.empresa_id,
      validacao.data
    );

    return res.status(201).json({
      success: true,
      data: categoria,
    });
  }

  async atualizarCategoria(req: Request, res: Response) {
    const categoriaId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);

    const validacao = atualizarCategoriaSchema.safeParse(req.body);

    if (!validacao.success) {
      const erros = validacao.error.issues.map((i) => i.message).join(", ");
      throw new ValidationError(erros);
    }

    const categoria = await this.saidaService.atualizarCategoria(
      categoriaId,
      req.usuario!.empresa_id,
      validacao.data
    );

    return res.status(200).json({
      success: true,
      data: categoria,
    });
  }

  async deletarCategoria(req: Request, res: Response) {
    const categoriaId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);

    await this.saidaService.deletarCategoria(
      categoriaId,
      req.usuario!.empresa_id
    );

    return res.status(200).json({
      success: true,
      message: "Categoria deletada com sucesso",
    });
  }

  async resumoMensal(req: Request, res: Response) {
    const { mes, ano } = req.query;

    const resumo = await this.saidaService.resumoMensal(
      req.usuario!.empresa_id,
      asNumber(mes),
      asNumber(ano)
    );

    return res.status(200).json({
      success: true,
      data: resumo,
    });
  }
}