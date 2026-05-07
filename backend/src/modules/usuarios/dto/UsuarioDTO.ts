import { z } from "zod";

export const criarUsuarioSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido").toLowerCase().trim(),
  senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  role: z.enum(["admin", "operador"]).default("operador"),
});

export const atualizarUsuarioSchema = z.object({
  nome: z.string().min(1).optional(),
  email: z.string().email().toLowerCase().trim().optional(),
  role: z.enum(["admin", "operador"]).optional(),
});

export type CriarUsuarioDTO = z.infer<typeof criarUsuarioSchema>;
export type AtualizarUsuarioDTO = z.infer<typeof atualizarUsuarioSchema>;