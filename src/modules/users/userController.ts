import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { Role } from "@prisma/client";
import { z } from "zod";

const registerAgentSchema = z.object({
  businessName: z.string().min(2),
  businessPhone: z.string().optional(),
  officeAddress: z.string().optional(),
});

export const getMe = async (req: any, res: Response) => {
  res.json({ user: req.user });
};

export const registerAgent = async (req: any, res: Response) => {
  try {
    const payload = registerAgentSchema.parse(req.body);

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        role: Role.AGENT,
        agentProfile: {
          upsert: {
            create: payload,
            update: payload,
          },
        },
      },
      select: { id: true, name: true, email: true, role: true, agentProfile: true },
    });

    res.json({
      user: updatedUser,
      message: "You are now registered as an agent. Use Better Auth login as usual.",
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Invalid request" });
  }
};

export const listUsers = async (req: any, res: Response) => {
  const users =
    req.user.role === Role.ADMIN
      ? await prisma.user.findMany({
          select: { id: true, name: true, email: true, role: true, createdAt: true },
          orderBy: { createdAt: "desc" },
        })
      : await prisma.user.findMany({
          where: {
            bookings: {
              some: {
                car: {
                  ownerId: req.user.id,
                },
              },
            },
          },
          select: { id: true, name: true, email: true, role: true, createdAt: true },
          orderBy: { createdAt: "desc" },
        });

  res.json({ users });
};
