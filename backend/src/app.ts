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
const isProd = process.env.NODE_ENV === "production" || !!process.env.VERCEL;

// ── Trust Proxy: Necessário para Vercel/CloudFront/Lambda ─────────────
app.set("trust proxy", true);

// ── Inicialização do Banco (MUITO IMPORTANTE: DEVE SER O PRIMEIRO!) ──
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

// ── Segurança: headers HTTP (CSP, X-Frame-Options, HSTS, etc.) ──────
app.use(helmet({
  contentSecurityPolicy: isProd,   // ativa CSP apenas em produção
  hsts: isProd ? { maxAge: 31536000, includeSubDomains: true } : false,
}));

// ── CORS: apenas origens autorizadas ────────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGIN || "https://micro-erp-production.digital,https://micro-erp-open-source.vercel.app,https://financeiro-react-teal.vercel.app,http://localhost:3000")
  .split(",")
  .map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Permite requests sem origin (Postman, mobile apps, etc. em dev)
    if (!origin && !isProd) return callback(null, true);
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) return callback(null, true);
    callback(new Error(`Origem não permitida: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Origin", "Accept", "X-Requested-With"],
}));

// ── Rate limiting: autenticação (proteção a brute force) ────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // janela de 15 minutos
  max: 1000,                  // Aumentado para 1000 em dev/debug
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

app.use(passport.initialize());

app.use("/api", globalLimiter);  // rate limit em toda a API


app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authLimiter, authRouter);
app.use("/api/usuarios", usuarioRouter);
app.use("/api/entradas", entradaRouter);
app.use("/api/saidas", saidaRouter);
app.use("/api/boletos", boletoRouter);
app.use("/api/notas", notaRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api", configRouter);
app.use("/api/feedback", feedbackRouter);

app.use(errorMiddleware);

// Fallback 404 handler para debug no Vercel
app.use((req: Request, res: Response) => {
  console.log(`[404] Não encontrado: ${req.method} ${req.originalUrl} (url: ${req.url})`);
  res.status(404).json({
    success: false,
    message: "Rota não encontrada",
    debug: {
      method: req.method,
      url: req.url,
      originalUrl: req.originalUrl,
      path: req.path
    }
  });
});

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