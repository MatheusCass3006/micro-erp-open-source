import { AppDataSource } from "../../../database";
import { Nota } from "../../../database/entities/Nota";
import { ItemNota } from "../../../database/entities/ItemNota";
import { NotFoundError } from "../../../shared/errors/AppError";

export class NotaService {
  private notaRepo = AppDataSource.getRepository(Nota);
  private itemRepo = AppDataSource.getRepository(ItemNota);

  async listar(
    empresaId: number,
    skip: number = 0,
    limit: number = 200
  ) {
    const qb = this.notaRepo
      .createQueryBuilder("nota")
      .where("nota.empresaId = :empresaId", { empresaId });

    const total = await qb.getCount();
    const notas = await qb
      .orderBy("nota.dataEntrada", "DESC")
      .skip(skip)
      .take(limit)
      .getMany();

    return {
      total,
      items: notas.map((n) => ({
        id: n.id,
        numero_nota: n.numeroNota,
        empresa_nome: n.empresaNome,
        cnpj: n.cnpj,
        data_emissao: n.dataEmissao,
        data_entrada: n.dataEntrada,
        valor_total: Number(n.valorTotal),
        observacao: n.observacao,
        criado_em: n.criadoEm,
      })),
    };
  }

  async criar(empresaId: number, dados: any) {
    const nota = this.notaRepo.create({
      empresaId,
      numeroNota: dados.numero_nota || null,
      empresaNome: dados.empresa_nome,
      cnpj: dados.cnpj || null,
      dataEmissao: dados.data_emissao || null,
      dataEntrada: dados.data_entrada || new Date().toISOString().split("T")[0],
      observacao: dados.observacao || null,
      valorTotal: 0,
      atualizadoEm: new Date().toISOString(),
    });

    await this.notaRepo.save(nota);

    let valorTotal = 0;
    if (dados.itens && dados.itens.length > 0) {
      for (const item of dados.itens) {
        const valorTotalItem = Number(item.quantidade) * Number(item.valor_unitario);
        valorTotal += valorTotalItem;

        const itemNota = this.itemRepo.create({
          notaId: nota.id,
          produto: item.produto,
          codigo: item.codigo || null,
          quantidade: item.quantidade || 1,
          unidade: item.unidade || "un",
          valorUnitario: item.valor_unitario,
          valorTotal: valorTotalItem,
        });
        await this.itemRepo.save(itemNota);
      }

      nota.valorTotal = valorTotal;
      await this.notaRepo.save(nota);
    }

    return {
      id: nota.id,
      numero_nota: nota.numeroNota,
      empresa_nome: nota.empresaNome,
      cnpj: nota.cnpj,
      data_emissao: nota.dataEmissao,
      data_entrada: nota.dataEntrada,
      valor_total: Number(nota.valorTotal),
      observacao: nota.observacao,
      criado_em: nota.criadoEm,
    };
  }

  async atualizar(notaId: number, empresaId: number, dados: any) {
    const nota = await this.notaRepo.findOne({
      where: { id: notaId, empresaId },
    });

    if (!nota) {
      throw new NotFoundError("Nota");
    }

    if (dados.numero_nota !== undefined) nota.numeroNota = dados.numero_nota;
    if (dados.empresa_nome) nota.empresaNome = dados.empresa_nome;
    if (dados.cnpj !== undefined) nota.cnpj = dados.cnpj;
    if (dados.data_emissao !== undefined) nota.dataEmissao = dados.data_emissao;
    if (dados.data_entrada) nota.dataEntrada = dados.data_entrada;
    if (dados.observacao !== undefined) nota.observacao = dados.observacao;

    nota.atualizadoEm = new Date().toISOString();
    await this.notaRepo.save(nota);

    return {
      id: nota.id,
      numero_nota: nota.numeroNota,
      empresa_nome: nota.empresaNome,
      cnpj: nota.cnpj,
      data_emissao: nota.dataEmissao,
      data_entrada: nota.dataEntrada,
      valor_total: Number(nota.valorTotal),
      observacao: nota.observacao,
      criado_em: nota.criadoEm,
    };
  }

  async deletar(notaId: number, empresaId: number) {
    const nota = await this.notaRepo.findOne({
      where: { id: notaId, empresaId },
    });

    if (!nota) {
      throw new NotFoundError("Nota");
    }

    await this.itemRepo.delete({ notaId });
    await this.notaRepo.delete({ id: notaId });

    return { ok: true };
  }

  async buscarItens(notaId: number, empresaId: number) {
    const nota = await this.notaRepo.findOne({
      where: { id: notaId, empresaId },
    });

    if (!nota) {
      throw new NotFoundError("Nota");
    }

    const itens = await this.itemRepo.find({
      where: { notaId },
      order: { id: "ASC" },
    });

    return itens.map((item) => ({
      id: item.id,
      produto: item.produto,
      codigo: item.codigo,
      quantidade: Number(item.quantidade),
      unidade: item.unidade,
      valor_unitario: Number(item.valorUnitario),
      valor_total: Number(item.valorTotal),
    }));
  }

  async resumoMensal(empresaId: number, mes?: number, ano?: number) {
    const hoje = new Date();
    mes = mes || hoje.getMonth() + 1;
    ano = ano || hoje.getFullYear();

    const resultado = await this.notaRepo
      .createQueryBuilder("nota")
      .select("SUM(nota.valorTotal)", "total")
      .addSelect("COUNT(nota.id)", "quantidade")
      .where("nota.empresaId = :empresaId", { empresaId })
      .andWhere("MONTH(nota.dataEntrada) = :mes", { mes })
      .andWhere("YEAR(nota.dataEntrada) = :ano", { ano })
      .getRawOne();

    return {
      total: Number(resultado?.total || 0),
      quantidade: parseInt(resultado?.quantidade || 0),
    };
  }
}