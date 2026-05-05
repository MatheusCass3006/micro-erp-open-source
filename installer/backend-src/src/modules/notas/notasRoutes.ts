import { Router } from "express";
import { NotaController } from "./controllers/NotaController";
import { requireAuth } from "../../middlewares/authMiddleware";

const notaRouter = Router();
const notaController = new NotaController();

notaRouter.get(
  "/",
  requireAuth(),
  (req, res) => notaController.listar(req, res)
);

notaRouter.post(
  "/",
  requireAuth(),
  (req, res) => notaController.criar(req, res)
);

notaRouter.put(
  "/:id",
  requireAuth(),
  (req, res) => notaController.atualizar(req, res)
);

notaRouter.delete(
  "/:id",
  requireAuth(),
  (req, res) => notaController.deletar(req, res)
);

notaRouter.get(
  "/:id/itens",
  requireAuth(),
  (req, res) => notaController.buscarItens(req, res)
);

notaRouter.get(
  "/resumo/mensal",
  requireAuth(),
  (req, res) => notaController.resumoMensal(req, res)
);

export default notaRouter;