import { Router } from "express";
import { UsuarioController } from "./controllers/UsuarioController";
import { requireAuth, requireAdmin } from "../../middlewares/authMiddleware";
import { asyncHandler } from "../../shared/utils/asyncHandler";

const usuarioRouter = Router();
const usuarioController = new UsuarioController();

usuarioRouter.get(
  "/",
  requireAuth(),
  requireAdmin(),
  asyncHandler((req, res) => usuarioController.listar(req, res))
);

usuarioRouter.post(
  "/",
  requireAuth(),
  requireAdmin(),
  asyncHandler((req, res) => usuarioController.criar(req, res))
);

usuarioRouter.delete(
  "/:id",
  requireAuth(),
  requireAdmin(),
  asyncHandler((req, res) => usuarioController.desativar(req, res))
);

export default usuarioRouter;