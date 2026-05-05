import { AppDataSource } from "../../../database";
import { Boleto } from "../../../database/entities/Boleto";
import { NotFoundError } from "../../../shared/errors/AppError";

export class BoletoService {
  private boletoRepo = AppDataSource.getRepository(Boleto);

  async listar(
    empresaId: number,
    status?: string,
    mes?: number,
    ano?: number,
    skip: number = 0,
    limit: number = 200
  ) {
    const qb = this.boletoRepo
      .createQueryBuilder("boleto")
      .where("boleto.empresaId = :empresaId", { empresaId })
      .andWhere("boleto.deletadoEm IS NULL");

    if (status) {
      qb.andWhere("boleto.status = :status", { status });
    }
    if (mes) {
      qb.andWhere("MONTH(boleto.vencimento) = :mes", { mes });
    }
    if (ano) {
      qb.andWhere("YEAR(boleto.vencimento) = :ano", { ano });
    }

    const total = await qb.getCount();
    const boletos = await qb
      .orderBy("boleto.vencimento", "ASC")
      .skip(skip)
      .take(limit)
      .getMany();

    return {
      total,
      items:boletos.map((b) => ({
        id: b.id,
        descricao: b.descricao,
        beneficiario: b.beneficiario,
        valor: Number(b.valor),
        vencimento: b.vencimento,
        status: b.status,
        linha_digitavel: b.linhaDigitavel,
        arquivo_nome: b.arquivoNome,
        observacao: b.observacao,
        data_pagamento: b.dataPagamento,
        criado_em: b.criadoEm,
      })),
    };
  }

  async criar(
    empresaId: number,
    dados: {
      descricao: string;
      beneficiario?: string | null;
      valor: number;
      vencimento: string;
      linha_digitavel?: string | null;
      observacao?: string | null;
    }
  ) {
    const boleto = this.boletoRepo.create({
      empresaId,
      descricao: dados.descricao,
      beneficiario: dados.beneficiario || null,
      valor: dados.valor,
      vencimento: dados.vencimento,
      linhaDigitavel: dados.linha_digitavel || null,
      observacao: dados.observacao || null,
      status: "pendente",
    });

    await this.boletoRepo.save(boleto);

    return {
      id: boleto.id,
      descricao: boleto.descricao,
      beneficiario: boleto.beneficiario,
      valor: Number(boleto.valor),
      vencimento: boleto.vencimento,
      status: boleto.status,
      linha_digitavel: boleto.linhaDigitavel,
      arquivo_nome: boleto.arquivoNome,
      observacao: boleto.observacao,
      data_pagamento: null,
      criado_em: boleto.criadoEm,
    };
  }

  async atualizar(
    boletoId: number,
    empresaId: number,
    dados: {
      descricao?: string;
      beneficiario?: string | null;
      valor?: number;
      vencimento?: string;
      status?: string;
      linha_digitavel?: string | null;
      observacao?: string | null;
      data_pagamento?: string | null;
    }
  ) {
    const boleto = await this.boletoRepo.findOne({
      where: { id: boletoId, empresaId, deletadoEm: undefined as any },
    });

    if (!boleto) {
      throw new NotFoundError("Boleto");
    }

    if (dados.descricao) boleto.descricao = dados.descricao;
    if (dados.beneficiario !== undefined) boleto.beneficiario = dados.beneficiario;
    if (dados.valor) boleto.valor = dados.valor;
    if (dados.vencimento) boleto.vencimento = dados.vencimento;
    if (dados.status) boleto.status = dados.status;
    if (dados.linha_digitavel !== undefined) boleto.linhaDigitavel = dados.linha_digitavel;
    if (dados.observacao !== undefined) boleto.observacao = dados.observacao;
    if (dados.data_pagamento !== undefined) {
      boleto.dataPagamento = dados.data_pagamento || null;
    }

    if (dados.status === "pago" && !boleto.dataPagamento) {
      boleto.dataPagamento = new Date().toISOString().split("T")[0];
    }

    await this.boletoRepo.save(boleto);

    return {
      id: boleto.id,
      descricao: boleto.descricao,
      beneficiario: boleto.beneficiario,
      valor: Number(boleto.valor),
      vencimento: boleto.vencimento,
      status: boleto.status,
      linha_digitavel: boleto.linhaDigitavel,
      arquivo_nome: boleto.arquivoNome,
      observacao: boleto.observacao,
      data_pagamento: boleto.dataPagamento,
      criado_em: boleto.criadoEm,
    };
  }

  async deletar(boletoId: number, empresaId: number, usuarioId: number) {
    const boleto = await this.boletoRepo.findOne({
      where: { id: boletoId, empresaId, deletadoEm: undefined as any },
    });

    if (!boleto) {
      throw new NotFoundError("Boleto");
    }

    boleto.deletadoEm = new Date().toISOString();
    boleto.deletadoPorId = usuarioId;
    await this.boletoRepo.save(boleto);

    return { ok: true };
  }

  async atualizarStatusAutomatico(empresaId: number) {
    const hoje = new Date();
    
    await this.boletoRepo
      .createQueryBuilder()
      .update(Boleto)
      .set({ status: "atrasado" })
      .where("empresaId = :empresaId", { empresaId })
      .andWhere("status = :status", { status: "pendente" })
      .andWhere("vencimento < :hoje", { hoje })
      .execute();
  }
}