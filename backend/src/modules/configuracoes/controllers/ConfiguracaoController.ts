import { Request, Response } from "express";
import { ConfiguracaoService } from "../services/ConfiguracaoService";
import { atualizarConfigsSchema, criarMaquininhaSchema, atualizarMaquininhaSchema } from "../dto/ConfigDTO";
import { ValidationError } from "../../../shared/errors/AppError";

function asNumber(val: unknown): number | undefined {
  if (Array.isArray(val)) val = val[0];
  return typeof val === "string" ? parseInt(val) : undefined;
}

export class ConfiguracaoController {
  private service = new ConfiguracaoService();

  async listar(req: Request, res: Response) {
    const configs = await this.service.listar(req.usuario?.empresa_id);

    return res.status(200).json({
      success: true,
      data: configs,
    });
  }

  async salvar(req: Request, res: Response) {
    const validacao = atualizarConfigsSchema.safeParse(req.body);

    if (!validacao.success) {
      const erros = validacao.error.issues.map((i) => i.message).join(", ");
      throw new ValidationError(erros);
    }

    const resultado = await this.service.salvar(
      req.usuario!.empresa_id,
      validacao.data.configs
    );

    return res.status(200).json({
      success: true,
      ...resultado,
    });
  }

  async listarMaquininhas(req: Request, res: Response) {
    const maquiniinhas = await this.service.listarMaquininhas(req.usuario!.empresa_id);

    return res.status(200).json({
      success: true,
      data: maquiniinhas,
    });
  }

  async criarMaquininha(req: Request, res: Response) {
    const validacao = criarMaquininhaSchema.safeParse(req.body);

    if (!validacao.success) {
      const erros = validacao.error.issues.map((i) => i.message).join(", ");
      throw new ValidationError(erros);
    }

    const maquiniinha = await this.service.criarMaquininha(
      req.usuario!.empresa_id,
      validacao.data
    );

    return res.status(201).json({
      success: true,
      data: maquiniinha,
    });
  }

  async atualizarMaquininha(req: Request, res: Response) {
    const maquinhinhaId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);

    const validacao = atualizarMaquininhaSchema.safeParse(req.body);

    if (!validacao.success) {
      const erros = validacao.error.issues.map((i) => i.message).join(", ");
      throw new ValidationError(erros);
    }

    const maquiniinha = await this.service.atualizarMaquininha(
      maquinhinhaId,
      req.usuario!.empresa_id,
      validacao.data
    );

    return res.status(200).json({
      success: true,
      data: maquiniinha,
    });
  }

  async deletarMaquininha(req: Request, res: Response) {
    const maquinhinhaId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);

    await this.service.deletarMaquininha(maquinhinhaId, req.usuario!.empresa_id);

    return res.status(200).json({
      success: true,
      message: "Maquininha desativada com sucesso",
    });
  }

  async testarEmail(req: Request, res: Response) {
    const resultado = await this.service.testarEmail(req.usuario!.empresa_id);

    return res.status(200).json({
      success: resultado.ok,
      ...resultado,
    });
  }

  async enviarRelatorio(req: Request, res: Response) {
    const { mes, ano } = req.query;

    const resultado = await this.service.enviarRelatorioMensal(
      req.usuario!.empresa_id,
      asNumber(mes) || new Date().getMonth() + 1,
      asNumber(ano) || new Date().getFullYear()
    );

    return res.status(200).json({
      success: true,
      ...resultado,
    });
  }
}