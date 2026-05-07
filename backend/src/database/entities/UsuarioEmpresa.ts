import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("usuarios_empresas")
export class UsuarioEmpresa {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "usuario_id", type: "int" })
  usuarioId!: number;

  @Column({ name: "empresa_id", type: "int" })
  empresaId!: number;

  @Column({ type: "varchar", default: "operador" })
  role!: string;

  @Column({ type: "boolean", default: true })
  ativa!: boolean;

  @CreateDateColumn({ name: "criado_em" })
  criadoEm!: Date;
}