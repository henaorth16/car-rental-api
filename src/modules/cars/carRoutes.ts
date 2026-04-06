import { Router } from "express";
import { authMiddleware, roleMiddleware } from "../../middleware/auth";
import multer from "multer";
import fs from "fs";
import path from "path";
import {
  listCars,
  getCar,
  createCar,
  updateCar,
  deleteCar,
} from "./carController";

const uploadDir = path.join(process.cwd(), "uploads/cars");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

export const carRoutes = Router();

carRoutes.get("/", listCars);
carRoutes.get("/:id", getCar);
carRoutes.post("/", authMiddleware, roleMiddleware(["ADMIN"]), upload.array("images", 10), createCar);
carRoutes.put("/:id", authMiddleware, roleMiddleware(["ADMIN"]), upload.array("images", 10), updateCar);
carRoutes.delete("/:id", authMiddleware, roleMiddleware(["ADMIN"]), deleteCar);

