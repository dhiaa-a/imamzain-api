import { Router } from "express";
import { authenticateJWT, authorize } from "../middlewares/auth.middleware";
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUserActive,
  updateUserRoles,
} from "../controllers/user.controller";

const userRouter = Router();

// these are now correctly typed RequestHandlers
userRouter.use(authenticateJWT);
userRouter.use(authorize("SUPER_ADMIN"));

userRouter.get("/", getAllUsers);
userRouter.get("/:id", getUserById);
userRouter.post("/", createUser);
userRouter.patch("/:id/active", updateUserActive);
userRouter.put("/:id/roles", updateUserRoles);

export default userRouter;
