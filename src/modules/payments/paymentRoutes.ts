import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import { createPayment, listPayments, confirmPayment } from "./paymentController";

export const paymentRoutes = Router();

paymentRoutes.post("/", authMiddleware, createPayment);
paymentRoutes.post("/confirm", authMiddleware, confirmPayment);
paymentRoutes.get("/", authMiddleware, listPayments);
