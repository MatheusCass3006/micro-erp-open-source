import { Request, Response, NextFunction } from "express";
import { tenantLocalStorage } from "../shared/tenant/TenantContext";

export const tenantMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Em um SaaS real, o tenantId costuma vir do subdomínio (ex: empresa1.microerp.com)
  // ou do payload do JWT de um usuário logado.
  // Aqui estamos aceitando do Header ou do usuário autenticado (req.user).
  
  let tenantId = req.headers["x-tenant-id"] as string;

  if (!tenantId && (req as any).user) {
    tenantId = (req as any).user.empresaId || (req as any).user.tenantId; // Depende do payload
  }

  // Se existir um tenant, encapsulamos o resto da requisição no contexto
  if (tenantId) {
    tenantLocalStorage.run(tenantId, () => {
      next();
    });
  } else {
    // Sem tenant (talvez rota pública)
    tenantLocalStorage.run("PUBLIC", () => {
      next();
    });
  }
};
