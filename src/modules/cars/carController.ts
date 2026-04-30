import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { Role } from "@prisma/client";

const createCarSchema = z.object({
  brand: z.string().min(1),
  model: z.string().min(1),
  type: z.string().min(1),
  fuelType: z.string().optional(),
  transmission: z.string().optional(),
  description: z.string().optional(),
  seats: z.coerce.number().int().optional(),
  doors: z.coerce.number().int().optional(),
  color: z.string().optional(),
  pricePerDay: z.coerce.number().positive(),
  ownerId: z.string().uuid().optional(),
  available: z.preprocess((val) => val === "true" || val === true, z.boolean().optional()),
});

const updateCarSchema = createCarSchema.partial();

const fleetQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  brand: z.string().optional(),
  model: z.string().optional(),
  type: z.string().optional(),
  fuelType: z.string().optional(),
  transmission: z.string().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  seats: z.coerce.number().int().positive().optional(),
  available: z
    .string()
    .optional()
    .transform((value) => (value === undefined ? undefined : value === "true")),
  search: z.string().optional(),
  sortBy: z.enum(["pricePerDay", "createdAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const listCars = async (req: Request, res: Response) => {
  const query = fleetQuerySchema.parse(req.query);
  const { page, limit } = query;

  const where: any = {
    ...(query.brand ? { brand: { contains: query.brand, mode: "insensitive" } } : {}),
    ...(query.model ? { model: { contains: query.model, mode: "insensitive" } } : {}),
    ...(query.type ? { type: { contains: query.type, mode: "insensitive" } } : {}),
    ...(query.fuelType ? { fuelType: query.fuelType } : {}),
    ...(query.transmission ? { transmission: query.transmission } : {}),
    ...(query.seats ? { seats: query.seats } : {}),
    ...(query.available !== undefined ? { available: query.available } : { available: true }),
    ...(query.minPrice !== undefined || query.maxPrice !== undefined
      ? {
          pricePerDay: {
            ...(query.minPrice !== undefined ? { gte: query.minPrice } : {}),
            ...(query.maxPrice !== undefined ? { lte: query.maxPrice } : {}),
          },
        }
      : {}),
  };

  if (query.search) {
    where.OR = [
      { brand: { contains: query.search, mode: "insensitive" } },
      { model: { contains: query.search, mode: "insensitive" } },
      { type: { contains: query.search, mode: "insensitive" } },
      { description: { contains: query.search, mode: "insensitive" } },
    ];
  }

  const [cars, total] = await Promise.all([
    prisma.car.findMany({
      where,
      include: { images: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [query.sortBy]: query.sortOrder },
    }),
    prisma.car.count({ where }),
  ]);

  res.json({
    cars,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
};

export const getCar = async (req: Request, res: Response) => {
  const car = await prisma.car.findUnique({
    where: { id: req.params.id as string },
    include: { images: true },
  });
  if (!car) {
    return res.status(404).json({ error: "Car not found" });
  }
  res.json({ car });
};

export const createCar = async (req: any, res: Response) => {
  try {
    const payload = createCarSchema.parse(req.body);
    const files = req.files as Express.Multer.File[];

    const ownerId =
      req.user.role === Role.AGENT
        ? req.user.id
        : payload.ownerId;

    const carData: any = {
      ...payload,
      ownerId,
    };

    if (files && files.length > 0) {
      carData.images = {
        create: files.map((f: Express.Multer.File) => ({ url: f.filename })),
      };
    }

    const car = await prisma.car.create({ data: carData, include: { images: true } });
    res.status(201).json({ car });
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Invalid request" });
  }
};

export const updateCar = async (req: any, res: Response) => {
  try {
    const existingCar = await prisma.car.findUnique({
      where: { id: req.params.id as string },
    });
    if (!existingCar) {
      return res.status(404).json({ error: "Car not found" });
    }

    if (req.user.role === Role.AGENT && existingCar.ownerId !== req.user.id) {
      return res.status(403).json({ error: "You can only manage your own cars" });
    }

    const payload = updateCarSchema.parse(req.body);
    const files = req.files as Express.Multer.File[];

    const carData: any = {
      ...payload,
    };

    if (files && files.length > 0) {
      carData.images = {
        create: files.map((f: Express.Multer.File) => ({ url: f.filename })),
      };
    }

    const car = await prisma.car.update({
      where: { id: req.params.id as string },
      data: carData,
      include: { images: true },
    });
    res.json({ car });
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Invalid request" });
  }
};

export const deleteCar = async (req: any, res: Response) => {
  const existingCar = await prisma.car.findUnique({
    where: { id: req.params.id as string },
  });

  if (!existingCar) {
    return res.status(404).json({
      message: "the car not found",
      success: false,
    });
  }

  if (req.user.role === Role.AGENT && existingCar.ownerId !== req.user.id) {
    return res.status(403).json({ error: "You can only manage your own cars" });
  }

  await prisma.car.delete({
    where: { id: req.params.id as string },
  });

  res.status(204).json({
    message: "the car deleted successfully",
    success: true,
  });
};

export const listMyCars = async (req: any, res: Response) => {
  const query = fleetQuerySchema.parse(req.query);
  const { page, limit } = query;
  const where: any = { ownerId: req.user.id };

  const [cars, total] = await Promise.all([
    prisma.car.findMany({
      where,
      include: { images: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [query.sortBy]: query.sortOrder },
    }),
    prisma.car.count({ where }),
  ]);

  res.json({
    cars,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
};

