import { Request, Response } from "express";
import { prisma } from "../../config/prisma";

export const getMe = async (req: any, res: Response) => {
  res.json({ user: req.user });
};

export const listUsers = async (req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  res.json({ users });
};
