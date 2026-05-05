import { Request, Response } from "express";
import { NotaService } from "../services/NotaService";
import { criarNotaSchema, atualizarNotaSchema } from "../dto/NotaDTO";
import { ValidationError } from "../../../shared/errors/AppError";

function asNumber(val: unknown): number | undefined {
  if (Array.isArray(val)) val = val[0];
  return typeof val === "string" ? parseInt(val) : undefined;
}

export class NotaController {
  private notaService = new NotaService();

  async listar(req: Request, res: Response) {
    const { skip = 0, limit = 200 } = req.query;

    const resultado = await this.notaService.listar(
      req.usuario!.empresa_id,
      asNumber(skip) || 0,
      asNumber(limit) || 200
    );

    return res.status(200).json({
      success: true,
      data: resultado,
    });
  }

  async criar(req: Request, res: Response) {
    const validacao = criarNotaSchema.safeParse(req.body);

    if (!validacao.success) {
      const erros = validacao.error.issues.map((i) => i.message).join(", ");
      throw new ValidationError(erros);
    }

    const nota = await this.notaService.criar(
      req.usuario!.empresa_id,
      validacao.data
    );

    return res.status(201).json({
      success: true,
      data: nota,
    });
  }

  async atualizar(req: Request, res: Response) {
    const notaId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);

    const validacao = atualizarNotaSchema.safeParse(req.body);

    if (!validacao.success) {
      const erros = validacao.error.issues.map((i) => i.message).join(", ");
      throw new ValidationError(erros);
    }

    const nota = await this.notaService.atualizar(
      notaId,
      req.usuario!.empresa_id,
      validacao.data
    );

    return res.status(200).json({
      success: true,
      data: nota,
    });
  }

  async deletar(req: Request, res: Response) {
    const notaId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);

    await this.notaService.deletar(
      notaId,
      req.usuario!.empresa_id
    );

    return res.status(200).json({
      success: true,
      message: "Nota deletada com sucesso",
    });
  }

  async buscarItens(req: Request, res: Response) {
    const notaId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);

    const itens = await this.notaService.buscarItens(
      notaId,
      req.usuario!.empresa_id
    );

    return res.status(200).json({
      success: true,
      data: itens,
    });
  }

  async resumoMensal(req: Request, res: Response) {
    const { mes, ano } = req.query;

    const resumo = await this.notaService.resumoMensal(
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