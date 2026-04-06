// prisma/seed-admin.ts
import bcrypt from "bcrypt";
import { prisma } from "./prisma";



if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
  throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
}

const ADMINS = [
  {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  },
];


export async function main() {
  for (const admin of ADMINS) {
    const existing = await prisma.user.findUnique({
      where: { email: admin.email },
    });

    if (!existing) {
      const hashed = await bcrypt.hash(admin.password, 10);

      await prisma.user.create({
        data: {
          name: "admin",
          email: admin.email,
          password: hashed,
          role: "ADMIN",
        },
      });

      console.log(`✅ Created admin: ${admin.email}`);
    } else {
      console.log(`⚡ Admin exists: ${admin.email}`);
    }
  }
}

