import { AppDataSource } from "../../../database";
import { Saida } from "../../../database/entities/Saida";
import { CategoriaSaida } from "../../../database/entities/CategoriaSaida";
import { AppError, NotFoundError } from "../../../shared/errors/AppError";

export class SaidaService {
  private saidaRepo = AppDataSource.getRepository(Saida);
  private categoriaRepo = AppDataSource.getRepository(CategoriaSaida);

  async listar(
    empresaId: number,
    mes?: number,
    ano?: number,
    secao?: string,
    categoriaId?: number,
    skip: number = 0,
    limit: number = 500
  ) {
    const qb = this.saidaRepo
      .createQueryBuilder("saida")
      .leftJoinAndSelect("saida.categoria", "categoria")
      .where("saida.empresaId = :empresaId", { empresaId })
      .andWhere("saida.deletadoEm IS NULL");

    if (mes) {
      qb.andWhere("MONTH(saida.data) = :mes", { mes });
    }
    if (ano) {
      qb.andWhere("YEAR(saida.data) = :ano", { ano });
    }
    if (secao) {
      qb.andWhere("categoria.secao = :secao", { secao });
    }
    if (categoriaId) {
      qb.andWhere("saida.categoriaId = :categoriaId", { categoriaId });
    }

    const total = await qb.getCount();
    const saidas = await qb
      .orderBy("saida.data", "DESC")
      .skip(skip)
      .take(limit)
      .getMany();

    return {
      total,
      items: saidas.map((s) => ({
        id: s.id,
        categoria_id: s.categoriaId,
        categoria_nome: s.categoria?.nome || null,
        categoria_secao: s.categoria?.secao || null,
        descricao: s.descricao,
        valor: Number(s.valor),
        data: s.data,
        forma_pagamento: s.formaPagamento,
        observacao: s.observacao,
        criado_em: s.criadoEm,
      })),
    };
  }

  async criar(empresaId: number, dados: any) {
    if (dados.categoria_id) {
      const categoria = await this.categoriaRepo.findOne({
        where: { id: dados.categoria_id, empresaId },
      });
      if (!categoria) {
        throw new AppError("Categoria não encontrada", 400);
      }
    }

    const saida = this.saidaRepo.create({
      empresaId,
      categoriaId: dados.categoria_id || null,
      descricao: dados.descricao || null,
      valor: dados.valor,
      data: dados.data || new Date().toISOString().split("T")[0],
      formaPagamento: dados.forma_pagamento || "pix",
      observacao: dados.observacao || null,
    });

    await this.saidaRepo.save(saida);

    return {
      id: saida.id,
      categoria_id: saida.categoriaId,
      descricao: saida.descricao,
      valor: Number(saida.valor),
      data: saida.data,
      forma_pagamento: saida.formaPagamento,
      observacao: saida.observacao,
      criado_em: saida.criadoEm,
    };
  }

  async atualizar(saidaId: number, empresaId: number, dados: any) {
    const saida = await this.saidaRepo.findOne({
      where: { id: saidaId, empresaId, deletadoEm: undefined as any },
    });

    if (!saida) {
      throw new NotFoundError("Saída");
    }

    saida.categoriaId = dados.categoria_id ?? saida.categoriaId;
    saida.descricao = dados.descricao ?? saida.descricao;
    saida.valor = dados.valor ?? saida.valor;
    saida.data = dados.data || saida.data;
    saida.formaPagamento = dados.forma_pagamento ?? saida.formaPagamento;
    saida.observacao = dados.observacao ?? saida.observacao;

    await this.saidaRepo.save(saida);

    return {
      id: saida.id,
      categoria_id: saida.categoriaId,
      descricao: saida.descricao,
      valor: Number(saida.valor),
      data: saida.data,
      forma_pagamento: saida.formaPagamento,
      observacao: saida.observacao,
      criado_em: saida.criadoEm,
    };
  }

  async deletar(saidaId: number, empresaId: number, usuarioId: number) {
    const saida = await this.saidaRepo.findOne({
      where: { id: saidaId, empresaId, deletadoEm: undefined as any },
    });

    if (!saida) {
      throw new NotFoundError("Saída");
    }

    saida.deletadoEm = new Date().toISOString();
    saida.deletadoPorId = usuarioId;
    await this.saidaRepo.save(saida);

    return { ok: true };
  }

  async listarCategorias(empresaId: number, secao?: string) {
    const qb = this.categoriaRepo.createQueryBuilder("categoria")
      .where("categoria.empresaId = :empresaId", { empresaId })
      .andWhere("categoria.ativa = true");

    if (secao) {
      if (secao === "empresa") {
        qb.andWhere("categoria.secao IN (:...secoes)", { secoes: ["empresa", "acougue", "espetinhos"] });
      } else {
        qb.andWhere("categoria.secao = :secao", { secao });
      }
    }

    const categorias = await qb.orderBy("categoria.secao, categoria.nome", "ASC").getMany();

    return categorias.map((c) => ({
      id: c.id,
      nome: c.nome,
      secao: c.secao,
      ativa: c.ativa,
    }));
  }

  async criarCategoria(empresaId: number, dados: { nome: string; secao: string }) {
    const categoria = this.categoriaRepo.create({
      empresaId,
      nome: dados.nome.trim(),
      secao: dados.secao,
    });

    await this.categoriaRepo.save(categoria);

    return {
      id: categoria.id,
      nome: categoria.nome,
      secao: categoria.secao,
    };
  }

  async atualizarCategoria(categoriaId: number, empresaId: number, dados: any) {
    const categoria = await this.categoriaRepo.findOne({
      where: { id: categoriaId, empresaId },
    });

    if (!categoria) {
      throw new NotFoundError("Categoria");
    }

    if (dados.nome) categoria.nome = dados.nome.trim();
    if (dados.ativa !== undefined) categoria.ativa = dados.ativa;

    await this.categoriaRepo.save(categoria);

    return {
      id: categoria.id,
      nome: categoria.nome,
      secao: categoria.secao,
      ativa: categoria.ativa,
    };
  }

  async deletarCategoria(categoriaId: number, empresaId: number) {
    const categoria = await this.categoriaRepo.findOne({
      where: { id: categoriaId, empresaId },
    });

    if (!categoria) {
      throw new NotFoundError("Categoria");
    }

    categoria.ativa = false;
    await this.categoriaRepo.save(categoria);

    return { ok: true };
  }

  async resumoMensal(empresaId: number, mes?: number, ano?: number) {
    const hoje = new Date();
    mes = mes || hoje.getMonth() + 1;
    ano = ano || hoje.getFullYear();

    const resultado = await this.saidaRepo
      .createQueryBuilder("saida")
      .leftJoin("saida.categoria", "categoria")
      .select("categoria.secao", "secao")
      .addSelect("SUM(saida.valor)", "total")
      .where("saida.empresaId = :empresaId", { empresaId })
      .andWhere("saida.deletadoEm IS NULL")
      .andWhere("MONTH(saida.data) = :mes", { mes })
      .andWhere("YEAR(saida.data) = :ano", { ano })
      .groupBy("categoria.secao")
      .getRawMany();

    const resum = { empresa: 0, pessoal: 0 };
    for (const r of resultado) {
      let chave = r.secao || "empresa";
      if (chave === "acougue" || chave === "espetinhos") chave = "empresa";
      if (resum.hasOwnProperty(chave)) {
        resum[chave as keyof typeof resum] += Number(r.total) || 0;
      }
    }

    return {
      empresa: Number(resum.empresa.toFixed(2)),
      pessoal: Number(resum.pessoal.toFixed(2)),
      total: Number((resum.empresa + resum.pessoal).toFixed(2)),
    };
  }
}