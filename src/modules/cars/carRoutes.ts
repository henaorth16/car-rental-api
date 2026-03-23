import { Router } from "express";
import { authMiddleware, roleMiddleware } from "../../middleware/auth";
import {
  listCars,
  getCar,
  createCar,
  updateCar,
  deleteCar,
} from "./carController";

export const carRoutes = Router();

carRoutes.get("/", listCars);
carRoutes.get("/:id", getCar);
carRoutes.post("/", authMiddleware, roleMiddleware(["ADMIN"]), createCar);
carRoutes.put("/:id", authMiddleware, roleMiddleware(["ADMIN"]), updateCar);
carRoutes.delete("/:id", authMiddleware, roleMiddleware(["ADMIN"]), deleteCar);
