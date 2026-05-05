import { z } from "zod";

export const criarEntradaSchema = z.object({
  maquihinha_id: z.number().nullable().optional(),
  descricao: z.string().nullable().optional(),
  valor_bruto: z.number().positive("Valor deve ser maior que zero"),
  data: z.string().nullable().optional(),
  observacao: z.string().nullable().optional(),
}).passthrough();

export const atualizarEntradaSchema = z.object({
  maquihinha_id: z.number().nullable().optional(),
  descricao: z.string().nullable().optional(),
  valor_bruto: z.number().positive().optional(),
  data: z.string().nullable().optional(),
  observacao: z.string().nullable().optional(),
}).passthrough();

export type CriarEntradaDTO = z.infer<typeof criarEntradaSchema>;
export type AtualizarEntradaDTO = z.infer<typeof atualizarEntradaSchema>;