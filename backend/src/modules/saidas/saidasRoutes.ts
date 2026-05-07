import { Router } from "express";
import { SaidaController } from "./controllers/SaidaController";
import { requireAuth } from "../../middlewares/authMiddleware";
import { asyncHandler } from "../../shared/utils/asyncHandler";

const saidaRouter = Router();
const saidaController = new SaidaController();

saidaRouter.get(
  "/",
  requireAuth(),
  asyncHandler((req, res) => saidaController.listar(req, res))
);

saidaRouter.post(
  "/",
  requireAuth(),
  asyncHandler((req, res) => saidaController.criar(req, res))
);

saidaRouter.put(
  "/:id",
  requireAuth(),
  asyncHandler((req, res) => saidaController.atualizar(req, res))
);

saidaRouter.delete(
  "/:id",
  requireAuth(),
  asyncHandler((req, res) => saidaController.deletar(req, res))
);

saidaRouter.get(
  "/resumo/mensal",
  requireAuth(),
  asyncHandler((req, res) => saidaController.resumoMensal(req, res))
);

saidaRouter.get(
  "/categorias",
  requireAuth(),
  asyncHandler((req, res) => saidaController.listarCategorias(req, res))
);

saidaRouter.post(
  "/categorias",
  requireAuth(),
  asyncHandler((req, res) => saidaController.criarCategoria(req, res))
);

saidaRouter.put(
  "/categorias/:id",
  requireAuth(),
  asyncHandler((req, res) => saidaController.atualizarCategoria(req, res))
);

saidaRouter.delete(
  "/categorias/:id",
  requireAuth(),
  asyncHandler((req, res) => saidaController.deletarCategoria(req, res))
);

export default saidaRouter;