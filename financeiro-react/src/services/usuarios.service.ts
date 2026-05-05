// ============================================================
// SERVIÇO: Usuários da empresa (admin only)
// GET    /api/usuarios       → listar
// POST   /api/usuarios       → criar
// DELETE /api/usuarios/:id   → desativar
// ============================================================

import { api } from './api';

export interface Usuario {
  id:       number;
  nome:     string;
  email:    string;
  role:     'admin' | 'operador';
  ativo:    boolean;
  criado_em?: string;
}

export interface CriarUsuarioPayload {
  nome:  string;
  email: string;
  senha: string;
  role:  'admin' | 'operador';
}

export async function getUsuarios(): Promise<Usuario[]> {
  return api.get<Usuario[]>('/api/usuarios');
}

export async function createUsuario(dados: CriarUsuarioPayload): Promise<Usuario> {
  return api.post<Usuario>('/api/usuarios', dados);
}

export async function deleteUsuario(id: number): Promise<void> {
  return api.delete(`/api/usuarios/${id}`);
}
