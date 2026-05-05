import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("empresas")
export class Empresa {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 200 })
  nome!: string;

  @Column({ type: "varchar", length: 100, unique: true })
  slug!: string;

  @Column({ type: "boolean", default: true })
  ativa!: boolean;

  @CreateDateColumn({ name: "criado_em" })
  criadoEm!: Date;
}