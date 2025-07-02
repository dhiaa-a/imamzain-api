export interface UserResponse {
  id: number;
  fullName: string;
  email: string;
  username: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  roles: string[];
  permissions: string[][];
}

export interface CreateUserRequest {
  fullName: string;
  email: string;
  username: string;
  password: string;
  roles: number[];
}

export interface UpdateUserActiveRequest {
  isActive: boolean;
}

export interface UpdateUserRolesRequest {
  roles: number[];
}

export interface UserWithRoles {
  id: number;
  fullName: string;
  email: string;
  username: string;
  passwordHash: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  roles: Array<{
    id: number;
    userId: number;
    roleId: number;
    role: {
      id: number;
      name: string;
      description: string | null;
      rolePermissions: Array<{
        id: number;
        roleId: number;
        permissionId: number;
        permission: {
          id: number;
          name: string;
          description: string | null;
        };
      }>;
    };
  }>;
}

// Prisma result type for user queries
export type PrismaUserWithRoles = {
  id: number;
  fullName: string;
  email: string;
  username: string;
  passwordHash: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  roles: Array<{
    id: number;
    userId: number;
    roleId: number;
    role: {
      id: number;
      name: string;
      description: string | null;
      rolePermissions: Array<{
        id: number;
        roleId: number;
        permissionId: number;
        permission: {
          id: number;
          name: string;
          description: string | null;
        };
      }>;
    };
  }>;
};

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}