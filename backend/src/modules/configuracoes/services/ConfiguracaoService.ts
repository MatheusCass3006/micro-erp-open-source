import { AppDataSource } from "../../../database";
import { Configuracao } from "../../../database/entities/Configuracao";
import { Maquininha } from "../../../database/entities/Maquininha";
import { NotFoundError, AppError } from "../../../shared/errors/AppError";

export class ConfiguracaoService {
  private get configRepo() { return AppDataSource.getRepository(Configuracao); }
  private get maquiniinhaRepo() { return AppDataSource.getRepository(Maquininha); }

  async listar(empresaId?: number) {
    if (!empresaId) {
      const cfg = await this.configRepo.findOne({
        where: { chave: "nome_empresa" },
      });
      return { nome_empresa: { valor: cfg?.valor || "MicroERP", descricao: "" } };
    }

    const configs = await this.configRepo.find({
      where: { empresaId },
    });

    const result: Record<string, { valor: string; descricao: string }> = {};
    for (const c of configs) {
      result[c.chave] = { valor: c.valor || "", descricao: c.descricao || "" };
    }
    return result;
  }

  async salvar(empresaId: number, configs: Record<string, string>) {
    for (const [chave, valor] of Object.entries(configs)) {
      const existente = await this.configRepo.findOne({
        where: { empresaId, chave },
      });

      if (existente) {
        existente.valor = valor;
        existente.atualizadoEm = new Date().toISOString();
        await this.configRepo.save(existente);
      } else {
        const nova = this.configRepo.create({
          empresaId,
          chave,
          valor,
          atualizadoEm: new Date().toISOString(),
        });
        await this.configRepo.save(nova);
      }
    }

    return { ok: true, atualizados: Object.keys(configs).length };
  }

  async listarMaquininhas(empresaId: number) {
    const maquiniinhas = await this.maquiniinhaRepo.find({
      where: { empresaId },
      order: { nome: "ASC" },
    });

    return maquiniinhas.map((m) => ({
      id: m.id,
      nome: m.nome,
      tipo: m.tipo,
      taxa_percentual: Number(m.taxaPercentual) * 100,
      ativa: m.ativa,
      criado_em: m.criadoEm.toISOString(),
    }));
  }

  async criarMaquininha(empresaId: number, dados: any) {
    const taxaDecimal = (dados.taxa_percentual || 0) / 100;

    const maquiniinha = this.maquiniinhaRepo.create({
      empresaId,
      nome: dados.nome,
      tipo: dados.tipo,
      taxaPercentual: taxaDecimal,
      ativa: true,
    });

    await this.maquiniinhaRepo.save(maquiniinha);

    return {
      id: maquiniinha.id,
      nome: maquiniinha.nome,
      tipo: maquiniinha.tipo,
      taxa_percentual: Number(maquiniinha.taxaPercentual) * 100,
      ativa: maquiniinha.ativa,
      criado_em: maquiniinha.criadoEm.toISOString(),
    };
  }

  async atualizarMaquininha(maquininhaId: number, empresaId: number, dados: any) {
    const maquiniinha = await this.maquiniinhaRepo.findOne({
      where: { id: maquininhaId, empresaId },
    });

    if (!maquiniinha) {
      throw new NotFoundError("Maquininha");
    }

    if (dados.nome !== undefined) maquiniinha.nome = dados.nome;
    if (dados.tipo !== undefined) maquiniinha.tipo = dados.tipo;
    if (dados.taxa_percentual !== undefined) {
      maquiniinha.taxaPercentual = dados.taxa_percentual / 100;
    }
    if (dados.ativa !== undefined) maquiniinha.ativa = dados.ativa;

    await this.maquiniinhaRepo.save(maquiniinha);

    return {
      id: maquiniinha.id,
      nome: maquiniinha.nome,
      tipo: maquiniinha.tipo,
      taxa_percentual: Number(maquiniinha.taxaPercentual) * 100,
      ativa: maquiniinha.ativa,
      criado_em: maquiniinha.criadoEm.toISOString(),
    };
  }

  async deletarMaquininha(maquininhaId: number, empresaId: number) {
    const maquiniinha = await this.maquiniinhaRepo.findOne({
      where: { id: maquininhaId, empresaId },
    });

    if (!maquiniinha) {
      throw new NotFoundError("Maquininha");
    }

    maquiniinha.ativa = false;
    await this.maquiniinhaRepo.save(maquiniinha);

    return { ok: true };
  }

  async testarEmail(empresaId: number) {
    const configs = await this.configRepo.find({
      where: { empresaId },
    });

    const getCfg = (chave: string) => configs.find((c) => c.chave === chave)?.valor || "";

    const remetente = getCfg("email_remetente");
    const senha = getCfg("email_senha");
    const destinatario = getCfg("email_destinatario");
    const smtpHost = getCfg("email_smtp_host") || "smtp.gmail.com";
    const smtpPorta = parseInt(getCfg("email_smtp_porta") || "587");

    if (!remetente || !senha || !destinatario) {
      return { ok: false, erro: "Configure remetente, senha e destinatário antes de testar." };
    }

    try {
      const nodemailer = await import("nodemailer");
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPorta,
        secure: false,
        auth: { user: remetente, pass: senha },
      });

      await transporter.sendMail({
        from: remetente,
        to: destinatario,
        subject: "✅ Teste de E-mail — MicroERP",
        text: "Teste de e-mail do MicroERP. Configuração funcionando!",
      });

      return { ok: true, mensagem: `E-mail enviado para ${destinatario}` };
    } catch (error: any) {
      return { ok: false, erro: error.message || "Erro ao enviar e-mail" };
    }
  }

  async enviarRelatorioMensal(empresaId: number, mes: number, ano: number) {
    const configs = await this.configRepo.find({
      where: { empresaId },
    });

    const getCfg = (chave: string) => configs.find((c) => c.chave === chave)?.valor || "";

    const remetente = getCfg("email_remetente");
    const senha = getCfg("email_senha");
    const destinatario = getCfg("email_destinatario");
    const smtpHost = getCfg("email_smtp_host") || "smtp.gmail.com";
    const smtpPorta = parseInt(getCfg("email_smtp_porta") || "587");
    const nomeEmpresa = getCfg("nome_empresa") || "MicroERP";

    const mesesPt = ["", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    let emailResult = { ok: false, erro: "Email não configurado" as string | null };

    if (remetente && senha && destinatario) {
      try {
        const nodemailer = await import("nodemailer");
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPorta,
          secure: false,
          auth: { user: remetente, pass: senha },
        });

        const corpo = `Relatório Mensal — ${mesesPt[mes]}/${ano}\nEmpresa: ${nomeEmpresa}\n\nAcesse o sistema para visualizar o relatório completo.`;

        await transporter.sendMail({
          from: remetente,
          to: destinatario,
          subject: `📊 Relatório ${mesesPt[mes]}/${ano} — ${nomeEmpresa}`,
          text: corpo,
        });

        emailResult = { ok: true, erro: null };
      } catch (error: any) {
        emailResult = { ok: false, erro: error.message };
      }
    }

    return { email: emailResult, whatsapp: { ok: false, erro: "WhatsApp não configurado" } };
  }
}