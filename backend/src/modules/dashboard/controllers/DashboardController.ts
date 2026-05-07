import { Request, Response } from "express";
import { DashboardService } from "../services/DashboardService";

function asNumber(val: unknown): number | undefined {
  if (Array.isArray(val)) val = val[0];
  return typeof val === "string" ? parseInt(val) : undefined;
}

export class DashboardController {
  private dashboardService = new DashboardService();

  async resumoGeral(req: Request, res: Response) {
    const { mes, ano } = req.query;

    const resumo = await this.dashboardService.resumoGeral(
      req.usuario!.empresa_id,
      asNumber(mes),
      asNumber(ano)
    );

    return res.status(200).json({
      success: true,
      data: resumo,
    });
  }

  async evolucaoMensal(req: Request, res: Response) {
    const { meses } = req.query;

    const evolucao = await this.dashboardService.evolucaoMensal(
      req.usuario!.empresa_id,
      asNumber(meses) || 6
    );

    return res.status(200).json({
      success: true,
      data: evolucao,
    });
  }

  async topDespesas(req: Request, res: Response) {
    const { mes, ano, limite } = req.query;

    const top = await this.dashboardService.topDespesas(
      req.usuario!.empresa_id,
      asNumber(mes),
      asNumber(ano),
      asNumber(limite) || 5
    );

    return res.status(200).json({
      success: true,
      data: top,
    });
  }
}