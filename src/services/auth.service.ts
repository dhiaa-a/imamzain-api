import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../database/prisma";
import { env } from "../config/env";

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export async function loginUser(
  username: string,
  password: string
): Promise<{ user: { id: number; username: string; email: string; roles: string[] }; tokens: Tokens }> {
  const user = await prisma.user.findUnique({
    where: { username },
    include: { roles: { include: { role: true } } },
  });
  if (!user || !user.isActive) {
    throw new Error("UNAUTHORIZED");
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    throw new Error("UNAUTHORIZED");
  }

  // generate tokens
  const accessToken = jwt.sign(
    { userId: user.id },
    env.JWT_SECRET,
    { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN }
  );
  const refreshToken = jwt.sign(
    { userId: user.id },
    env.REFRESH_TOKEN_SECRET,
    { expiresIn: env.REFRESH_TOKEN_EXPIRES_IN }
  );

  // persist refreshToken
  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id },
  });

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles.map((ur) => ur.role.name),
    },
    tokens: { accessToken, refreshToken },
  };
}

export async function refreshAccessToken(
  token: string
): Promise<{ accessToken: string }> {
  // lookup in DB
  const stored = await prisma.refreshToken.findUnique({ where: { token } });
  if (!stored) {
    throw new Error("INVALID_REFRESH_TOKEN");
  }

  // verify
  const payload = jwt.verify(token, env.REFRESH_TOKEN_SECRET) as { userId: number };
  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || !user.isActive) {
    throw new Error("UNAUTHORIZED");
  }

  // issue new access token
  const accessToken = jwt.sign(
    { userId: user.id },
    env.JWT_SECRET,
    { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN }
  );
  return { accessToken };
}

export async function logoutUser(token?: string): Promise<void> {
  if (token) {
    await prisma.refreshToken.deleteMany({ where: { token } });
  }
}
