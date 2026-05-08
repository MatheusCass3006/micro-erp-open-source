import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import passport from "passport";
import cookieSession from "cookie-session";
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
  max: 50,                   // mais restritivo para proteção
  message: { success: false, message: "Muitas tentativas de login. Aguarde 15 minutos." },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Rate limiting geral (todas as rotas de API) ──────────────────────
const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 1000,           // Permitir até 1000 requisições por minuto (Stress Test Ready)
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Válvula de Alívio: Monitor de Carga ───────────────────────────
let activeRequests = 0;
const MAX_CONCURRENT_REQUESTS = 500; // Limite de segurança

app.use((req, res, next) => {
  if (activeRequests >= MAX_CONCURRENT_REQUESTS) {
    return res.status(503).json({
      success: false,
      message: "Servidor sob alta carga. Por favor, tente em instantes (Válvula de Alívio)."
    });
  }
  activeRequests++;
  res.on("finish", () => activeRequests--);
  next();
});

app.use(express.json({ limit: "5mb" })); // limite de payload
app.use(cookieParser());

import { tenantMiddleware } from "./middlewares/tenantMiddleware";
app.use(tenantMiddleware);

app.use(cookieSession({
  name: "session",
  keys: [process.env.JWT_SECRET || "microerp-secret"],
  maxAge: 24 * 60 * 60 * 1000, // 24 horas
  secure: isProd,
  httpOnly: true,
  sameSite: isProd ? "none" : "lax",
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

// ── Inicialização do Banco ──────────────────────────────────────────
const connectDB = async () => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("✅ Banco de dados conectado!");
    }
  } catch (error) {
    console.error("❌ Falha crítica na conexão com o banco:", error);
    throw error;
  }
};

// Middleware para garantir conexão (essencial para Vercel Serverless)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Erro na conexão serverless:", error);
    res.status(500).json({ error: "Erro na conexão com o banco de dados" });
  }
});

app.use(errorMiddleware);

// Inicia servidor localmente (não roda no Vercel, pois o Vercel usa o export app)
if (process.env.NODE_ENV !== "test" && !process.env.VERCEL && !process.env.NOW_REGION) {
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando localmente na porta ${PORT}`);
      });
    })
    .catch((error) => {
      console.error("❌ Erro ao iniciar servidor local:", error);
    });
}

export default app;