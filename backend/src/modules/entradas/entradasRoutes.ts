import { Router } from "express";
import { EntradaController } from "./controllers/EntradaController";
import { requireAuth } from "../../middlewares/authMiddleware";
import { asyncHandler } from "../../middlewares/errorMiddleware";

const entradaRouter = Router();
const entradaController = new EntradaController();

// Todas as rotas usam asyncHandler para capturar erros async
entradaRouter.get(
  "/",
  requireAuth(),
  asyncHandler((req, res) => entradaController.listar(req, res))
);

entradaRouter.post(
  "/",
  requireAuth(),
  asyncHandler((req, res) => entradaController.criar(req, res))
);

entradaRouter.put(
  "/:id",
  requireAuth(),
  asyncHandler((req, res) => entradaController.atualizar(req, res))
);

// PATCH alias do PUT — frontend usa api.patch para edições parciais
entradaRouter.patch(
  "/:id",
  requireAuth(),
  asyncHandler((req, res) => entradaController.atualizar(req, res))
);

entradaRouter.delete(
  "/:id",
  requireAuth(),
  asyncHandler((req, res) => entradaController.deletar(req, res))
);

entradaRouter.get(
  "/maquininhas/lista",
  requireAuth(),
  asyncHandler((req, res) => entradaController.listarMaquininhas(req, res))
);

export default entradaRouter;