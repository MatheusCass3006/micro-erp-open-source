import { Router } from "express";
import { BoletoController } from "./controllers/BoletoController";
import { requireAuth } from "../../middlewares/authMiddleware";
import { asyncHandler } from "../../shared/utils/asyncHandler";

const boletoRouter = Router();
const boletoController = new BoletoController();

boletoRouter.get(
  "/",
  requireAuth(),
  asyncHandler((req, res) => boletoController.listar(req, res))
);

boletoRouter.post(
  "/",
  requireAuth(),
  asyncHandler((req, res) => boletoController.criar(req, res))
);

boletoRouter.put(
  "/:id",
  requireAuth(),
  asyncHandler((req, res) => boletoController.atualizar(req, res))
);

boletoRouter.delete(
  "/:id",
  requireAuth(),
  asyncHandler((req, res) => boletoController.deletar(req, res))
);

export default boletoRouter;