import { Router } from "express";
import { authMiddleware, roleMiddleware } from "../../middleware/auth";
import {
  createBooking,
  getMyBookings,
  cancelBooking,
  getAgentBookings,
} from "./bookingController";

export const bookingRoutes = Router();

bookingRoutes.post("/", authMiddleware, createBooking);
bookingRoutes.get("/my", authMiddleware, getMyBookings);
bookingRoutes.get("/agent", authMiddleware, roleMiddleware(["AGENT", "ADMIN"]), getAgentBookings);
bookingRoutes.delete("/:id", authMiddleware, cancelBooking);
