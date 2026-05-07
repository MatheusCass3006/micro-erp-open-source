import { z } from "zod";

export const criarSaidaSchema = z.object({
  categoria_id: z.number().nullable().optional(),
  descricao: z.string().nullable().optional(),
  valor: z.number().positive("Valor deve ser maior que zero"),
  data: z.string().nullable().optional(),
  forma_pagamento: z.enum(["dinheiro", "pix", "debito", "credito", "alimentacao", "cheque", "outros"]).default("pix"),
  observacao: z.string().nullable().optional(),
}).passthrough();

export const atualizarSaidaSchema = z.object({
  categoria_id: z.number().nullable().optional(),
  descricao: z.string().nullable().optional(),
  valor: z.number().positive().optional(),
  data: z.string().nullable().optional(),
  forma_pagamento: z.enum(["dinheiro", "pix", "debito", "credito", "alimentacao", "cheque", "outros"]).optional(),
  observacao: z.string().nullable().optional(),
}).passthrough();

export const criarCategoriaSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  secao: z.enum(["empresa", "pessoal"]).default("empresa"),
});

export const atualizarCategoriaSchema = z.object({
  nome: z.string().min(1).optional(),
  ativa: z.boolean().optional(),
});

export type CriarSaidaDTO = z.infer<typeof criarSaidaSchema>;
export type AtualizarSaidaDTO = z.infer<typeof atualizarSaidaSchema>;
export type CriarCategoriaDTO = z.infer<typeof criarCategoriaSchema>;
export type AtualizarCategoriaDTO = z.infer<typeof atualizarCategoriaSchema>;