import { z } from "zod";

export const registrarSchema = z
  .object({
    nome_usuario: z.string().min(1, "Nome é obrigatório"),
    nome_empresa: z.string().min(1, "Nome da empresa é obrigatório"),
    email: z.string().email("E-mail inválido").toLowerCase().trim(),
    senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
    confirmar_senha: z.string(),
  })
  .refine((data) => data.senha === data.confirmar_senha, {
    message: "As senhas não coincidem",
    path: ["confirmar_senha"],
  });

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido").toLowerCase().trim(),
  senha: z.string().min(1, "Senha é obrigatória"),
});

export type RegistrarDTO = z.infer<typeof registrarSchema>;
export type LoginDTO = z.infer<typeof loginSchema>;