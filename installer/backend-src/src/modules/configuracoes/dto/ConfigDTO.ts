import { z } from "zod";

export const criarMaquininhaSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  tipo: z.string().min(1, "Tipo é obrigatório"),
  taxa_percentual: z.number().default(0),
}).passthrough();

export const atualizarMaquininhaSchema = z.object({
  nome: z.string().min(1).optional(),
  tipo: z.string().optional(),
  taxa_percentual: z.number().optional(),
  ativa: z.boolean().optional(),
}).passthrough();

export const atualizarConfigsSchema = z.object({
  configs: z.record(z.string(), z.string()),
});

export type CriarMaquininhaDTO = z.infer<typeof criarMaquininhaSchema>;
export type AtualizarMaquininhaDTO = z.infer<typeof atualizarMaquininhaSchema>;
export type AtualizarConfigsDTO = z.infer<typeof atualizarConfigsSchema>;

export const CONFIG_KEYS = [
  { chave: "email_remetente", descricao: "E-mail que vai enviar as notificações" },
  { chave: "email_senha", descricao: "Senha do e-mail (usar senha de app para Gmail)" },
  { chave: "email_destinatario", descricao: "E-mail que vai receber os relatórios" },
  { chave: "email_smtp_host", descricao: "Servidor SMTP", default: "smtp.gmail.com" },
  { chave: "email_smtp_porta", descricao: "Porta SMTP", default: "587" },
  { chave: "whatsapp_token", descricao: "Token da API do WhatsApp" },
  { chave: "whatsapp_instancia", descricao: "ID da instância Z-API" },
  { chave: "whatsapp_numero", descricao: "Número do WhatsApp para notificações" },
  { chave: "whatsapp_provider", descricao: "Provedor: zapi ou twilio", default: "zapi" },
  { chave: "twilio_account_sid", descricao: "Account SID do Twilio" },
  { chave: "twilio_auth_token", descricao: "Auth Token do Twilio" },
  { chave: "twilio_whatsapp_from", descricao: "Número Twilio WhatsApp" },
  { chave: "dia_relatorio_mensal", descricao: "Dia do mês para enviar relatório", default: "1" },
  { chave: "alerta_vencimento_dias", descricao: "Quantos dias antes do vencimento alertar", default: "3" },
  { chave: "nome_empresa", descricao: "Nome da empresa para o relatório", default: "Minha Empresa" },
];