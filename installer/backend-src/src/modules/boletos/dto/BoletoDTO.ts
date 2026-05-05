import { z } from "zod";

export const criarBoletoSchema = z.object({
  descricao: z.string().min(1, "Descrição é obrigatória"),
  beneficiario: z.string().nullable().optional(),
  valor: z.number().positive("Valor deve ser maior que zero"),
  vencimento: z.string(),
  linha_digitavel: z.string().nullable().optional(),
  observacao: z.string().nullable().optional(),
});

export const atualizarBoletoSchema = z.object({
  descricao: z.string().min(1).optional(),
  beneficiario: z.string().nullable().optional(),
  valor: z.number().positive().optional(),
  vencimento: z.string().optional(),
  status: z.enum(["pendente", "pago", "atrasado", "cancelado"]).optional(),
  linha_digitavel: z.string().nullable().optional(),
  observacao: z.string().nullable().optional(),
  data_pagamento: z.string().nullable().optional(),
});

export type CriarBoletoDTO = z.infer<typeof criarBoletoSchema>;
export type AtualizarBoletoDTO = z.infer<typeof atualizarBoletoSchema>;