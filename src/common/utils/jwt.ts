import {
  SignJWT,
  jwtVerify,
  type JWTPayload,
} from "jose";

import { env } from "../../config/env";

const accessSecret = new TextEncoder().encode(
  env.JWT_ACCESS_SECRET,
);

const refreshSecret = new TextEncoder().encode(
  env.JWT_REFRESH_SECRET,
);

export interface AuthTokenPayload extends JWTPayload {
  sub: string;
  role: "SUPER_ADMIN";
}

export async function generateAccessToken(
  adminId: number,
): Promise<string> {
  return new SignJWT({
    role: "SUPER_ADMIN",
  })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setSubject(String(adminId))
    .setIssuedAt()
    .setExpirationTime(env.JWT_ACCESS_EXPIRES_IN)
    .sign(accessSecret);
}

export async function generateRefreshToken(
  adminId: number,
): Promise<string> {
  return new SignJWT({
    role: "SUPER_ADMIN",
  })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setSubject(String(adminId))
    .setIssuedAt()
    .setExpirationTime(env.JWT_REFRESH_EXPIRES_IN)
    .sign(refreshSecret);
}

export async function verifyAccessToken(
  token: string,
): Promise<AuthTokenPayload> {
  const { payload } = await jwtVerify(
    token,
    accessSecret,
    {
      algorithms: ["HS256"],
    },
  );

  return payload as AuthTokenPayload;
}

export async function verifyRefreshToken(
  token: string,
): Promise<AuthTokenPayload> {
  const { payload } = await jwtVerify(
    token,
    refreshSecret,
    {
      algorithms: ["HS256"],
    },
  );

  return payload as AuthTokenPayload;
}
