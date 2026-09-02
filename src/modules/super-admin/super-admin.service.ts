import argon2 from "argon2";
import { prisma } from "../../config/database";
import { AppError } from "../../common/errors/app-error";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../common/utils/jwt";

import {
  createSuperAdmin,
  findSuperAdminByEmail,
  findSuperAdminById,
  updateSuperAdminLastLogin,
} from "./super-admin.repository";
import {
  findSuperAdminByIdWithPassword,
  updateSuperAdminPassword,
  updateSuperAdmin,
  updateSuperAdminStatus,
  createPasswordReset,
  findPasswordResetByTokenHash,
  markPasswordResetUsed,
  invalidatePasswordResetTokens,
} from "./super-admin.repository";

import {
  generatePasswordResetToken,
  hashPasswordResetToken,
} from "../../common/utils/password-reset";

import type {
  LoginSuperAdminInput,
  RegisterSuperAdminInput,
} from "./super-admin.schema";

import type { SuperAdminResponse } from "./super-admin.types";

export async function registerSuperAdmin(
  input: RegisterSuperAdminInput,
): Promise<SuperAdminResponse> {
  const existingAdmin = await findSuperAdminByEmail(input.email);

  if (existingAdmin) {
    throw new AppError(
      "A Super Admin with this email already exists",
      409,
      "SUPER_ADMIN_EMAIL_EXISTS",
    );
  }

  const passwordHash = await argon2.hash(input.password);

  return createSuperAdmin({
    ...input,
    passwordHash,
  });
}

export async function loginSuperAdmin(
  input: LoginSuperAdminInput,
) {
  const admin = await findSuperAdminByEmail(input.email);

  if (!admin) {
    throw new AppError(
      "Invalid email or password",
      401,
      "INVALID_CREDENTIALS",
    );
  }

  if (!admin.isActive) {
    throw new AppError(
      "Super Admin account is disabled",
      403,
      "SUPER_ADMIN_DISABLED",
    );
  }

  const passwordValid = await argon2.verify(
    admin.passwordHash,
    input.password,
  );

  if (!passwordValid) {
    throw new AppError(
      "Invalid email or password",
      401,
      "INVALID_CREDENTIALS",
    );
  }

  const accessToken = await generateAccessToken(admin.id);

  const refreshToken = await generateRefreshToken(admin.id);

  await updateSuperAdminLastLogin(admin.id);

  return {
    accessToken,
    refreshToken,
    user: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      isActive: admin.isActive,
    },
  };
}

export async function getSuperAdminProfile(
  adminId: number,
) {
  const admin = await findSuperAdminById(adminId);

  if (!admin) {
    throw new AppError(
      "Super Admin not found",
      404,
      "SUPER_ADMIN_NOT_FOUND",
    );
  }

  if (!admin.isActive) {
    throw new AppError(
      "Super Admin account is disabled",
      403,
      "SUPER_ADMIN_DISABLED",
    );
  }

  return admin;
}

export async function changeSuperAdminPassword(
  adminId: number,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const admin = await findSuperAdminByIdWithPassword(adminId);

  if (!admin) {
    throw new AppError(
      "Super Admin not found",
      404,
      "SUPER_ADMIN_NOT_FOUND",
    );
  }

  const validPassword = await argon2.verify(
    admin.passwordHash,
    currentPassword,
  );

  if (!validPassword) {
    throw new AppError(
      "Current password is incorrect",
      401,
      "INVALID_CURRENT_PASSWORD",
    );
  }

  const samePassword = await argon2.verify(
    admin.passwordHash,
    newPassword,
  );

  if (samePassword) {
    throw new AppError(
      "New password must be different from current password",
      400,
      "PASSWORD_UNCHANGED",
    );
  }

  const passwordHash = await argon2.hash(newPassword);

  await updateSuperAdminPassword(
    adminId,
    passwordHash,
  );

  await invalidatePasswordResetTokens(adminId);
}

export async function forgotSuperAdminPassword(
  email: string,
): Promise<{ resetToken?: string }> {
  const admin = await findSuperAdminByEmail(email);

  // Do not reveal whether the email exists.
  if (!admin) {
    return {};
  }

  if (!admin.isActive) {
    return {};
  }

  await invalidatePasswordResetTokens(admin.id);

  const resetToken = generatePasswordResetToken();

 const tokenHash = hashPasswordResetToken(resetToken);

  const expiresAt = new Date(
    Date.now() + 15 * 60 * 1000,
  );

  await createPasswordReset({
    superAdminId: admin.id,
    tokenHash,
    expiresAt,
  });

  // Development only.
  // In production this token will be sent through email.
  if (process.env.NODE_ENV !== "production") {
    return {
      resetToken,
    };
  }

  return {};
}

export async function resetSuperAdminPassword(
  token: string,
  newPassword: string,
): Promise<void> {
  const tokenHash = hashPasswordResetToken(token);

  const resetRecord =
    await findPasswordResetByTokenHash(tokenHash);

  if (!resetRecord) {
    throw new AppError(
      "Invalid or expired password reset token",
      400,
      "INVALID_PASSWORD_RESET_TOKEN",
    );
  }

  if (resetRecord.usedAt) {
    throw new AppError(
      "Invalid or expired password reset token",
      400,
      "INVALID_PASSWORD_RESET_TOKEN",
    );
  }

  if (resetRecord.expiresAt <= new Date()) {
    throw new AppError(
      "Invalid or expired password reset token",
      400,
      "INVALID_PASSWORD_RESET_TOKEN",
    );
  }

  if (!resetRecord.superAdmin.isActive) {
    throw new AppError(
      "Super Admin account is disabled",
      403,
      "SUPER_ADMIN_DISABLED",
    );
  }

  const passwordHash = await argon2.hash(
    newPassword,
  );

  await updateSuperAdminPassword(
    resetRecord.superAdminId,
    passwordHash,
  );

  await markPasswordResetUsed(resetRecord.id);

  await invalidatePasswordResetTokens(
    resetRecord.superAdminId,
  );
}

export async function updateSuperAdminProfile(
  adminId: number,
  data: {
    name?: string;
    email?: string;
  },
) {
  const admin = await findSuperAdminByIdWithPassword(
    adminId,
  );

  if (!admin) {
    throw new AppError(
      "Super Admin not found",
      404,
      "SUPER_ADMIN_NOT_FOUND",
    );
  }

  if (
    data.email &&
    data.email !== admin.email
  ) {
    const existingAdmin =
      await findSuperAdminByEmail(data.email);

    if (
      existingAdmin &&
      existingAdmin.id !== adminId
    ) {
      throw new AppError(
        "A Super Admin with this email already exists",
        409,
        "SUPER_ADMIN_EMAIL_EXISTS",
      );
    }
  }

  return updateSuperAdmin(adminId, data);
}

async function findActiveSuperAdminCount(): Promise<number> {
  return prisma.superAdmin.count({
    where: {
      isActive: true,
    },
  });
}

export async function updateSuperAdminStatusService(
  targetAdminId: number,
  isActive: boolean,
  requestingAdminId: number,
) {
  const admin = await findSuperAdminByIdWithPassword(
    targetAdminId,
  );

  if (!admin) {
    throw new AppError(
      "Super Admin not found",
      404,
      "SUPER_ADMIN_NOT_FOUND",
    );
  }

  // Prevent a Super Admin from disabling their own account.
  if (
    targetAdminId === requestingAdminId &&
    !isActive
  ) {
    throw new AppError(
      "You cannot disable your own Super Admin account",
      400,
      "CANNOT_DISABLE_SELF",
    );
  }

  // No change required.
  if (admin.isActive === isActive) {
    return findSuperAdminById(targetAdminId);
  }

  // Prevent disabling the last active Super Admin.
  if (!isActive && admin.isActive) {
    const activeAdminCount =
      await findActiveSuperAdminCount();

    if (activeAdminCount <= 1) {
      throw new AppError(
        "At least one active Super Admin is required",
        400,
        "LAST_ACTIVE_SUPER_ADMIN",
      );
    }
  }

  return updateSuperAdminStatus(
    targetAdminId,
    isActive,
  );
}