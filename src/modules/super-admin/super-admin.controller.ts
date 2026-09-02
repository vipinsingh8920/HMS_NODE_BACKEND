import {
  Request,
  Response,
  NextFunction,
} from "express";

import { successResponse } from "../../common/responses/api-response";
import { AppError } from "../../common/errors/app-error";

import {
  registerSuperAdmin,
  loginSuperAdmin,
  getSuperAdminProfile,
  changeSuperAdminPassword,
  forgotSuperAdminPassword,
  resetSuperAdminPassword,
  updateSuperAdminProfile,
  updateSuperAdminStatusService,
} from "./super-admin.service";

function getAuthenticatedAdminId(req: Request): number {
  if (!req.auth?.sub) {
    throw new AppError(
      "Authentication required",
      401,
      "AUTHENTICATION_REQUIRED",
    );
  }

  const adminId = Number(req.auth.sub);

  if (!Number.isSafeInteger(adminId) || adminId <= 0) {
    throw new AppError(
      "Invalid access token",
      401,
      "INVALID_ACCESS_TOKEN",
    );
  }

  return adminId;
}

export async function registerSuperAdminController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const superAdmin = await registerSuperAdmin(req.body);

    res.status(201).json(
      successResponse(
        "Super Admin registered successfully",
        superAdmin,
      ),
    );
  } catch (error) {
    next(error);
  }
}

export async function loginSuperAdminController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await loginSuperAdmin(req.body);

    res.status(200).json(
      successResponse(
        "Super Admin login successful",
        result,
      ),
    );
  } catch (error) {
    next(error);
  }
}

export async function getSuperAdminProfileController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const adminId = getAuthenticatedAdminId(req);

    const admin = await getSuperAdminProfile(adminId);

    res.status(200).json(
      successResponse(
        "Super Admin profile fetched successfully",
        admin,
      ),
    );
  } catch (error) {
    next(error);
  }
}

export async function changeSuperAdminPasswordController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const adminId = getAuthenticatedAdminId(req);

    await changeSuperAdminPassword(
      adminId,
      req.body.currentPassword,
      req.body.newPassword,
    );

    res.status(200).json(
      successResponse(
        "Password changed successfully",
        null,
      ),
    );
  } catch (error) {
    next(error);
  }
}

export async function forgotSuperAdminPasswordController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await forgotSuperAdminPassword(
      req.body.email,
    );

    res.status(200).json({
      success: true,
      message:
        "If an account exists with this email, a password reset link has been sent",
      ...(result.resetToken
        ? {
            data: {
              resetToken: result.resetToken,
            },
          }
        : {}),
    });
  } catch (error) {
    next(error);
  }
}

export async function resetSuperAdminPasswordController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await resetSuperAdminPassword(
      req.body.token,
      req.body.newPassword,
    );

    res.status(200).json(
      successResponse(
        "Password reset successfully",
        null,
      ),
    );
  } catch (error) {
    next(error);
  }
}

export async function updateSuperAdminController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const adminId = getAuthenticatedAdminId(req);

    const admin = await updateSuperAdminProfile(
      adminId,
      req.body,
    );

    res.status(200).json(
      successResponse(
        "Super Admin profile updated successfully",
        admin,
      ),
    );
  } catch (error) {
    next(error);
  }
}

export async function updateSuperAdminStatusController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const requestingAdminId =
      getAuthenticatedAdminId(req);

    const targetAdminId = Number(req.params.id);

    if (
      !Number.isSafeInteger(targetAdminId) ||
      targetAdminId <= 0
    ) {
      throw new AppError(
        "Invalid Super Admin ID",
        400,
        "INVALID_SUPER_ADMIN_ID",
      );
    }

    const admin =
      await updateSuperAdminStatusService(
        targetAdminId,
        req.body.isActive,
        requestingAdminId,
      );

    res.status(200).json(
      successResponse(
        "Super Admin status updated successfully",
        admin,
      ),
    );
  } catch (error) {
    next(error);
  }
}