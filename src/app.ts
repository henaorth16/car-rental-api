import express from "express";
import cors from "cors";
import helmet from "helmet";
import { auth } from "./modules/auth/auth";
import { userRoutes } from "./modules/users/userRoutes";
import { carRoutes } from "./modules/cars/carRoutes";
import { bookingRoutes } from "./modules/bookings/bookingRoutes";
import { paymentRoutes } from "./modules/payments/paymentRoutes";
import { errorHandler } from "./middleware/errorHandler";
import { rateLimiter } from "./middleware/rateLimiter";
import { authRoutes } from "./modules/auth/authRoutes";
import { setupSwagger } from "./config/swagger";

const app = express();

// Set up Swagger API docs
setupSwagger(app);

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
app.use(rateLimiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Auth routes
app.use("/auth", authRoutes);

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
