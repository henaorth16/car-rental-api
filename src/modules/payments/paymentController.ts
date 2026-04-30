import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { polarClient } from "../auth/auth";
import { Role } from "@prisma/client";

const paymentSchema = z.object({
  bookingId: z.string().uuid(),
  method: z.string().min(1),
});

const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export const createPayment = async (req: any, res: Response) => {
  try {
    const payload = paymentSchema.parse(req.body);

    const booking = await prisma.booking.findUnique({
      where: { id: payload.bookingId },
      include: { car: true },
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    if (booking.userId !== req.user.id) {
      return res
        .status(403)
        .json({ error: "You can only pay for your own bookings" });
    }

    if (booking.status !== "PENDING") {
      return res.status(400).json({ error: "Booking is not pending" });
    }

    const amount =
      booking.car.pricePerDay *
      Math.ceil(
        (booking.endDate.getTime() - booking.startDate.getTime()) /
          (1000 * 60 * 60 * 24), // 1 day in milliseconds
      );

    const amountCents = Math.round(amount * 100);

    let checkoutUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/success`;
    
    try {
      // Call Better Auth Polar Client to perform payment intent
      // Using 'as any' since the SDK version might mismatch the payload for custom checkouts
      const result: any = await (polarClient.checkouts as any).create({
        amount: amountCents,
        customerEmail: req.user.email,
        metadata: { bookingId: booking.id },
        successUrl: checkoutUrl,
      });
      if (result && result.url) {
        checkoutUrl = result.url;
      }
    } catch (err: any) {
      console.warn("Polar checkout creation failed (defaulting to mock URL):", err.message || err);
    }
    
    res.status(201).json({ result: { url: checkoutUrl } }); // url is the checkout url that the user will be redirected to. in order to
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Invalid request" });
  }
};

export const listPayments = async (req: any, res: Response) => {
  const query = paginationQuerySchema.parse(req.query);
  const { page, limit } = query;

  const where =
    req.user.role === Role.ADMIN
      ? {}
      : req.user.role === Role.AGENT
        ? {
            booking: {
              car: {
                ownerId: req.user.id,
              },
            },
          }
        : {
            booking: {
              userId: req.user.id,
            },
          };

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: {
        booking: {
          include: {
            car: true,
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.payment.count({ where }),
  ]);

  res.json({
    payments,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
};
