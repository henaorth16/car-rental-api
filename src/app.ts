import express from "express";
import cors from "cors";
import helmet from "helmet";
import { auth } from "./modules/auth/auth";
import { toNodeHandler } from "better-auth/node";
import { userRoutes } from "./modules/users/userRoutes";
import { carRoutes } from "./modules/cars/carRoutes";
import { bookingRoutes } from "./modules/bookings/bookingRoutes";
import { paymentRoutes } from "./modules/payments/paymentRoutes";
import { errorHandler } from "./middleware/errorHandler";
import { rateLimiter } from "./middleware/rateLimiter";
import { setupSwagger } from "./config/swagger";
import path from "path";

const app = express();

// Set up Swagger API docs
setupSwagger(app);

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL, // your frontend
    credentials: true,
  }),
);
app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"))
);
// Rate limiting
app.use(rateLimiter);

// Auth Handler
app.all("/api/auth/*splat", toNodeHandler(auth));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use("/api/users", userRoutes);
app.use("/api/cars", carRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

export default app;
