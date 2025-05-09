import { Router } from "express"; 
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUserActive,
  updateUserRoles,
} from "../controllers/user.controller";
import { authorize } from "../middlewares/auth.middleware";

const userRouter = Router();

// these are now correctly typed RequestHandlers

 
userRouter.get("/", authorize("READ_USER"), getAllUsers);
userRouter.get("/:id",authorize("READ_USER"), getUserById);

export default userRouter;
