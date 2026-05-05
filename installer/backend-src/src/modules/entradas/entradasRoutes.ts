import { Router } from "express";
import { EntradaController } from "./controllers/EntradaController";
import { requireAuth } from "../../middlewares/authMiddleware";

const entradaRouter = Router();
const entradaController = new EntradaController();

entradaRouter.get(
  "/",
  requireAuth(),
  (req, res) => entradaController.listar(req, res)
);

entradaRouter.post(
  "/",
  requireAuth(),
  (req, res) => entradaController.criar(req, res)
);

entradaRouter.put(
  "/:id",
  requireAuth(),
  (req, res) => entradaController.atualizar(req, res)
);

entradaRouter.delete(
  "/:id",
  requireAuth(),
  (req, res) => entradaController.deletar(req, res)
);

entradaRouter.get(
  "/maquininhas/lista",
  requireAuth(),
  (req, res) => entradaController.listarMaquininhas(req, res)
);

export default entradaRouter;