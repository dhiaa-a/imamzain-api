"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const user_controller_1 = require("../controllers/user.controller");
const userRouter = (0, express_1.Router)();
// these are now correctly typed RequestHandlers
userRouter.use(auth_middleware_1.authenticateJWT);
userRouter.use((0, auth_middleware_1.authorize)("SUPER_ADMIN"));
userRouter.get("/", user_controller_1.getAllUsers);
userRouter.get("/:id", user_controller_1.getUserById);
userRouter.post("/", user_controller_1.createUser);
userRouter.patch("/:id/active", user_controller_1.updateUserActive);
userRouter.put("/:id/roles", user_controller_1.updateUserRoles);
exports.default = userRouter;
