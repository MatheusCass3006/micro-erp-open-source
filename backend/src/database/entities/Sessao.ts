import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("sessoes")
export class Sessao {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 100, unique: true })
  token!: string;

  @Column({ name: "usuario_id", type: "int" })
  usuarioId!: number;

  @Column({ name: "empresa_id", type: "int", nullable: true })
  empresaId!: number | null;

  @Column({ name: "expires_em", type: "timestamp" })
  expiresEm!: Date;

  @CreateDateColumn({ name: "criado_em" })
  criadoEm!: Date;
}