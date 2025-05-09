import { Request, Response } from "express";
import bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { env } from "../config/env";
import { prisma } from "../database/prisma";

export async function login(req: Request, res: Response): Promise<any> {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      error: { code: "BAD_REQUEST", message: "Username and password required" },
    });
  }

  const user = await prisma.user.findUnique({
    where: { username },
    include: { roles: { include: { role: true } } },
  });
  if (!user || !user.isActive) {
    return res
      .status(401)
      .json({ success: false, error: { code: "UNAUTHORIZED", message: "Invalid credentials" } });
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return res
      .status(401)
      .json({ success: false, error: { code: "UNAUTHORIZED", message: "Invalid credentials" } });
  }

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

  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id },
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  });

  return res.json({
    success: true,
    data: {
      token: accessToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        roles: user.roles.map((ur) => ur.role.name),
      },
    },
  });
}


export async function refreshToken(req: Request, res: Response): Promise<any> {
  const token = req.cookies.refreshToken;
  if (!token) {
    return res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "No refresh token" } });
  }

  // التحقق من وجوده في DB
  const stored = await prisma.refreshToken.findUnique({ where: { token } });
  if (!stored) {
    return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Invalid refresh token" } });
  }

  try {
    const payload = jwt.verify(token, env.REFRESH_TOKEN_SECRET) as { userId: number };
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || !user.isActive) throw new Error();

    // اصدار Access Token جديد
    const newAccessToken = jwt.sign(
      { userId: user.id },
      env.JWT_SECRET,
      { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN }
    );

    return res.json({ success: true, data: { token: newAccessToken } });
  } catch {
    return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Refresh token expired or invalid" } });
  }
}


export async function logout(req: Request, res: Response): Promise<any> {
  const token = req.cookies.refreshToken;
  if (token) {
    // حذف من DB
    await prisma.refreshToken.deleteMany({ where: { token } });
    // مسح الكوكي
    res.clearCookie("refreshToken", { httpOnly: true, sameSite: "strict" });
  }
  return res.json({ success: true, message: "Logged out" });
}
