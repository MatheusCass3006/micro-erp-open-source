import { Router }         from "express";
import { AuthController }  from "./controllers/AuthController";
import { requireAuth }     from "../../middlewares/authMiddleware";
import passport          from "passport";
import { AuthService } from "./services/AuthService";
import { setupGoogleOAuth } from "./googleStrategy";

const authRouter    = Router();
const authController = new AuthController();

setupGoogleOAuth();

authRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

authRouter.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/?erro=google", session: false }),
  (req, res) => {
    const user = req.user as any;
    const origin = (process.env.CORS_ORIGIN || "").split(",")[0] || "http://localhost:3000";
    if (!user) return res.redirect(`${origin}/login?erro=google`);

    const authService = new AuthService();
    const token = authService.gerarAccessToken(
      user.id,
      user.empresaId,
      user.empresaNome,
      user.empresaSlug,
      user.role,
      user.nome,
      user.email
    );

    res.redirect(`${origin}/login?google_token=${token}`);
  }
);

// ── Endpoints públicos (sem autenticação) ─────────────────────
authRouter.post("/registrar", (req, res) => authController.registrar(req, res));
authRouter.post("/login",     (req, res) => authController.login(req, res));

// Refresh: valida o cookie HttpOnly (sf_rt) e rotaciona o token
// Não usa requireAuth() — o refresh token IS a credencial aqui
authRouter.post("/refresh",   (req, res) => authController.refresh(req, res));

// Logout: limpa o refresh token do banco e do cookie
authRouter.post("/logout",    (req, res) => authController.logout(req, res));

// ── Endpoints autenticados ────────────────────────────────────
authRouter.get("/me", requireAuth(), (req, res) => authController.me(req, res));

export default authRouter;
