import { AppDataSource } from "../../../database";
import { Entrada } from "../../../database/entities/Entrada";
import { Saida } from "../../../database/entities/Saida";
import { Boleto } from "../../../database/entities/Boleto";
import { Nota } from "../../../database/entities/Nota";
import { Between, MoreThanOrEqual, LessThanOrEqual } from "typeorm";

export class DashboardService {
  async resumoGeral(empresaId: number, mes?: number, ano?: number) {
    const hoje = new Date();
    mes = mes || hoje.getMonth() + 1;
    ano = ano || hoje.getFullYear();

    const primeiroDia = new Date(ano, mes - 1, 1);
    const ultimoDia = new Date(ano, mes, 0);

    const entradas = await AppDataSource.getRepository(Entrada)
      .createQueryBuilder("entrada")
      .select("SUM(entrada.valorBruto)", "total_bruto")
      .addSelect("SUM(entrada.valorLiquido)", "total_liquido")
      .where("entrada.empresaId = :empresaId", { empresaId })
      .andWhere("entrada.deletadoEm IS NULL")
      .andWhere("entrada.data BETWEEN :inicio AND :fim", { inicio: primeiroDia, fim: ultimoDia })
      .getRawOne();

    const saidas = await AppDataSource.getRepository(Saida)
      .createQueryBuilder("saida")
      .select("SUM(saida.valor)", "total")
      .where("saida.empresaId = :empresaId", { empresaId })
      .andWhere("saida.deletadoEm IS NULL")
      .andWhere("saida.data BETWEEN :inicio AND :fim", { inicio: primeiroDia, fim: ultimoDia })
      .getRawOne();

    const boletosPendentes = await AppDataSource.getRepository(Boleto)
      .createQueryBuilder("boleto")
      .select("SUM(boleto.valor)", "total")
      .addSelect("COUNT(boleto.id)", "quantidade")
      .where("boleto.empresaId = :empresaId", { empresaId })
      .andWhere("boleto.deletadoEm IS NULL")
      .andWhere("boleto.status IN (:...status)", { status: ["pendente", "atrasado"] })
      .getRawOne();

    const notas = await AppDataSource.getRepository(Nota)
      .createQueryBuilder("nota")
      .select("SUM(nota.valorTotal)", "total")
      .addSelect("COUNT(nota.id)", "quantidade")
      .where("nota.empresaId = :empresaId", { empresaId })
      .andWhere("nota.dataEntrada BETWEEN :inicio AND :fim", { inicio: primeiroDia, fim: ultimoDia })
      .getRawOne();

    const entradasBruto = Number(entradas?.total_bruto || 0);
    const entradasLiquido = Number(entradas?.total_liquido || 0);
    const saidasTotal = Number(saidas?.total || 0);
    const saldo = entradasLiquido - saidasTotal;

    return {
      entradas: {
        bruto: Number(entradasBruto.toFixed(2)),
        liquido: Number(entradasLiquido.toFixed(2)),
        taxa_total: Number((entradasBruto - entradasLiquido).toFixed(2)),
      },
      saidas: {
        total: Number(saidasTotal.toFixed(2)),
      },
      saldo: {
        valor: Number(saldo.toFixed(2)),
        positivo: saldo >= 0,
      },
      boletos: {
        pendentes: Number(boletosPendentes?.quantidade || 0),
        valor_pendente: Number(boletosPendentes?.total || 0),
      },
      notas: {
        quantidade: parseInt(notas?.quantidade || 0),
        valor_total: Number(notas?.total || 0),
      },
    };
  }

  async evolucaoMensal(empresaId: number, meses: number = 6) {
    const resultado = [];
    const hoje = new Date();

    for (let i = meses - 1; i >= 0; i--) {
      const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const mes = data.getMonth() + 1;
      const ano = data.getFullYear();
      const ultimoDia = new Date(ano, mes, 0);

      const entradas = await AppDataSource.getRepository(Entrada)
        .createQueryBuilder("entrada")
        .select("SUM(entrada.valorLiquido)", "total")
        .where("entrada.empresaId = :empresaId", { empresaId })
        .andWhere("entrada.deletadoEm IS NULL")
        .andWhere("entrada.data BETWEEN :inicio AND :fim", { inicio: data, fim: ultimoDia })
        .getRawOne();

      const saidas = await AppDataSource.getRepository(Saida)
        .createQueryBuilder("saida")
        .select("SUM(saida.valor)", "total")
        .where("saida.empresaId = :empresaId", { empresaId })
        .andWhere("saida.deletadoEm IS NULL")
        .andWhere("saida.data BETWEEN :inicio AND :fim", { inicio: data, fim: ultimoDia })
        .getRawOne();

      resultado.push({
        mes,
        ano,
        mes_nome: data.toLocaleDateString("pt-BR", { month: "short" }),
        entradas: Number(entradas?.total || 0),
        saidas: Number(saidas?.total || 0),
        saldo: Number((Number(entradas?.total || 0) - Number(saidas?.total || 0)).toFixed(2)),
      });
    }

    return resultado;
  }

  async topDespesas(empresaId: number, mes?: number, ano?: number, limite: number = 5) {
    const hoje = new Date();
    mes = mes || hoje.getMonth() + 1;
    ano = ano || hoje.getFullYear();
    const primeiroDia = new Date(ano, mes - 1, 1);
    const ultimoDia = new Date(ano, mes, 0);

    const resultado = await AppDataSource.getRepository(Saida)
      .createQueryBuilder("saida")
      .leftJoinAndSelect("saida.categoria", "categoria")
      .select("categoria.nome", "categoria")
      .addSelect("categoria.secao", "secao")
      .addSelect("SUM(saida.valor)", "total")
      .where("saida.empresaId = :empresaId", { empresaId })
      .andWhere("saida.deletadoEm IS NULL")
      .andWhere("saida.data BETWEEN :inicio AND :fim", { inicio: primeiroDia, fim: ultimoDia })
      .groupBy("categoria.id")
      .orderBy("total", "DESC")
      .limit(limite)
      .getRawMany();

    return resultado.map((r) => ({
      categoria: r.categoria || "Sem categoria",
      secao: r.secao || "empresa",
      total: Number(r.total || 0),
    }));
  }
}