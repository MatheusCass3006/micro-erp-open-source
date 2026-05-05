import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Empresa } from "./Empresa";
import { CategoriaSaida } from "./CategoriaSaida";

@Entity("saidas")
export class Saida {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "empresa_id", type: "int" })
  empresaId!: number;

  @Column({ name: "categoria_id", type: "int", nullable: true })
  categoriaId!: number | null;

  @Column({ type: "varchar", length: 200, nullable: true })
  descricao!: string | null;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  valor!: number;

  @Column({ type: "varchar" })
  data!: string;

  @Column({ name: "forma_pagamento", type: "varchar", default: "pix" })
  formaPagamento!: string;

  @Column({ type: "text", nullable: true })
  observacao!: string | null;

  @CreateDateColumn({ name: "criado_em" })
  criadoEm!: Date;

  @Column({ name: "deletado_em", type: "varchar", nullable: true })
  deletadoEm!: string | null;

  @Column({ name: "deletado_por_id", type: "int", nullable: true })
  deletadoPorId!: number | null;

  @ManyToOne(() => Empresa)
  @JoinColumn({ name: "empresa_id" })
  empresa!: Empresa;

  @ManyToOne(() => CategoriaSaida, { nullable: true })
  @JoinColumn({ name: "categoria_id" })
  categoria!: CategoriaSaida;
}