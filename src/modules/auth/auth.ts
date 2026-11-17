import { betterAuth, BetterAuthOptions } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "../../config/prisma";
import { polar, checkout, webhooks } from "@polar-sh/better-auth";
import { Polar } from "@polar-sh/sdk";
import { customSession } from "better-auth/plugins";

const findUserRoles = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user) {
    return [];
  }

  return [user.role];
};

export const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  server: "sandbox",
});
//@ts-ignore
export const auth: ReturnType<typeof betterAuth> = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: [
    "http://localhost:3000",
    process.env.FRONTEND_URL || "",
    "https://*.vercel.app",
  ].filter(Boolean),
  socialProviders: {
    // Add social providers if needed
  },
  plugins: [
    customSession(async ({ user, session }) => {
      const userId = session.userId ?? user?.id;
      const roles = userId ? await findUserRoles(userId) : [];
      const role = roles[0] ?? "USER";

      return {
        user: {
          ...user,
          role,
        },
        session: {
          ...session,
          custom: {
            role,
            roles,
          },
        },
      };
    }),
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
