import { Router } from "express";
import { authMiddleware, roleMiddleware } from "../../middleware/auth";
import { getMe, listUsers, registerAgent } from "./userController";

export const userRoutes = Router();

userRoutes.get("/me", authMiddleware, getMe);
userRoutes.post("/register-agent", authMiddleware, registerAgent);
userRoutes.get("/", authMiddleware, roleMiddleware(["ADMIN", "AGENT"]), listUsers);
// userRoutes.get("/")