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

  console.error("Erro não tratado:", err);

  return response.status(500).json({
    success: false,
    message: "Erro interno do servidor",
  });
}