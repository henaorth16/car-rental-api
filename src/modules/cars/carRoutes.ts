import { Router } from "express";
import { authMiddleware, roleMiddleware } from "../../middleware/auth";
import multer from "multer";
import {
  listCars,
  getCar,
  createCar,
  updateCar,
  deleteCar,
  listMyCars,
} from "./carController";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per image
  },
});

export const carRoutes = Router();

carRoutes.get("/", listCars);
carRoutes.get("/my", authMiddleware, roleMiddleware(["AGENT", "ADMIN"]), listMyCars);
carRoutes.get("/:id", getCar);
carRoutes.post("/", authMiddleware, roleMiddleware(["ADMIN", "AGENT"]), upload.array("images", 10), createCar);
carRoutes.put("/:id", authMiddleware, roleMiddleware(["ADMIN", "AGENT"]), upload.array("images", 10), updateCar);
carRoutes.delete("/:id", authMiddleware, roleMiddleware(["ADMIN", "AGENT"]), deleteCar);
