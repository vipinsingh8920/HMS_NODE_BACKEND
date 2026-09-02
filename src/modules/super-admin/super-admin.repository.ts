import { prisma } from "../../config/database";
import type { RegisterSuperAdminInput } from "./super-admin.schema";

export async function findSuperAdminByEmail(
  email: string,
) {
  return prisma.superAdmin.findUnique({
    where: {
      email,
    },
  });
}

export async function createSuperAdmin(
  data: RegisterSuperAdminInput & {
    passwordHash: string;
  },
) {
  return prisma.superAdmin.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash: data.passwordHash,
    },
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function updateSuperAdminLastLogin(
  adminId: number,
) {
  return prisma.superAdmin.update({
    where: {
      id: adminId,
    },
    data: {
      lastLoginAt: new Date(),
    },
  });
}

export async function findSuperAdminById(adminId: number) {
  return prisma.superAdmin.findUnique({
    where: {
      id: adminId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      lastLoginAt: true,
    },
  });
}

export async function findSuperAdminByIdWithPassword(
  adminId: number,
) {
  return prisma.superAdmin.findUnique({
    where: {
      id: adminId,
    },
  });
}

export async function updateSuperAdminPassword(
  adminId: number,
  passwordHash: string,
) {
  return prisma.superAdmin.update({
    where: {
      id: adminId,
    },
    data: {
      passwordHash,
    },
  });
}

export async function updateSuperAdmin(
  adminId: number,
  data: {
    name?: string;
    email?: string;
  },
) {
  return prisma.superAdmin.update({
    where: {
      id: adminId,
    },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      lastLoginAt: true,
    },
  });
}

export async function updateSuperAdminStatus(
  adminId: number,
  isActive: boolean,
) {
  return prisma.superAdmin.update({
    where: {
      id: adminId,
    },
    data: {
      isActive,
    },
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      lastLoginAt: true,
    },
  });
}

export async function createPasswordReset(
  data: {
    superAdminId: number;
    tokenHash: string;
    expiresAt: Date;
  },
) {
  return prisma.superAdminPasswordReset.create({
    data,
  });
}

export async function findPasswordResetRecords(
  superAdminId: number,
) {
  return prisma.superAdminPasswordReset.findMany({
    where: {
      superAdminId,
      usedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
  });
}

export async function markPasswordResetUsed(
  resetId: number,
) {
  return prisma.superAdminPasswordReset.update({
    where: {
      id: resetId,
    },
    data: {
      usedAt: new Date(),
    },
  });
}

export async function invalidatePasswordResetTokens(
  superAdminId: number,
) {
  return prisma.superAdminPasswordReset.updateMany({
    where: {
      superAdminId,
      usedAt: null,
    },
    data: {
      usedAt: new Date(),
    },
  });
}

export async function findPasswordResetByTokenHash(
  tokenHash: string,
) {
  return prisma.superAdminPasswordReset.findUnique({
    where: {
      tokenHash,
    },
    include: {
      superAdmin: true,
    },
  });
}