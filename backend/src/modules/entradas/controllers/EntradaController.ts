import { Request, Response } from "express";
import { EntradaService } from "../services/EntradaService";
import { criarEntradaSchema, atualizarEntradaSchema } from "../dto/EntradaDTO";
import { ValidationError } from "../../../shared/errors/AppError";

function asString(val: unknown): string | undefined {
  if (Array.isArray(val)) val = val[0];
  return typeof val === "string" ? val : undefined;
}

function asNumber(val: unknown): number | undefined {
  if (Array.isArray(val)) val = val[0];
  return typeof val === "string" ? parseInt(val) : undefined;
}

export class EntradaController {
  private entradaService = new EntradaService();

  async listar(req: Request, res: Response) {
    const { mes, ano, maquihinha_id, skip = 0, limit = 500 } = req.query;

    const resultado = await this.entradaService.listar(
      req.usuario!.empresa_id,
      asNumber(mes),
      asNumber(ano),
      asNumber(maquihinha_id),
      asNumber(skip) || 0,
      asNumber(limit) || 500
    );

    return res.status(200).json({
      success: true,
      data: resultado,
    });
  }

  async criar(req: Request, res: Response) {
    const validacao = criarEntradaSchema.safeParse(req.body);

    if (!validacao.success) {
      const erros = validacao.error.issues.map((i) => i.message).join(", ");
      throw new ValidationError(erros);
    }

    const entrada = await this.entradaService.criar(
      req.usuario!.empresa_id,
      validacao.data
    );

    return res.status(201).json({
      success: true,
      data: entrada,
    });
  }

  async atualizar(req: Request, res: Response) {
    const entradaId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);

    const validacao = atualizarEntradaSchema.safeParse(req.body);

    if (!validacao.success) {
      const erros = validacao.error.issues.map((i) => i.message).join(", ");
      throw new ValidationError(erros);
    }

    const entrada = await this.entradaService.atualizar(
      entradaId,
      req.usuario!.empresa_id,
      validacao.data
    );

    return res.status(200).json({
      success: true,
      data: entrada,
    });
  }

  async deletar(req: Request, res: Response) {
    const entradaId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);

    await this.entradaService.deletar(
      entradaId,
      req.usuario!.empresa_id,
      req.usuario!.usuario_id
    );

    return res.status(200).json({
      success: true,
      message: "Entrada deletada com sucesso",
    });
  }

  async listarMaquininhas(req: Request, res: Response) {
    const maquininhas = await this.entradaService.listarMaquininhas(
      req.usuario!.empresa_id
    );

    return res.status(200).json({
      success: true,
      data: maquininhas,
    });
  }
}