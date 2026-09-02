import { Request, Response } from "express";
import { AppError } from "../errors/app-error";

export function notFoundHandler(
  req: Request,
  _res: Response,
): never {
  throw new AppError(
    `Route ${req.method} ${req.originalUrl} not found`,
    404,
    "ROUTE_NOT_FOUND",
  );
}