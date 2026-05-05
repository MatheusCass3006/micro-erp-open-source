import { Router } from "express";
import { FeedbackController } from "./controllers/FeedbackController";
import { requireAuth } from "../../middlewares/authMiddleware";

const feedbackRouter = Router();
const controller = new FeedbackController();

feedbackRouter.post(
  "/enviar",
  (req, res) => controller.criar(req, res)
);

feedbackRouter.get(
  "/listar",
  requireAuth(),
  (req, res) => controller.listar(req, res)
);

feedbackRouter.put(
  "/:id/lido",
  requireAuth(),
  (req, res) => controller.marcarLido(req, res)
);

feedbackRouter.get(
  "/stats",
  requireAuth(),
  (req, res) => controller.stats(req, res)
);

export default feedbackRouter;