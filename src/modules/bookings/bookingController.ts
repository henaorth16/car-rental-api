import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { Role } from "@prisma/client";

const bookingSchema = z.object({
  carId: z.string().uuid(),
  startDate: z
    .string()
    .refine((d) => !Number.isNaN(Date.parse(d)), { message: "Invalid date" }),
  endDate: z
    .string()
    .refine((d) => !Number.isNaN(Date.parse(d)), { message: "Invalid date" }),
});

export const createBooking = async (req: any, res: Response) => {
  try {
    const payload = bookingSchema.parse(req.body);
    const startDate = new Date(payload.startDate);
    const endDate = new Date(payload.endDate);

    if (endDate <= startDate) {
      return res
        .status(400)
        .json({ error: "End date must be after start date" });
    }

    // Check car existence
    const car = await prisma.car.findUnique({ where: { id: payload.carId } });
    if (!car || !car.available) {
      return res.status(404).json({ error: "Car not available" });
    }

    // Prevent overlapping bookings
    const overlap = await prisma.booking.findFirst({
      where: {
        carId: payload.carId,
        status: "CONFIRMED",
        AND: [{ startDate: { lte: endDate } }, { endDate: { gte: startDate } }],
      },
    });

    if (overlap) {
      return res
        .status(409)
        .json({ error: "Car already booked for the selected period" });
    }

    const booking = await prisma.booking.create({
      data: {
        userId: req.user.id,
        carId: payload.carId,
        startDate,
        endDate,
        status: "PENDING",
      },
    });

    res.status(201).json({ booking });
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Invalid request" });
  }
};

const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export const getMyBookings = async (req: any, res: Response) => {
  const query = paginationQuerySchema.parse(req.query);
  const { page, limit } = query;

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where: { userId: req.user.id },
      include: { car: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.booking.count({ where: { userId: req.user.id } }),
  ]);

  res.json({
    bookings,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
};

export const cancelBooking = async (req: any, res: Response) => {
  const booking = await prisma.booking.findUnique({
    where: { id: req.params.id as string },
  });

  if (!booking) {
    return res.status(404).json({ error: "Booking not found" });
  }

  if (booking.userId !== req.user.id) {
    return res
      .status(403)
      .json({ error: "You can only cancel your own bookings" });
  }

  if (booking.status === "CANCELLED") {
    return res.status(400).json({ error: "Booking already cancelled" });
  }

  const updated = await prisma.booking.update({
    where: { id: req.params.id as string },
    data: { status: "CANCELLED" },
  });

  res.json({ booking: updated });
};

export async function editBookings(req:Request, res:Response) {
  const {data} =await req.body;

  console.log(data)
}

export const getAgentBookings = async (req: any, res: Response) => {
  const query = paginationQuerySchema.parse(req.query);
  const { page, limit } = query;

  const where =
    req.user.role === Role.ADMIN
      ? {}
      : {
          car: {
            ownerId: req.user.id,
          },
        };

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: {
        car: true,
        user: {
          select: { id: true, name: true, email: true },
        },
        payment: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.booking.count({ where }),
  ]);

  res.json({
    bookings,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
};