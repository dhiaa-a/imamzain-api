"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const authRoutes = (0, express_1.Router)();
// POST /api/v1/auth/login
authRoutes.post("/login", auth_controller_1.login);
exports.default = authRoutes;
