import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("usuarios")
export class Usuario {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 100 })
  nome!: string;

  @Column({ type: "varchar", length: 200, unique: true })
  email!: string;

  @Column({ name: "senha_hash", type: "varchar", length: 300, nullable: true })
  senhaHash!: string | null;

  @Column({ name: "email_verificado", type: "boolean", default: false })
  emailVerificado!: boolean;

  @Column({ name: "google_id", type: "varchar", length: 200, nullable: true })
  googleId!: string | null;

  @Column({ name: "avatar_url", type: "varchar", length: 500, nullable: true })
  avatarUrl!: string | null;

  @Column({ type: "boolean", default: true })
  ativo!: boolean;

  @CreateDateColumn({ name: "criado_em" })
  criadoEm!: Date;
}