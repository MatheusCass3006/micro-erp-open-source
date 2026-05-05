import { Router } from "express";
import { SaidaController } from "./controllers/SaidaController";
import { requireAuth } from "../../middlewares/authMiddleware";

const saidaRouter = Router();
const saidaController = new SaidaController();

saidaRouter.get(
  "/",
  requireAuth(),
  (req, res) => saidaController.listar(req, res)
);

saidaRouter.post(
  "/",
  requireAuth(),
  (req, res) => saidaController.criar(req, res)
);

saidaRouter.put(
  "/:id",
  requireAuth(),
  (req, res) => saidaController.atualizar(req, res)
);

saidaRouter.delete(
  "/:id",
  requireAuth(),
  (req, res) => saidaController.deletar(req, res)
);

saidaRouter.get(
  "/resumo/mensal",
  requireAuth(),
  (req, res) => saidaController.resumoMensal(req, res)
);

saidaRouter.get(
  "/categorias",
  requireAuth(),
  (req, res) => saidaController.listarCategorias(req, res)
);

saidaRouter.post(
  "/categorias",
  requireAuth(),
  (req, res) => saidaController.criarCategoria(req, res)
);

saidaRouter.put(
  "/categorias/:id",
  requireAuth(),
  (req, res) => saidaController.atualizarCategoria(req, res)
);

saidaRouter.delete(
  "/categorias/:id",
  requireAuth(),
  (req, res) => saidaController.deletarCategoria(req, res)
);

export default saidaRouter;