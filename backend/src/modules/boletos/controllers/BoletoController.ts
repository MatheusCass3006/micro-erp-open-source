import { Request, Response } from "express";
import { BoletoService } from "../services/BoletoService";
import { criarBoletoSchema, atualizarBoletoSchema } from "../dto/BoletoDTO";
import { ValidationError } from "../../../shared/errors/AppError";

function asString(val: unknown): string | undefined {
  if (Array.isArray(val)) val = val[0];
  return typeof val === "string" ? val : undefined;
}

function asNumber(val: unknown): number | undefined {
  if (Array.isArray(val)) val = val[0];
  return typeof val === "string" ? parseInt(val) : undefined;
}

export class BoletoController {
  private boletoService = new BoletoService();

  async listar(req: Request, res: Response) {
    await this.boletoService.atualizarStatusAutomatico(req.usuario!.empresa_id);

    const { status, mes, ano, skip = 0, limit = 200 } = req.query;

    const resultado = await this.boletoService.listar(
      req.usuario!.empresa_id,
      asString(status),
      asNumber(mes),
      asNumber(ano),
      asNumber(skip) || 0,
      asNumber(limit) || 200
    );

    return res.status(200).json({
      success: true,
      data: resultado,
    });
  }

  async criar(req: Request, res: Response) {
    const validacao = criarBoletoSchema.safeParse(req.body);

    if (!validacao.success) {
      const erros = validacao.error.issues.map((i) => i.message).join(", ");
      throw new ValidationError(erros);
    }

    const boleto = await this.boletoService.criar(
      req.usuario!.empresa_id,
      validacao.data
    );

    return res.status(201).json({
      success: true,
      data: boleto,
    });
  }

  async atualizar(req: Request, res: Response) {
    const boletoId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);

    const validacao = atualizarBoletoSchema.safeParse(req.body);

    if (!validacao.success) {
      const erros = validacao.error.issues.map((i) => i.message).join(", ");
      throw new ValidationError(erros);
    }

    const boleto = await this.boletoService.atualizar(
      boletoId,
      req.usuario!.empresa_id,
      validacao.data
    );

    return res.status(200).json({
      success: true,
      data: boleto,
    });
  }

  async deletar(req: Request, res: Response) {
    const boletoId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);

    await this.boletoService.deletar(
      boletoId,
      req.usuario!.empresa_id,
      req.usuario!.usuario_id
    );

    return res.status(200).json({
      success: true,
      message: "Boleto deletado com sucesso",
    });
  }
}