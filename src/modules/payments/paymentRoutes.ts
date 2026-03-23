import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import { createPayment } from "./paymentController";

export const paymentRoutes = Router();

paymentRoutes.post("/", authMiddleware, createPayment);
