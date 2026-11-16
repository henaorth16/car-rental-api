import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { Role } from "@prisma/client";
import { z } from "zod";

const registerAgentSchema = z.object({
  businessName: z.string().min(2),
  businessPhone: z.string().optional(),
  officeAddress: z.string().optional(),
});

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
});

export const getMe = async (req: any, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phoneNumber: true,
      address: true,
      image: true,
      createdAt: true,
      agentProfile: true,
      _count: {
        select: { bookings: true, ownedCars: true },
      },
    },
  });
  res.json({ user: user || req.user });
};

export const updateProfile = async (req: any, res: Response) => {
  try {
    const payload = updateProfileSchema.parse(req.body);
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: payload,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phoneNumber: true,
        address: true,
        image: true,
        createdAt: true,
        agentProfile: true,
      },
    });
    res.json({ user: updatedUser, message: "Profile updated successfully." });
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Invalid request" });
  }
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
  const select = {
    id: true,
    name: true,
    email: true,
    role: true,
    phoneNumber: true,
    address: true,
    createdAt: true,
    _count: {
      select: { bookings: true, ownedCars: true },
    },
  };

  const users =
    req.user.role === Role.ADMIN
      ? await prisma.user.findMany({
          select,
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
          select,
          orderBy: { createdAt: "desc" },
        });

  res.json({ users });
};
