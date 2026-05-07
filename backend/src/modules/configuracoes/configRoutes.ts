import { Router } from "express";
import { ConfiguracaoController } from "./controllers/ConfiguracaoController";
import { requireAuth } from "../../middlewares/authMiddleware";
import { asyncHandler } from "../../shared/utils/asyncHandler";

const configRouter = Router();
const controller = new ConfiguracaoController();

configRouter.get(
  "/configuracoes",
  asyncHandler((req, res) => controller.listar(req, res))
);

configRouter.put(
  "/configuracoes",
  requireAuth(),
  asyncHandler((req, res) => controller.salvar(req, res))
);

configRouter.get(
  "/maquininhas",
  requireAuth(),
  asyncHandler((req, res) => controller.listarMaquininhas(req, res))
);

configRouter.post(
  "/maquininhas",
  requireAuth(),
  asyncHandler((req, res) => controller.criarMaquininha(req, res))
);

configRouter.put(
  "/maquininhas/:id",
  requireAuth(),
  asyncHandler((req, res) => controller.atualizarMaquininha(req, res))
);

configRouter.delete(
  "/maquininhas/:id",
  requireAuth(),
  asyncHandler((req, res) => controller.deletarMaquininha(req, res))
);

configRouter.post(
  "/configuracoes/testar-email",
  requireAuth(),
  asyncHandler((req, res) => controller.testarEmail(req, res))
);

configRouter.post(
  "/configuracoes/enviar-relatorio",
  requireAuth(),
  asyncHandler((req, res) => controller.enviarRelatorio(req, res))
);

export default configRouter;