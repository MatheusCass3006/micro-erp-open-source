import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Empresa } from "./Empresa";

@Entity("configuracoes")
export class Configuracao {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "empresa_id", type: "int" })
  empresaId!: number;

  @Column({ type: "varchar", length: 100 })
  chave!: string;

  @Column({ type: "text", nullable: true })
  valor!: string | null;

  @Column({ type: "varchar", length: 200, nullable: true })
  descricao!: string | null;

  @Column({ name: "atualizado_em", type: "varchar" })
  atualizadoEm!: string;

  @ManyToOne(() => Empresa)
  @JoinColumn({ name: "empresa_id" })
  empresa!: Empresa;
}