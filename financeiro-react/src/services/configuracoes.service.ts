// ============================================================
// SERVIÇO: Configurações do sistema
// GET /api/configuracoes  → chave/valor por empresa
// PUT /api/configuracoes  → salvar mapa { configs: Record<string,string> }
// POST /api/configuracoes/testar-email
// ============================================================

import { api } from './api';

export interface ConfigMap {
  [chave: string]: { valor: string; descricao: string };
}

export interface TestarEmailPayload {
  email_remetente:    string;
  email_senha:        string;
  email_destinatario: string;
  email_smtp_host:    string;
  email_smtp_porta:   string;
}

/** Retorna todas as configurações da empresa como { chave: { valor, descricao } } */
export async function getConfiguracoes(): Promise<ConfigMap> {
  return api.get<ConfigMap>('/api/configuracoes');
}

/** Salva um mapa de chaves/valores { configs: { chave: valor } } */
export async function saveConfiguracoes(
  configs: Record<string, string>
): Promise<{ ok: boolean; atualizados: number }> {
  return api.put('/api/configuracoes', { configs });
}

/** Envia e-mail de teste com as configurações SMTP atuais */
export async function testarEmail(): Promise<{ mensagem: string }> {
  return api.post('/api/configuracoes/testar-email', {});
}
