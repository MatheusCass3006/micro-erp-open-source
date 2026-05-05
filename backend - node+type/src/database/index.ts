import { DataSource } from "typeorm";
import { config } from "dotenv";
import { Empresa } from "./entities/Empresa";
import { Usuario } from "./entities/Usuario";
import { UsuarioEmpresa } from "./entities/UsuarioEmpresa";
import { Sessao } from "./entities/Sessao";
import { Maquininha } from "./entities/Maquininha";
import { Entrada } from "./entities/Entrada";
import { CategoriaSaida } from "./entities/CategoriaSaida";
import { Saida } from "./entities/Saida";
import { Boleto } from "./entities/Boleto";
import { Nota } from "./entities/Nota";
import { ItemNota } from "./entities/ItemNota";
import { Configuracao } from "./entities/Configuracao";
import { Feedback } from "./entities/Feedback";

config();

const isProd = process.env.NODE_ENV === "production";

export const AppDataSource = new DataSource({
  type: "better-sqlite3",
  database: process.env.DB_FILE || "microerp.db",
  synchronize: !isProd,
  logging: process.env.NODE_ENV === "development",
  entities: [
    Empresa,
    Usuario,
    UsuarioEmpresa,
    Sessao,
    Maquininha,
    Entrada,
    CategoriaSaida,
    Saida,
    Boleto,
    Nota,
    ItemNota,
    Configuracao,
    Feedback,
  ],
  migrations: [__dirname + "/migrations/*.ts"],
});