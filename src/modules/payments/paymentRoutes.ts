import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import { createPayment, listPayments } from "./paymentController";

export const paymentRoutes = Router();

paymentRoutes.post("/", authMiddleware, createPayment);
paymentRoutes.get("/", authMiddleware, listPayments);
