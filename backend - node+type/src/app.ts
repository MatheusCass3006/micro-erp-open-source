import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import passport from "passport";
import session from "express-session";
import "reflect-metadata";
import { AppDataSource } from "./database";
import { errorMiddleware } from "./middlewares/errorMiddleware";
import authRouter from "./modules/auth/authRoutes";
import usuarioRouter from "./modules/usuarios/usuariosRoutes";
import entradaRouter from "./modules/entradas/entradasRoutes";
import saidaRouter from "./modules/saidas/saidasRoutes";
import boletoRouter from "./modules/boletos/boletosRoutes";
import notaRouter from "./modules/notas/notasRoutes";
import dashboardRouter from "./modules/dashboard/dashboardRoutes";
import configRouter from "./modules/configuracoes/configRoutes";
import feedbackRouter from "./modules/feedback/feedbackRoutes";

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === "production";

// ── Segurança: headers HTTP (CSP, X-Frame-Options, HSTS, etc.) ──────
app.use(helmet({
  contentSecurityPolicy: isProd,   // ativa CSP apenas em produção
  hsts: isProd ? { maxAge: 31536000, includeSubDomains: true } : false,
}));

// ── CORS: apenas origens autorizadas ────────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000")
  .split(",")
  .map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Permite requests sem origin (Postman, mobile apps, etc. em dev)
    if (!origin && !isProd) return callback(null, true);
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`Origem não permitida: ${origin}`));
  },
  credentials: true,
}));

// ── Rate limiting: autenticação (proteção a brute force) ────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // janela de 15 minutos
  max: 100,                  // máximo 100 tentativas por IP por janela (mais amigável para testes)
  message: { success: false, message: "Muitas tentativas. Aguarde 15 minutos." },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Rate limiting geral (todas as rotas de API) ──────────────────────
const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 300,            // 300 req/min por IP
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.json({ limit: "5mb" })); // limite de payload
app.use(cookieParser());

app.use(session({
  secret: process.env.JWT_SECRET || (() => {
    throw new Error("JWT_SECRET não configurado no ambiente!");
  })(),
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProd,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  },
}));

app.use(passport.initialize());
app.use(passport.session());

app.use("/api", globalLimiter);  // rate limit em toda a API

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authLimiter, authRouter); // rate limit extra em auth
app.use("/api/usuarios", usuarioRouter);
app.use("/api/entradas", entradaRouter);
app.use("/api/saidas", saidaRouter);
app.use("/api/boletos", boletoRouter);
app.use("/api/notas", notaRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api", configRouter);
app.use("/api/feedback", feedbackRouter);

app.use(errorMiddleware);

AppDataSource.initialize()
  .then(() => {
    console.log("Banco de dados conectado!");
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Erro ao conectar banco:", error);
  });

export default app;