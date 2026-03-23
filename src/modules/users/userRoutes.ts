import { Router } from "express";
import { authMiddleware, roleMiddleware } from "../../middleware/auth";
import { getMe, listUsers } from "./userController";

export const userRoutes = Router();

userRoutes.get("/me", authMiddleware, getMe);
userRoutes.get("/", authMiddleware, roleMiddleware(["ADMIN"]), listUsers);
