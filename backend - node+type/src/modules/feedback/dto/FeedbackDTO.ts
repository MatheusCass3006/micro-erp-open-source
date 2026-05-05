import { z } from "zod";

export const criarFeedbackSchema = z.object({
  tipo: z.enum(["geral", "bug", "sugestao", "elogio"]).default("geral"),
  nota: z.number().min(1).max(5).nullable().optional(),
  mensagem: z.string().min(3, "Mensagem muito curta").max(2000),
  email: z.string().email().nullable().optional(),
  nome: z.string().nullable().optional(),
  versao: z.string().default("2.0.0"),
  tela_atual: z.string().nullable().optional(),
  empresa_id: z.number().nullable().optional(),
}).passthrough();

export const responderFeedbackSchema = z.object({
  resposta: z.string().min(1),
});

export type CriarFeedbackDTO = z.infer<typeof criarFeedbackSchema>;
export type ResponderFeedbackDTO = z.infer<typeof responderFeedbackSchema>;