import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Empresa } from "./Empresa";

@Entity("maquininhas")
export class Maquininha {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "empresa_id", type: "int" })
  empresaId!: number;

  @Column({ type: "varchar", length: 100 })
  nome!: string;

  @Column({ type: "varchar", length: 50 })
  tipo!: string;

  @Column({ name: "taxa_percentual", type: "decimal", precision: 5, scale: 2, default: 0 })
  taxaPercentual!: number;

  @Column({ type: "boolean", default: true })
  ativa!: boolean;

  @CreateDateColumn({ name: "criado_em" })
  criadoEm!: Date;

  @ManyToOne(() => Empresa)
  @JoinColumn({ name: "empresa_id" })
  empresa!: Empresa;

  @Column({ name: "tenant_id", type: "varchar", length: 100, nullable: true })
  tenantId!: string;
}