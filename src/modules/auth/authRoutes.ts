import { Router } from "express";
import { register, login, me } from "./authController";
import { authMiddleware } from "../../middleware/auth";

export const authRoutes = Router();

authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.get("/me", authMiddleware, me);
