import { Router } from "express";
import { ConfiguracaoController } from "./controllers/ConfiguracaoController";
import { requireAuth } from "../../middlewares/authMiddleware";

const configRouter = Router();
const controller = new ConfiguracaoController();

configRouter.get(
  "/configuracoes",
  (req, res) => controller.listar(req, res)
);

configRouter.put(
  "/configuracoes",
  requireAuth(),
  (req, res) => controller.salvar(req, res)
);

configRouter.get(
  "/maquininhas",
  requireAuth(),
  (req, res) => controller.listarMaquininhas(req, res)
);

configRouter.post(
  "/maquininhas",
  requireAuth(),
  (req, res) => controller.criarMaquininha(req, res)
);

configRouter.put(
  "/maquininhas/:id",
  requireAuth(),
  (req, res) => controller.atualizarMaquininha(req, res)
);

configRouter.delete(
  "/maquininhas/:id",
  requireAuth(),
  (req, res) => controller.deletarMaquininha(req, res)
);

configRouter.post(
  "/configuracoes/testar-email",
  requireAuth(),
  (req, res) => controller.testarEmail(req, res)
);

configRouter.post(
  "/configuracoes/enviar-relatorio",
  requireAuth(),
  (req, res) => controller.enviarRelatorio(req, res)
);

export default configRouter;