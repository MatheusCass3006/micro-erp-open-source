import { Request, Response } from "express";
import { FeedbackService } from "../services/FeedbackService";
import { criarFeedbackSchema, responderFeedbackSchema } from "../dto/FeedbackDTO";
import { ValidationError, ForbiddenError } from "../../../shared/errors/AppError";

function asNumber(val: unknown): number | undefined {
  if (Array.isArray(val)) val = val[0];
  return typeof val === "string" ? parseInt(val) : undefined;
}

function asBoolean(val: unknown): boolean {
  if (typeof val === "string") return val === "true";
  if (typeof val === "boolean") return val;
  return false;
}

export class FeedbackController {
  private service = new FeedbackService();

  async criar(req: Request, res: Response) {
    const validacao = criarFeedbackSchema.safeParse(req.body);

    if (!validacao.success) {
      const erros = validacao.error.issues.map((i) => i.message).join(", ");
      throw new ValidationError(erros);
    }

    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const resultado = await this.service.criar(validacao.data, ip);

    return res.status(201).json({
      success: true,
      ...resultado,
    });
  }

  async listar(req: Request, res: Response) {
    const { apenas_nao_lidos, tipo, limit = 50 } = req.query;

    const resultado = await this.service.listar(
      asBoolean(apenas_nao_lidos),
      tipo as string | undefined,
      asNumber(limit) || 50
    );

    return res.status(200).json({
      success: true,
      ...resultado,
    });
  }

  async marcarLido(req: Request, res: Response) {
    const feedbackId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);

    const validacao = responderFeedbackSchema.safeParse(req.body);
    const resposta = validacao.success ? validacao.data.resposta : undefined;

    await this.service.marcarLido(feedbackId, resposta);

    return res.status(200).json({
      success: true,
      message: "Feedback marcado como lido",
    });
  }

  async stats(req: Request, res: Response) {
    const resultado = await this.service.stats();

    return res.status(200).json({
      success: true,
      data: resultado,
    });
  }
}