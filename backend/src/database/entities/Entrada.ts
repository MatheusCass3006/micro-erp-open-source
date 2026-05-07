import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Empresa } from "./Empresa";
import { Maquininha } from "./Maquininha";

@Entity("entradas")
export class Entrada {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "empresa_id", type: "int" })
  empresaId!: number;

  @Column({ name: "maquininha_id", type: "int", nullable: true })
  maquininhaId!: number | null;

  @Column({ type: "varchar", length: 200, nullable: true })
  descricao!: string | null;

  @Column({ name: "valor_bruto", type: "decimal", precision: 10, scale: 2 })
  valorBruto!: number;

  @Column({ name: "taxa_aplicada", type: "decimal", precision: 5, scale: 2, default: 0 })
  taxaAplicada!: number;

  @Column({ name: "valor_taxa", type: "decimal", precision: 10, scale: 2, default: 0 })
  valorTaxa!: number;

  @Column({ name: "valor_liquido", type: "decimal", precision: 10, scale: 2 })
  valorLiquido!: number;

  @Column({ type: "varchar" })
  data!: string;

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

  @ManyToOne(() => Maquininha, { nullable: true })
  @JoinColumn({ name: "maquininha_id" })
  maquininha!: Maquininha;

  @Column({ name: "tenant_id", type: "varchar", length: 100, nullable: true })
  tenantId!: string;
}