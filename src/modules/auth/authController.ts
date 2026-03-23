import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../../config/prisma";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const signToken = (user: { id: string; role: string }) => {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });
};

export const register = async (req: Request, res: Response) => {
  try {
    const payload = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: payload.email },
    });
    if (existingUser) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(payload.password, 12);
    const user = await prisma.user.create({
      data: { ...payload, password: hashedPassword },
    });

    const token = signToken(user);

    res
      .status(201)
      .json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      });
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Invalid request" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const payload = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: payload.email },
    });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const isValid = await bcrypt.compare(payload.password, user.password);
    if (!isValid) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = signToken(user);
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Invalid request" });
  }
};

export const me = async (req: any, res: Response) => {
  const user = req.user;
  res.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
};
