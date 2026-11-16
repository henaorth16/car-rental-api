import { Router } from "express";
import { authMiddleware, roleMiddleware } from "../../middleware/auth";
import { getMe, listUsers, registerAgent, updateProfile } from "./userController";

export const userRoutes = Router();

userRoutes.get("/me", authMiddleware, getMe);
userRoutes.put("/me", authMiddleware, updateProfile);
userRoutes.post("/register-agent", authMiddleware, registerAgent);
userRoutes.get("/", authMiddleware, roleMiddleware(["ADMIN", "AGENT"]), listUsers);
// userRoutes.get("/")