import { Request, Response } from "express";
import { success, z } from "zod";
import { prisma } from "../../config/prisma";

const createCarSchema = z.object({
  brand: z.string().min(1),
  model: z.string().min(1),
  type: z.string().min(1),
  pricePerDay: z.number().positive(),
  available: z.boolean().optional(),
});

const updateCarSchema = createCarSchema.partial();

export const listCars = async (req: Request, res: Response) => {
  const cars = await prisma.car.findMany();
  res.json({ cars });
};

export const getCar = async (req: Request, res: Response) => {
  const car = await prisma.car.findUnique({
    where: { id: req.params.id as string },
  });
  if (!car) {
    return res.status(404).json({ error: "Car not found" });
  }
  res.json({ car });
};

export const createCar = async (req: Request, res: Response) => {
  try {
    const payload = createCarSchema.parse(req.body);

    const car = await prisma.car.create({ data: payload });
    res.status(201).json({ car });
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Invalid request" });
  }
};

export const updateCar = async (req: Request, res: Response) => {
  try {
    const payload = updateCarSchema.parse(req.body);
    const car = await prisma.car.update({
      where: { id: req.params.id as string },
      data: payload,
    });
    res.json({ car });
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Invalid request" });
  }
};

export const deleteCar = async (req: Request, res: Response) => {
  const car = await prisma.car.delete({
    where: { id: req.params.id as string },
  });
  if (!car)
    return res.status(404).json({
      message: "the car not found",
      success: false,
    });
  res.status(204).json({
    message: "the car deleted successfully",
    success: true,
  });
};
