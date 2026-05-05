import { AppDataSource } from "../../../database";
import { Feedback } from "../../../database/entities/Feedback";
import { AppError } from "../../../shared/errors/AppError";

const MASTER_EMAIL = process.env.MASTER_EMAIL || "matheuscassalho3006@gmail.com";

export class FeedbackService {
  private feedbackRepo = AppDataSource.getRepository(Feedback);

  async criar(dados: any, ip?: string) {
    const feedback = this.feedbackRepo.create({
      tipo: dados.tipo || "geral",
      nota: dados.nota || null,
      mensagem: dados.mensagem,
      email: dados.email || null,
      nome: dados.nome || null,
      versao: dados.versao || "2.0.0",
      telaAtual: dados.tela_atual || null,
      ip: ip || null,
      empresaId: dados.empresa_id || null,
      lido: false,
    });

    await this.feedbackRepo.save(feedback);

    return {
      ok: true,
      id: feedback.id,
      mensagem: "Obrigado pelo seu feedback! Sua opinião nos ajuda a melhorar o MicroERP.",
    };
  }

  async listar(apenasNaoLidos: boolean = false, tipo?: string, limit: number = 50) {
    const qb = this.feedbackRepo.createQueryBuilder("feedback");

    if (apenasNaoLidos) {
      qb.andWhere("feedback.lido = :lido", { lido: false });
    }
    if (tipo) {
      qb.andWhere("feedback.tipo = :tipo", { tipo });
    }

    const total = await qb.getCount();
    const feedbacks = await qb.orderBy("feedback.criadoEm", "DESC").take(limit).getMany();

    return {
      total,
      feedbacks: feedbacks.map((f) => ({
        id: f.id,
        tipo: f.tipo,
        nota: f.nota,
        mensagem: f.mensagem,
        email: f.email,
        nome: f.nome || "Anônimo",
        versao: f.versao,
        tela_atual: f.telaAtual,
        lido: f.lido,
        resposta: f.resposta,
        criado_em: f.criadoEm.toISOString(),
      })),
    };
  }

  async marcarLido(feedbackId: number, resposta?: string) {
    const feedback = await this.feedbackRepo.findOne({
      where: { id: feedbackId },
    });

    if (!feedback) {
      throw new AppError("Feedback não encontrado", 404);
    }

    feedback.lido = true;
    if (resposta) {
      feedback.resposta = resposta;
    }

    await this.feedbackRepo.save(feedback);

    return { ok: true };
  }

  async stats() {
    const total = await this.feedbackRepo.count();
    const naoLidos = await this.feedbackRepo.count({ where: { lido: false } });

    const result = await this.feedbackRepo
      .createQueryBuilder("feedback")
      .select("feedback.tipo", "tipo")
      .addSelect("COUNT(feedback.id)", "total")
      .groupBy("feedback.tipo")
      .getRawMany();

    const porTipo: Record<string, number> = {};
    for (const r of result) {
      porTipo[r.tipo] = parseInt(r.total);
    }

    const avgResult = await this.feedbackRepo
      .createQueryBuilder("feedback")
      .select("AVG(feedback.nota)", "media")
      .where("feedback.nota IS NOT NULL")
      .getRawOne();

    return {
      total,
      nao_lidos: naoLidos,
      media_nota: avgResult?.media ? parseFloat(avgResult.media).toFixed(2) : null,
      por_tipo: porTipo,
    };
  }
}