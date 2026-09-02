import { Request, Response, NextFunction } from "express";

import { AppError } from "../errors/app-error";
import { verifyAccessToken } from "../utils/jwt";

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      throw new AppError(
        "Authentication required",
        401,
        "AUTHENTICATION_REQUIRED",
      );
    }

    const [scheme, token] = authorization.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw new AppError(
        "Invalid authorization header",
        401,
        "INVALID_AUTHORIZATION_HEADER",
      );
    }

    const payload = await verifyAccessToken(token);

    if (!payload.sub) {
      throw new AppError(
        "Invalid access token",
        401,
        "INVALID_ACCESS_TOKEN",
      );
    }

    req.auth = payload;

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }

    next(
      new AppError(
        "Invalid or expired access token",
        401,
        "INVALID_ACCESS_TOKEN",
      ),
    );
  }
}

export function requireSuperAdmin(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (!req.auth) {
    next(
      new AppError(
        "Authentication required",
        401,
        "AUTHENTICATION_REQUIRED",
      ),
    );
    return;
  }

  if (req.auth.role !== "SUPER_ADMIN") {
    next(
      new AppError(
        "Super Admin access required",
        403,
        "SUPER_ADMIN_ACCESS_REQUIRED",
      ),
    );
    return;
  }

  next();
}