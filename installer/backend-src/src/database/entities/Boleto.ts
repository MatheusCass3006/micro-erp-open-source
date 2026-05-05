import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Empresa } from "./Empresa";

@Entity("boletos")
export class Boleto {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "empresa_id", type: "int" })
  empresaId!: number;

  @Column({ type: "varchar", length: 200 })
  descricao!: string;

  @Column({ type: "varchar", length: 200, nullable: true })
  beneficiario!: string | null;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  valor!: number;

  @Column({ type: "varchar" })
  vencimento!: string;

  @Column({ type: "varchar", default: "pendente" })
  status!: string;

  @Column({ name: "linha_digitavel", type: "varchar", length: 100, nullable: true })
  linhaDigitavel!: string | null;

  @Column({ name: "codigo_barras", type: "varchar", length: 60, nullable: true })
  codigoBarras!: string | null;

  @Column({ name: "arquivo_nome", type: "varchar", length: 200, nullable: true })
  arquivoNome!: string | null;

  @Column({ type: "text", nullable: true })
  observacao!: string | null;

  @Column({ name: "data_pagamento", type: "varchar", nullable: true })
  dataPagamento!: string | null;

  @CreateDateColumn({ name: "criado_em" })
  criadoEm!: Date;

  @Column({ name: "atualizado_em", type: "varchar" })
  atualizadoEm!: string;

  @Column({ name: "deletado_em", type: "varchar", nullable: true })
  deletadoEm!: string | null;

  @Column({ name: "deletado_por_id", type: "int", nullable: true })
  deletadoPorId!: number | null;

  @ManyToOne(() => Empresa)
  @JoinColumn({ name: "empresa_id" })
  empresa!: Empresa;
}