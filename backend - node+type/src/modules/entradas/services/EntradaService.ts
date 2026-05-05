import { AppDataSource } from "../../../database";
import { Entrada } from "../../../database/entities/Entrada";
import { Maquininha } from "../../../database/entities/Maquininha";
import { NotFoundError } from "../../../shared/errors/AppError";
import { IsNull } from "typeorm";

export class EntradaService {
  // Lazy getters: garantem que o repo só é acessado após AppDataSource.initialize()
  private get entradaRepo() { return AppDataSource.getRepository(Entrada); }
  private get maquininhaRepo() { return AppDataSource.getRepository(Maquininha); }

  async listar(
    empresaId: number,
    mes?: number,
    ano?: number,
    maquininhaId?: number,
    skip: number = 0,
    limit: number = 500
  ) {
    const qb = this.entradaRepo
      .createQueryBuilder("entrada")
      .leftJoinAndSelect("entrada.maquininha", "maquininha")
      .where("entrada.empresaId = :empresaId", { empresaId })
      .andWhere("entrada.deletadoEm IS NULL");

    // SQLite não tem MONTH()/YEAR() — usa strftime
    if (mes && !isNaN(mes)) {
      qb.andWhere("strftime('%m', entrada.data) = :mes", { mes: String(mes).padStart(2, "0") });
    }
    if (ano && !isNaN(ano)) {
      qb.andWhere("strftime('%Y', entrada.data) = :ano", { ano: String(ano) });
    }
    if (maquininhaId && !isNaN(maquininhaId)) {
      qb.andWhere("entrada.maquininhaId = :maquininhaId", { maquininhaId });
    }

    const total = await qb.getCount();
    const entradas = await qb
      .orderBy("entrada.data", "DESC")
      .skip(skip)
      .take(limit)
      .getMany();

    return {
      total,
      items: entradas.map((e) => ({
        id: e.id,
        maquininha_id: e.maquininhaId,
        maquininha_nome: e.maquininha?.nome || "Manual",
        descricao: e.descricao,
        valor_bruto: Number(e.valorBruto),
        taxa_aplicada: Number(e.taxaAplicada),
        valor_taxa: Number(e.valorTaxa),
        valor_liquido: Number(e.valorLiquido),
        data: e.data,
        observacao: e.observacao,
        criado_em: e.criadoEm,
      })),
    };
  }

  async criar(empresaId: number, dados: any) {
    // taxaPercentual é armazenada como decimal: 0.03 = 3%
    let taxaDecimal = 0;
    const maquininhaId = dados.maquininha_id ?? null;

    if (maquininhaId) {
      const maquininha = await this.maquininhaRepo.findOne({
        where: { id: maquininhaId, empresaId },
      });
      if (maquininha) {
        taxaDecimal = Number(maquininha.taxaPercentual) || 0;
      }
    }

    // taxa já é decimal (0.03), não precisa dividir por 100
    const valorTaxa = Number((dados.valor_bruto * taxaDecimal).toFixed(2));
    const valorLiquido = Number((dados.valor_bruto - valorTaxa).toFixed(2));

    const entrada = this.entradaRepo.create({
      empresaId,
      maquininhaId: maquininhaId,
      descricao: dados.descricao || null,
      valorBruto: dados.valor_bruto,
      taxaAplicada: taxaDecimal,
      valorTaxa,
      valorLiquido,
      data: dados.data || new Date().toISOString().split("T")[0],
      observacao: dados.observacao || null,
    });

    await this.entradaRepo.save(entrada);

    return {
      id: entrada.id,
      maquininha_id: entrada.maquininhaId,
      descricao: entrada.descricao,
      valor_bruto: Number(entrada.valorBruto),
      taxa_aplicada: Number(entrada.taxaAplicada),
      valor_taxa: Number(entrada.valorTaxa),
      valor_liquido: Number(entrada.valorLiquido),
      data: entrada.data,
      observacao: entrada.observacao,
      criado_em: entrada.criadoEm,
    };
  }

  async atualizar(entradaId: number, empresaId: number, dados: any) {
    // IsNull() filtra corretamente registros onde deletadoEm é NULL
    const entrada = await this.entradaRepo.findOne({
      where: { id: entradaId, empresaId, deletadoEm: IsNull() },
    });

    if (!entrada) {
      throw new NotFoundError("Entrada");
    }

    let taxaDecimal = 0;
    const maquininhaIdNovo = dados.maquininha_id;
    const maquininhaIdFinal = maquininhaIdNovo !== undefined ? maquininhaIdNovo : entrada.maquininhaId;

    if (maquininhaIdFinal) {
      const maquininha = await this.maquininhaRepo.findOne({
        where: { id: maquininhaIdFinal, empresaId },
      });
      if (maquininha) {
        taxaDecimal = Number(maquininha.taxaPercentual) || 0;
      }
    }

    const valorBruto = dados.valor_bruto ?? entrada.valorBruto;
    // taxa já é decimal (0.03)
    const valorTaxa = Number((Number(valorBruto) * taxaDecimal).toFixed(2));
    const valorLiquido = Number((Number(valorBruto) - valorTaxa).toFixed(2));

    entrada.maquininhaId = (maquininhaIdNovo !== undefined ? maquininhaIdNovo : entrada.maquininhaId) ?? null;
    entrada.descricao = dados.descricao ?? entrada.descricao;
    entrada.valorBruto = valorBruto;
    entrada.taxaAplicada = taxaDecimal;
    entrada.valorTaxa = valorTaxa;
    entrada.valorLiquido = valorLiquido;
    entrada.data = dados.data || entrada.data;
    entrada.observacao = dados.observacao ?? entrada.observacao;

    await this.entradaRepo.save(entrada);

    return {
      id: entrada.id,
      maquininha_id: entrada.maquininhaId,
      descricao: entrada.descricao,
      valor_bruto: Number(entrada.valorBruto),
      taxa_aplicada: Number(entrada.taxaAplicada),
      valor_taxa: Number(entrada.valorTaxa),
      valor_liquido: Number(entrada.valorLiquido),
      data: entrada.data,
      observacao: entrada.observacao,
      criado_em: entrada.criadoEm,
    };
  }

  async deletar(entradaId: number, empresaId: number, usuarioId: number) {
    const entrada = await this.entradaRepo.findOne({
      where: { id: entradaId, empresaId, deletadoEm: IsNull() },
    });

    if (!entrada) {
      throw new NotFoundError("Entrada");
    }

    entrada.deletadoEm = new Date().toISOString();
    entrada.deletadoPorId = usuarioId;
    await this.entradaRepo.save(entrada);

    return { ok: true };
  }

  async listarMaquininhas(empresaId: number) {
    const maquininhas = await this.maquininhaRepo.find({
      where: { empresaId, ativa: true },
      order: { nome: "ASC" },
    });

    return maquininhas.map((m) => ({
      id: m.id,
      nome: m.nome,
      tipo: m.tipo,
      // taxaPercentual armazenada como decimal (0.03) → exibe como percentual (3.00%)
      taxa_percentual: Number((Number(m.taxaPercentual) * 100).toFixed(2)),
      ativa: m.ativa,
    }));
  }
}