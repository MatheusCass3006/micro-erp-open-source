import { AppDataSource } from "../../../database";
import { Entrada } from "../../../database/entities/Entrada";
import { Maquininha } from "../../../database/entities/Maquininha";
import { NotFoundError } from "../../../shared/errors/AppError";

export class EntradaService {
  private entradaRepo = AppDataSource.getRepository(Entrada);
  private maquiniinhaRepo = AppDataSource.getRepository(Maquininha);

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

    if (mes) {
      qb.andWhere("MONTH(entrada.data) = :mes", { mes });
    }
    if (ano) {
      qb.andWhere("YEAR(entrada.data) = :ano", { ano });
    }
    if (maquininhaId) {
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
    let taxaPercentual = 0;
    const entradaMaquininhaId = dados.maquininha_id || dados.maqinha_id;

    if (entradaMaquininhaId) {
      const maquiniinha = await this.maquiniinhaRepo.findOne({
        where: { id: entradaMaquininhaId, empresaId },
      });
      if (maquiniinha) {
        taxaPercentual = Number(maquiniinha.taxaPercentual) || 0;
      }
    }

    const taxa = taxaPercentual;
    const valorTaxa = Number((dados.valor_bruto * taxa).toFixed(2));
    const valorLiquido = Number((dados.valor_bruto - valorTaxa).toFixed(2));

    const entrada = this.entradaRepo.create({
      empresaId,
      maquininhaId: entradaMaquininhaId || null,
      descricao: dados.descricao || null,
      valorBruto: dados.valor_bruto,
      taxaAplicada: taxa,
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
    const entrada = await this.entradaRepo.findOne({
      where: { id: entradaId, empresaId, deletadoEm: undefined as any },
    });

    if (!entrada) {
      throw new NotFoundError("Entrada");
    }

    let taxaPercentual = 0;
    const entradaMaquininhaId = dados.maquininha_id || dados.maqinha_id;
    const maquinhinhaIdFinal = entradaMaquininhaId !== undefined ? entradaMaquininhaId : entrada.maquininhaId;

    if (maquinhinhaIdFinal) {
      const maquiniinha = await this.maquiniinhaRepo.findOne({
        where: { id: maquinhinhaIdFinal, empresaId },
      });
      if (maquiniinha) {
        taxaPercentual = Number(maquiniinha.taxaPercentual) || 0;
      }
    }

    const valorBruto = dados.valor_bruto ?? entrada.valorBruto;
    const taxa = taxaPercentual;
    const valorTaxa = Number((Number(valorBruto) * taxa).toFixed(2));
    const valorLiquido = Number((Number(valorBruto) - valorTaxa).toFixed(2));

    entrada.maquininhaId = (entradaMaquininhaId !== undefined ? entradaMaquininhaId : entrada.maquininhaId) ?? null;
    entrada.descricao = dados.descricao ?? entrada.descricao;
    entrada.valorBruto = valorBruto;
    entrada.taxaAplicada = taxa;
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
      where: { id: entradaId, empresaId, deletadoEm: undefined as any },
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
    const maquihinhas = await this.maquiniinhaRepo.find({
      where: { empresaId, ativa: true },
      order: { nome: "ASC" },
    });

    return maquihinhas.map((m) => ({
      id: m.id,
      nome: m.nome,
      tipo: m.tipo,
      taxa_percentual: Number(m.taxaPercentual) * 100,
      ativa: m.ativa,
    }));
  }
}