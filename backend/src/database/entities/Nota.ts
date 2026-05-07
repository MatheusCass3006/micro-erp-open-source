import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Empresa } from "./Empresa";

@Entity("notas")
export class Nota {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "empresa_id", type: "int" })
  empresaId!: number;

  @Column({ name: "numero_nota", type: "varchar", length: 50, nullable: true })
  numeroNota!: string | null;

  @Column({ name: "empresa_nome", type: "varchar", length: 200 })
  empresaNome!: string;

  @Column({ type: "varchar", length: 20, nullable: true })
  cnpj!: string | null;

  @Column({ name: "data_emissao", type: "varchar", nullable: true })
  dataEmissao!: string | null;

  @Column({ name: "data_entrada", type: "varchar" })
  dataEntrada!: string;

  @Column({ name: "valor_total", type: "decimal", precision: 10, scale: 2, default: 0 })
  valorTotal!: number;

  @Column({ type: "text", nullable: true })
  observacao!: string | null;

  @CreateDateColumn({ name: "criado_em" })
  criadoEm!: Date;

  @Column({ name: "atualizado_em", type: "varchar" })
  atualizadoEm!: string;

  @ManyToOne(() => Empresa)
  @JoinColumn({ name: "empresa_id" })
  empresa!: Empresa;

  @Column({ name: "tenant_id", type: "varchar", length: 100, nullable: true })
  tenantId!: string;
}