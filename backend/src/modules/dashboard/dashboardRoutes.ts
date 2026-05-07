import { Router } from "express";
import { DashboardController } from "./controllers/DashboardController";
import { requireAuth } from "../../middlewares/authMiddleware";
import { asyncHandler } from "../../shared/utils/asyncHandler";

const dashboardRouter = Router();
const dashboardController = new DashboardController();

dashboardRouter.get(
  "/resumo",
  requireAuth(),
  asyncHandler((req, res) => dashboardController.resumoGeral(req, res))
);

dashboardRouter.get(
  "/evolucao",
  requireAuth(),
  asyncHandler((req, res) => dashboardController.evolucaoMensal(req, res))
);

dashboardRouter.get(
  "/top-despesas",
  requireAuth(),
  asyncHandler((req, res) => dashboardController.topDespesas(req, res))
);

export default dashboardRouter;