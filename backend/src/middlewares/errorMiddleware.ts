import { Request, Response, NextFunction } from "express";
import { AppError } from "../shared/errors/AppError";

export function errorMiddleware(
  err: Error,
  request: Request,
  response: Response,
  next: NextFunction
) {
  if (err instanceof AppError) {
    return response.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  console.error(`[ERROR] ${request.method} ${request.url} - User: ${request.usuario?.usuario_id || 'Anon'}`);
  console.error(`  - Message: ${err.message}`);
  if (err.stack) console.error(`  - Stack: ${err.stack.split('\n')[1]}`); // Loga apenas a primeira linha da stack para não poluir
  if (request.body && Object.keys(request.body).length > 0) {
    console.error(`  - Body: ${JSON.stringify(request.body)}`);
  }

  return response.status(500).json({
    success: false,
    message: "Erro interno do servidor (Monitorado)",
  });
}

/**
 * asyncHandler — envolve handlers async e propaga erros para o errorMiddleware.
 *
 * Sem isso, erros em funções async não chegam ao errorMiddleware do Express,
 * causando travamentos silenciosos (unhandled promise rejection).
 *
 * Uso:
 *   router.get("/", asyncHandler(async (req, res) => { ... }))
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}