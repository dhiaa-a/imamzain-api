import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt"; 
import { prisma } from "../database/prisma";

export async function getAllUsers(_req: Request, res: Response, next: NextFunction): Promise<any> {
  try {
    const users = await prisma.user.findMany({
      include: { roles: { include: { role: true } }, profile: true },
    });
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
}
 
export async function getUserById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res
      .status(400)
      .json({
        success: false,
        error: { code: "BAD_REQUEST", message: "Invalid user ID" },
      });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        roles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      res
        .status(404)
        .json({
          success: false,
          error: { code: "NOT_FOUND", message: "User not found" },
        });
      return;
    }

    // transform roles to include a simple permissions array
    const permissions = user.roles.map((ur) =>   ur.role.rolePermissions.map((rp) => rp.permission.name  ) );

    res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        profile: user.profile,
        roles:  user.roles.map((ur) => ur.role.name),
        permissions: permissions 
      },
    });
  } catch (err) {
    next(err);
  }
}


export async function createUser(req: Request, res: Response, next: NextFunction): Promise<any> {
  const { email, username, password, roles: roleIds } = req.body;
  if (!email || !username || !password || !Array.isArray(roleIds)) {
    return res
      .status(400)
      .json({ success: false, error: { code: "BAD_REQUEST", message: "Missing fields or roles" } });
  }
  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
        roles: { create: roleIds.map((rId: number) => ({ roleId: rId })) },
      },
      include: { roles: { include: { role: true } } },
    });
    res.status(201).json({ success: true, data: user, message: "User created" });
  } catch (err: any) {
    if (err.code === "P2002") {
      return res
        .status(409)
        .json({ success: false, error: { code: "CONFLICT", message: "Email or username already in use" } });
    }
    next(err);
  }
}

export async function updateUserActive(req: Request, res: Response, next: NextFunction): Promise<any> {
  const id = Number(req.params.id);
  const { isActive } = req.body;
  if (Number.isNaN(id) || typeof isActive !== "boolean") {
    return res
      .status(400)
      .json({ success: false, error: { code: "BAD_REQUEST", message: "Invalid input" } });
  }
  try {
    const user = await prisma.user.update({ where: { id }, data: { isActive } });
    res.json({ success: true, data: user, message: "User status updated" });
  } catch (err) {
    next(err);
  }
}

export async function updateUserRoles(req: Request, res: Response, next: NextFunction): Promise<any> {
  const id = Number(req.params.id);
  const { roles: roleIds } = req.body;
  if (Number.isNaN(id) || !Array.isArray(roleIds)) {
    return res
      .status(400)
      .json({ success: false, error: { code: "BAD_REQUEST", message: "Invalid input" } });
  }
  try {
    await prisma.userRole.deleteMany({ where: { userId: id } });
    const user = await prisma.user.update({
      where: { id },
      data: { roles: { create: roleIds.map((rId: number) => ({ roleId: rId })) } },
      include: { roles: { include: { role: true } } },
    });
    res.json({ success: true, data: user, message: "Roles updated" });
  } catch (err) {
    next(err);
  }
}
