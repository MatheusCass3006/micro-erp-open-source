// ============================================================
// SERVICE: Feedback — ITEM 08
// POST /api/feedback
// ============================================================

import { api } from './api';

export interface FeedbackPayload {
  tipo:     'sugestao' | 'elogio' | 'problema';
  mensagem: string;
}

export async function enviarFeedback(data: FeedbackPayload): Promise<void> {
  const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 500));
    console.log('[MOCK] Feedback enviado:', data);
    return;
  }
  await api.post('/api/feedback', data);
}
