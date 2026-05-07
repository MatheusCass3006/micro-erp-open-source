import { Router } from "express";
import { NotaController } from "./controllers/NotaController";
import { requireAuth } from "../../middlewares/authMiddleware";
import { asyncHandler } from "../../shared/utils/asyncHandler";

const notaRouter = Router();
const notaController = new NotaController();

notaRouter.get(
  "/",
  requireAuth(),
  asyncHandler((req, res) => notaController.listar(req, res))
);

notaRouter.post(
  "/",
  requireAuth(),
  asyncHandler((req, res) => notaController.criar(req, res))
);

notaRouter.put(
  "/:id",
  requireAuth(),
  asyncHandler((req, res) => notaController.atualizar(req, res))
);

notaRouter.delete(
  "/:id",
  requireAuth(),
  asyncHandler((req, res) => notaController.deletar(req, res))
);

notaRouter.get(
  "/:id/itens",
  requireAuth(),
  asyncHandler((req, res) => notaController.buscarItens(req, res))
);

notaRouter.get(
  "/resumo/mensal",
  requireAuth(),
  asyncHandler((req, res) => notaController.resumoMensal(req, res))
);

export default notaRouter;