import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Nota } from "./Nota";

@Entity("itens_nota")
export class ItemNota {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "nota_id", type: "int" })
  notaId!: number;

  @Column({ type: "varchar", length: 200 })
  produto!: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  codigo!: string | null;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 1 })
  quantidade!: number;

  @Column({ type: "varchar", length: 20, default: "un" })
  unidade!: string;

  @Column({ name: "valor_unitario", type: "decimal", precision: 10, scale: 2 })
  valorUnitario!: number;

  @Column({ name: "valor_total", type: "decimal", precision: 10, scale: 2 })
  valorTotal!: number;

  @CreateDateColumn({ name: "criado_em" })
  criadoEm!: Date;

  @ManyToOne(() => Nota)
  @JoinColumn({ name: "nota_id" })
  nota!: Nota;
}