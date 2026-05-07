import { describe, beforeAll, afterAll, it, expect } from "@jest/globals";
import { reportsQueue, QUEUE_NAME, ReportJobData } from "../src/shared/queue/reportsQueue";

describe("Reports Queue (Bull)", () => {
  beforeAll(async () => {
    // Limpa a fila antes dos testes
    await reportsQueue.empty();
  });

  afterAll(async () => {
    // Fecha a fila e a conexão com o Redis para o Jest poder encerrar
    await reportsQueue.close();
  });

  it("deve adicionar um job na fila e o worker deve processar", async () => {
    const jobData: ReportJobData = {
      tenantId: "tenant_123",
      reportType: "mensal",
      dataInicial: "2026-05-01",
      dataFinal: "2026-05-31",
      emailDestino: "admin@empresa.com"
    };

    const job = await reportsQueue.add(jobData);
    expect(job).toBeDefined();
    expect(job.id).toBeDefined();

    // Espera o job terminar
    const result = await job.finished();
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });
});
