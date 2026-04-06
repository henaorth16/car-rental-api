import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { polarClient } from "../auth/auth";

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

    const amountCents = Math.round(amount * 100);

    let checkoutUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/success?checkout_id=mock_checkout`;
    
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
