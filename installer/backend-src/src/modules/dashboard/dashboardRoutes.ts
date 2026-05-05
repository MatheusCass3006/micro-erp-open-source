import { Router } from "express";
import { DashboardController } from "./controllers/DashboardController";
import { requireAuth } from "../../middlewares/authMiddleware";

const dashboardRouter = Router();
const dashboardController = new DashboardController();

dashboardRouter.get(
  "/resumo",
  requireAuth(),
  (req, res) => dashboardController.resumoGeral(req, res)
);

dashboardRouter.get(
  "/evolucao",
  requireAuth(),
  (req, res) => dashboardController.evolucaoMensal(req, res)
);

dashboardRouter.get(
  "/top-despesas",
  requireAuth(),
  (req, res) => dashboardController.topDespesas(req, res)
);

export default dashboardRouter;