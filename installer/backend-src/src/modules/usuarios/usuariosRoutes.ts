import { Router } from "express";
import { UsuarioController } from "./controllers/UsuarioController";
import { requireAuth, requireAdmin } from "../../middlewares/authMiddleware";

const usuarioRouter = Router();
const usuarioController = new UsuarioController();

usuarioRouter.get(
  "/",
  requireAuth(),
  requireAdmin(),
  (req, res) => usuarioController.listar(req, res)
);

usuarioRouter.post(
  "/",
  requireAuth(),
  requireAdmin(),
  (req, res) => usuarioController.criar(req, res)
);

usuarioRouter.delete(
  "/:id",
  requireAuth(),
  requireAdmin(),
  (req, res) => usuarioController.desativar(req, res)
);

export default usuarioRouter;