import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { prisma } from "../database/prisma";

export async function login(req: Request, res: Response): Promise<any> {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "Username and password required",
        },
      });
  }
  try {
    const user = await prisma.user.findUnique({
      where: { username },
      include: { roles: { include: { role: true } } },
    });
    if (!user || !user.isActive) {
      return res
        .status(401)
        .json({
          success: false,
          error: { code: "UNAUTHORIZED", message: "Invalid credentials" },
        });
    }
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res
        .status(401)
        .json({
          success: false,
          error: { code: "UNAUTHORIZED", message: "Invalid credentials" },
        });
    }

    const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          roles: user.roles.map((ur) => ur.role.name),
        },
      },
    });
  } catch (err) {
    console.log(err);
  }
}
