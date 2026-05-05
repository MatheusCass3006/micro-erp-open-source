import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("feedbacks")
export class Feedback {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", default: "geral" })
  tipo!: string;

  @Column({ type: "int", nullable: true })
  nota!: number | null;

  @Column({ type: "text" })
  mensagem!: string;

  @Column({ type: "varchar", length: 120, nullable: true })
  email!: string | null;

  @Column({ type: "varchar", length: 80, nullable: true })
  nome!: string | null;

  @Column({ type: "varchar", length: 20, nullable: true })
  versao!: string | null;

  @Column({ type: "varchar", length: 80, nullable: true })
  telaAtual!: string | null;

  @Column({ type: "varchar", length: 45, nullable: true })
  ip!: string | null;

  @Column({ name: "empresa_id", type: "int", nullable: true })
  empresaId!: number | null;

  @Column({ type: "boolean", default: false })
  lido!: boolean;

  @Column({ type: "text", nullable: true })
  resposta!: string | null;

  @CreateDateColumn({ name: "criado_em" })
  criadoEm!: Date;
}