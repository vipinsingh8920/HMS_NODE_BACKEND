import { Request, Response, NextFunction } from "express";
import { z } from "zod";

export function validateBody<T extends z.ZodType>(schema: T) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      next(result.error);
      return;
    }

    req.body = result.data;
    next();
  };
}

export function validateParams<T extends z.ZodType>(
  schema: T,
) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      next(result.error);
      return;
    }

    // Validation succeeded.
    // Keep Express's params object intact.
    next();
  };
}

export function validateQuery<T extends z.ZodType>(
  schema: T,
) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      next(result.error);
      return;
    }

    // Validation succeeded.
    // Keep Express's query object intact.
    next();
  };
}