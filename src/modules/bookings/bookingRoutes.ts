import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import {
  createBooking,
  getMyBookings,
  cancelBooking,
} from "./bookingController";

export const bookingRoutes = Router();

bookingRoutes.post("/", authMiddleware, createBooking);
bookingRoutes.get("/my", authMiddleware, getMyBookings);
bookingRoutes.delete("/:id", authMiddleware, cancelBooking);
