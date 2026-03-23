import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma";

const paymentSchema = z.object({
  bookingId: z.string().uuid(),
  method: z.string().min(1),
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

    // Simulate payment processing
    const payment = await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount,
        method: payload.method,
        status: "SUCCESS",
      },
    });

    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: "CONFIRMED" },
    });

    res.status(201).json({ payment });
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Invalid request" });
  }
};
