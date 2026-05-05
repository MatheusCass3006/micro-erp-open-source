// ============================================================
// UTILITÁRIO: OCR com Tesseract.js — ITEM 11
// Reconhece texto de imagens/PDFs de boletos e notas fiscais.
// Uso: const texto = await reconhecerTexto(file)
// ============================================================

import { createWorker } from 'tesseract.js';

// Cache de worker para evitar recriar a cada chamada
let workerCache: Awaited<ReturnType<typeof createWorker>> | null = null;
let workerBusy = false;

async function getWorker() {
  if (!workerCache) {
    workerCache = await createWorker('por', 1, {
      logger: () => {}, // silencia logs de progresso no console
    });
  }
  return workerCache;
}

/**
 * Reconhece texto de um arquivo de imagem ou PDF.
 * Retorna o texto extraído (string) ou lança erro.
 * @param file File (JPG, PNG, PDF, etc.)
 * @param onProgress Callback opcional com progresso 0–100
 */
export async function reconhecerTexto(
  file: File,
  onProgress?: (pct: number) => void
): Promise<string> {
  if (workerBusy) {
    throw new Error('OCR em andamento. Aguarde e tente novamente.');
  }

  workerBusy = true;
  try {
    const worker = await getWorker();

    // Cria URL temporária para o arquivo
    const url = URL.createObjectURL(file);

    const result = await worker.recognize(url);

    URL.revokeObjectURL(url);

    if (onProgress) onProgress(100);
    return result.data.text;
  } finally {
    workerBusy = false;
  }
}

// ── Parsers de domínio ────────────────────────────────────────

/**
 * Extrai dados de boleto bancário do texto OCR.
 */
export function parsearBoleto(texto: string): {
  valor?:         number;
  vencimento?:    string;
  beneficiario?:  string;
  linhaDigitavel?: string;
} {
  // Valor: "R$ 1.234,56" ou "1234,56" ou "Valor: 1.234,56"
  const valorMatch = texto.match(/(?:R\$|valor[:\s]+)\s*([\d.,]+)/i);
  let valor: number | undefined;
  if (valorMatch) {
    const raw = valorMatch[1].replace(/\./g, '').replace(',', '.');
    const n   = parseFloat(raw);
    if (!isNaN(n) && n > 0) valor = n;
  }

  // Vencimento: "dd/mm/aaaa" ou "dd-mm-aaaa"
  const vencMatch = texto.match(/\b(\d{2})[\/\-](\d{2})[\/\-](\d{4})\b/);
  let vencimento: string | undefined;
  if (vencMatch) {
    // Converte para YYYY-MM-DD
    vencimento = `${vencMatch[3]}-${vencMatch[2]}-${vencMatch[1]}`;
  }

  // Linha digitável: sequência de 47 ou 48 dígitos/pontos/espaços
  const linhaMatch = texto.replace(/\n/g, ' ').match(/\d[\d.\s]{44,}/);
  const linhaDigitavel = linhaMatch?.[0].replace(/\s+/g, '') || undefined;

  // Beneficiário: heurística — linha com "Beneficiário:" ou "Cedente:"
  const benefMatch = texto.match(/(?:benefici[aá]rio|cedente)[:\s]+([^\n]+)/i);
  const beneficiario = benefMatch?.[1].trim() || undefined;

  return { valor, vencimento, beneficiario, linhaDigitavel };
}

/**
 * Extrai dados de nota fiscal do texto OCR.
 */
export function parsearNota(texto: string): {
  numero?:     string;
  cnpj?:       string;
  fornecedor?: string;
  valor?:      number;
  dataEmissao?: string;
} {
  // Número da NF: "NF-e 000123" ou "Nota Fiscal 123" ou "Número: 123"
  const nfMatch = texto.match(/(?:n[oó]\.?\s*(?:da\s*)?nota|nf[-\s]?e?|n[uú]mero)[:\s]*(\d{1,10})/i);
  const numero = nfMatch?.[1] || undefined;

  // CNPJ: "00.000.000/0000-00"
  const cnpjMatch = texto.match(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/);
  const cnpj = cnpjMatch?.[0] || undefined;

  // Valor total: "Total: R$ 1.234,56" ou "Valor Total: 1.234,56"
  const valorMatch = texto.match(/(?:valor\s+total|total\s+geral|total)[:\s]+R?\$?\s*([\d.,]+)/i);
  let valor: number | undefined;
  if (valorMatch) {
    const raw = valorMatch[1].replace(/\./g, '').replace(',', '.');
    const n   = parseFloat(raw);
    if (!isNaN(n) && n > 0) valor = n;
  }

  // Data de emissão: "dd/mm/aaaa"
  const dataMatch = texto.match(/(?:emiss[aã]o|emitid[ao])[:\s]+(\d{2})[\/\-](\d{2})[\/\-](\d{4})/i);
  let dataEmissao: string | undefined;
  if (dataMatch) {
    dataEmissao = `${dataMatch[3]}-${dataMatch[2]}-${dataMatch[1]}`;
  } else {
    // Fallback: primeiro dd/mm/aaaa encontrado
    const genData = texto.match(/\b(\d{2})[\/\-](\d{2})[\/\-](\d{4})\b/);
    if (genData) dataEmissao = `${genData[3]}-${genData[2]}-${genData[1]}`;
  }

  // Fornecedor: razão social geralmente na primeira linha não-numérica
  const linhas = texto.split('\n').map(l => l.trim()).filter(l => l.length > 4);
  const fornecedor = linhas.find(l => /[a-záéíóúçãõ]{3,}/i.test(l) && !/^\d/.test(l)) || undefined;

  return { numero, cnpj, fornecedor, valor, dataEmissao };
}

/**
 * Destrói o worker Tesseract (chamar apenas ao desmontar a app,
 * ou para liberar memória explicitamente).
 */
export async function destruirWorkerOCR() {
  if (workerCache) {
    await workerCache.terminate();
    workerCache = null;
  }
}
