import { z } from "zod";

export const criarNotaSchema = z.object({
  numero_nota: z.string().nullable().optional(),
  empresa_nome: z.string().min(1, "Nome da empresa é obrigatório"),
  cnpj: z.string().nullable().optional(),
  data_emissao: z.string().nullable().optional(),
  data_entrada: z.string(),
  observacao: z.string().nullable().optional(),
  itens: z.array(z.object({
    produto: z.string().min(1, "Produto é obrigatório"),
    codigo: z.string().nullable().optional(),
    quantidade: z.number().positive().default(1),
    unidade: z.string().default("un"),
    valor_unitario: z.number().positive("Valor deve ser maior que zero"),
  })).optional(),
}).passthrough();

export const atualizarNotaSchema = z.object({
  numero_nota: z.string().nullable().optional(),
  empresa_nome: z.string().min(1).optional(),
  cnpj: z.string().nullable().optional(),
  data_emissao: z.string().nullable().optional(),
  data_entrada: z.string().optional(),
  observacao: z.string().nullable().optional(),
}).passthrough();

export const criarItemSchema = z.object({
  produto: z.string().min(1, "Produto é obrigatório"),
  codigo: z.string().nullable().optional(),
  quantidade: z.number().positive().default(1),
  unidade: z.string().default("un"),
  valor_unitario: z.number().positive("Valor deve ser maior que zero"),
});

export type CriarNotaDTO = z.infer<typeof criarNotaSchema>;
export type AtualizarNotaDTO = z.infer<typeof atualizarNotaSchema>;