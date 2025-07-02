import bcrypt from "bcrypt";
import { prisma } from "../database/prisma";
import {
  UserResponse,
  CreateUserRequest,
  UpdateUserActiveRequest,
  UpdateUserRolesRequest,
  PrismaUserWithRoles,
} from "../types/user.types";

// Helper function to format user data
function formatUserResponse(user: PrismaUserWithRoles): UserResponse {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    username: user.username,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    roles: user.roles.map(ur => ur.role.name),
    permissions: user.roles.map(ur =>
      ur.role.rolePermissions.map(rp => rp.permission.name)
    ),
  };
}

// Include configuration for user queries
const userInclude = {
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
};

export async function getAllUsers(): Promise<UserResponse[]> {
  const users = await prisma.user.findMany({
    include: userInclude,
  }) as PrismaUserWithRoles[];

  return users.map(formatUserResponse);
}

export async function getUserById(id: number): Promise<UserResponse | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    include: userInclude,
  }) as PrismaUserWithRoles | null;

  if (!user) {
    return null;
  }

  return formatUserResponse(user);
}

export async function createUser(userData: CreateUserRequest): Promise<UserResponse> {
  const { fullName, email, username, password, roles: roleIds } = userData;

  // Hash password
  const passwordHash = await bcrypt.hash(password, 12);

  // Check if email or username already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        { username },
      ],
    },
  });

  if (existingUser) {
    throw new Error("EMAIL_OR_USERNAME_EXISTS");
  }

  // Verify that all role IDs exist
  const roles = await prisma.role.findMany({
    where: {
      id: { in: roleIds },
    },
  });

  if (roles.length !== roleIds.length) {
    throw new Error("INVALID_ROLE_IDS");
  }

  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      username,
      passwordHash,
      roles: {
        create: roleIds.map((roleId: number) => ({ roleId })),
      },
    },
    include: userInclude,
  }) as PrismaUserWithRoles;

  return formatUserResponse(user);
}

export async function updateUserActive(
  id: number,
  data: UpdateUserActiveRequest
): Promise<UserResponse> {
  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw new Error("USER_NOT_FOUND");
  }

  const user = await prisma.user.update({
    where: { id },
    data: { isActive: data.isActive },
    include: userInclude,
  }) as PrismaUserWithRoles;

  return formatUserResponse(user);
}

export async function updateUserRoles(
  id: number,
  data: UpdateUserRolesRequest
): Promise<UserResponse> {
  const { roles: roleIds } = data;

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw new Error("USER_NOT_FOUND");
  }

  // Verify that all role IDs exist
  const roles = await prisma.role.findMany({
    where: {
      id: { in: roleIds },
    },
  });

  if (roles.length !== roleIds.length) {
    throw new Error("INVALID_ROLE_IDS");
  }

  // Use transaction to ensure data consistency
  const user = await prisma.$transaction(async (tx) => {
    // Remove existing roles
    await tx.userRole.deleteMany({
      where: { userId: id },
    });

    // Add new roles
    await tx.userRole.createMany({
      data: roleIds.map((roleId: number) => ({
        userId: id,
        roleId,
      })),
    });

    // Return updated user
    return tx.user.findUnique({
      where: { id },
      include: userInclude,
    });
  }) as PrismaUserWithRoles | null;

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  return formatUserResponse(user);
}

export async function checkUserExists(id: number): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true },
  });

  return !!user;
}

export async function checkEmailExists(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  return !!user;
}

export async function checkUsernameExists(username: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  return !!user;
}