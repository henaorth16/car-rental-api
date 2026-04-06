import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "../../config/prisma";
import { polar, checkout, webhooks } from "@polar-sh/better-auth";
import { Polar } from "@polar-sh/sdk";

export const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN || "sandbox",
  server: "sandbox",
});

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "sqlite",
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: ["http://localhost:3000"],
  socialProviders: {
    // Add social providers if needed
  },
  plugins: [
    polar({
      client: polarClient,
      createCustomersOnSignUp: true,
      use: [
        checkout({
          successUrl: "/success?checkout_id={CHECKOUT_ID}",
          authenticatedUsersOnly: true,
        }),
        webhooks({
          secret: process.env.POLAR_WEBHOOK_SECRET || "dummy_secret",
          onOrderPaid: async (payload: any) => {
            const bookingId = payload.data?.metadata?.bookingId;
            if (bookingId && typeof bookingId === "string") {
              await prisma.payment.create({
                data: {
                  bookingId: bookingId,
                  amount: payload.data.amount / 100,
                  method: "polar",
                  status: "SUCCESS",
                },
              });
              await prisma.booking.update({
                where: { id: bookingId },
                data: { status: "CONFIRMED" },
              });
            }
          },
        }),
      ],
    }),
  ],
});
