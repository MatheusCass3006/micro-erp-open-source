import IORedis from "ioredis";
import { config } from "dotenv";

config();

const redisConfig = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
  maxRetriesPerRequest: null,
};

// Conexão unificada para ser reutilizada por filas e workers
export const redisConnection = new IORedis(redisConfig);

redisConnection.on("error", (err) => {
  console.error("Erro na conexão com Redis:", err);
});
