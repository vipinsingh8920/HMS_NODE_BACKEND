import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "./app-error";
import { logger } from "../../config/logger";

export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.flatten().fieldErrors,
    });
    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      code: error.code,
    });
    return;
  }

  logger.error(
    {
      error,
      method: req.method,
      path: req.originalUrl,
    },
    "Unhandled application error",
  );

  res.status(500).json({
    success: false,
    message: "Internal server error",
    code: "INTERNAL_SERVER_ERROR",
  });
}