import { Request, Response, NextFunction } from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUserActive,
  updateUserRoles,
} from "../services/user.service";
import {
  UserResponse,
  CreateUserRequest,
  UpdateUserActiveRequest,
  UpdateUserRolesRequest,
  ApiResponse,
} from "../types/user.types";

export async function getAllUsersHandler(
  _req: Request,
  res: Response<ApiResponse<UserResponse[]>>,
  next: NextFunction,
): Promise<void> {
  try {
    const users = await getAllUsers();
    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
}

export async function getUserByIdHandler(
  req: Request,
  res: Response<ApiResponse<UserResponse>>,
  next: NextFunction,
): Promise<void> {
  try {
    const id = Number(req.params.id);
    
    if (Number.isNaN(id)) {
      res.status(400).json({
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "Invalid user ID",
        },
      });
      return;
    }

    const user = await getUserById(id);

    if (!user) {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "User not found",
        },
      });
      return;
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export async function createUserHandler(
  req: Request<{}, ApiResponse<UserResponse>, CreateUserRequest>,
  res: Response<ApiResponse<UserResponse>>,
  next: NextFunction,
): Promise<void> {
  try {
    const userData: CreateUserRequest = req.body;
    const user = await createUser(userData);

    res.status(201).json({
      success: true,
      data: user,
      message: "User created successfully",
    });
  } catch (error: any) {
    if (error.message === "EMAIL_OR_USERNAME_EXISTS") {
      res.status(409).json({
        success: false,
        error: {
          code: "CONFLICT",
          message: "Email or username already exists",
        },
      });
      return;
    }

    if (error.message === "INVALID_ROLE_IDS") {
      res.status(400).json({
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "One or more role IDs are invalid",
        },
      });
      return;
    }

    next(error);
  }
}

export async function updateUserActiveHandler(
  req: Request<{ id: string }, ApiResponse<UserResponse>, UpdateUserActiveRequest>,
  res: Response<ApiResponse<UserResponse>>,
  next: NextFunction,
): Promise<void> {
  try {
    const id = Number(req.params.id);
    
    if (Number.isNaN(id)) {
      res.status(400).json({
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "Invalid user ID",
        },
      });
      return;
    }

    const updateData: UpdateUserActiveRequest = req.body;
    const user = await updateUserActive(id, updateData);

    res.json({
      success: true,
      data: user,
      message: "User status updated successfully",
    });
  } catch (error: any) {
    if (error.message === "USER_NOT_FOUND") {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "User not found",
        },
      });
      return;
    }

    next(error);
  }
}

export async function updateUserRolesHandler(
  req: Request<{ id: string }, ApiResponse<UserResponse>, UpdateUserRolesRequest>,
  res: Response<ApiResponse<UserResponse>>,
  next: NextFunction,
): Promise<void> {
  try {
    const id = Number(req.params.id);
    
    if (Number.isNaN(id)) {
      res.status(400).json({
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "Invalid user ID",
        },
      });
      return;
    }

    const updateData: UpdateUserRolesRequest = req.body;
    const user = await updateUserRoles(id, updateData);

    res.json({
      success: true,
      data: user,
      message: "User roles updated successfully",
    });
  } catch (error: any) {
    if (error.message === "USER_NOT_FOUND") {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "User not found",
        },
      });
      return;
    }

    if (error.message === "INVALID_ROLE_IDS") {
      res.status(400).json({
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "One or more role IDs are invalid",
        },
      });
      return;
    }

    next(error);
  }
}