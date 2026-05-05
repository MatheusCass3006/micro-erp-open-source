import { Router } from "express";
import { BoletoController } from "./controllers/BoletoController";
import { requireAuth } from "../../middlewares/authMiddleware";

const boletoRouter = Router();
const boletoController = new BoletoController();

boletoRouter.get(
  "/",
  requireAuth(),
  (req, res) => boletoController.listar(req, res)
);

boletoRouter.post(
  "/",
  requireAuth(),
  (req, res) => boletoController.criar(req, res)
);

boletoRouter.put(
  "/:id",
  requireAuth(),
  (req, res) => boletoController.atualizar(req, res)
);

boletoRouter.delete(
  "/:id",
  requireAuth(),
  (req, res) => boletoController.deletar(req, res)
);

export default boletoRouter;