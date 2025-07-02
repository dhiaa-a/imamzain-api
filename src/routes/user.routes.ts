import { Router } from "express";
import {
  createUserHandler,
  getAllUsersHandler,
  getUserByIdHandler,
  updateUserActiveHandler,
  updateUserRolesHandler,
} from "../controllers/user.controller";
import { authenticateJWT, authorize } from "../middlewares/auth.middleware";
import { validateLanguage } from "../middlewares/language.middleware";
import {
  validateCreateUser,
  validateGetUserById,
  validateUpdateUserActive,
  validateUpdateUserRoles,
} from "../validations/user.validations";

const userRouter = Router();

// GET /users - Get all users
userRouter.get(
  "/", 
  authenticateJWT,
  authorize("READ_USER"),
  getAllUsersHandler
);

// GET /users/:id - Get user by ID
userRouter.get(
  "/:id", 
  authenticateJWT,
  authorize("READ_USER"),
  validateGetUserById,
  getUserByIdHandler
);

// POST /users - Create new user
userRouter.post(
  "/", 
  authenticateJWT,
  authorize("CREATE_USER"),
  validateCreateUser,
  createUserHandler
);

// PATCH /users/:id/status - Update user active status
userRouter.patch(
  "/:id/status", 
  authenticateJWT,
  authorize("UPDATE_USER"),
  validateUpdateUserActive,
  updateUserActiveHandler
);

// PUT /users/:id/roles - Update user roles
userRouter.put(
  "/:id/roles", 
  authenticateJWT,
  authorize("UPDATE_USER"),
  validateUpdateUserRoles,
  updateUserRolesHandler
);

export default userRouter;