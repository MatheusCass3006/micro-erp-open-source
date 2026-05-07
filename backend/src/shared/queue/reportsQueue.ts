import Queue from "bull";

export const QUEUE_NAME = "reportsQueue";

// Configuração do Redis para o Bull
const redisOptions = {
  redis: {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
  }
};

// Criação da Fila
export const reportsQueue = new Queue(QUEUE_NAME, redisOptions);

// Tipagem do payload
export interface ReportJobData {
  tenantId: string;
  reportType: "mensal" | "reconciliacao";
  dataInicial: string;
  dataFinal: string;
  emailDestino: string;
}

// Processamento da fila (Worker)
reportsQueue.process(async (job) => {
  const { tenantId, reportType, emailDestino } = job.data as ReportJobData;
  
  console.log(`[Worker] Iniciando geração de relatório ${reportType} para Tenant ${tenantId}...`);
  
  // Simula o processamento pesado
  await new Promise((resolve) => setTimeout(resolve, 2000));
  
  console.log(`[Worker] Relatório enviado com sucesso para ${emailDestino}`);
  
  return { success: true, processedAt: new Date().toISOString() };
});

reportsQueue.on("completed", (job) => {
  console.log(`Job ${job.id} concluído com sucesso!`);
});

reportsQueue.on("failed", (job, err) => {
  console.error(`Job ${job?.id} falhou com o erro:`, err.message);
});
