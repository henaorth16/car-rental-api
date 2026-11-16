import { Router } from "express";
import { authMiddleware, roleMiddleware } from "../../middleware/auth";
import {
  createBooking,
  getMyBookings,
  cancelBooking,
  getAgentBookings,
  updateBookingStatus,
} from "./bookingController";

export const bookingRoutes = Router();

bookingRoutes.post("/", authMiddleware, createBooking);
bookingRoutes.get("/my", authMiddleware, getMyBookings);
bookingRoutes.get("/agent", authMiddleware, roleMiddleware(["AGENT", "ADMIN"]), getAgentBookings);
bookingRoutes.patch("/:id/status", authMiddleware, roleMiddleware(["AGENT", "ADMIN"]), updateBookingStatus);
bookingRoutes.delete("/:id", authMiddleware, cancelBooking);
