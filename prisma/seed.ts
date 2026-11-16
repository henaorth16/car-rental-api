import dotenv from "dotenv";
dotenv.config();

import { prisma } from "../src/config/prisma";
import { auth } from "../src/modules/auth/auth";
import { Role } from "@prisma/client";

async function main() {
  console.log("🌱 Starting Car Rental Platform database seeding...");

  // 1. Seed Accounts
  const usersToSeed = [
    {
      name: "System Administrator",
      email: process.env.ADMIN_EMAIL || "admin@example.com",
      password: process.env.ADMIN_PASSWORD || "pass@123",
      role: Role.ADMIN,
      phone: "+251 91 100 0001",
      address: "Bole Medhanialem, Addis Ababa",
    },
    {
      name: "Elite Motors Agent",
      email: "agent@example.com",
      password: "password123",
      role: Role.AGENT,
      phone: "+251 91 200 0002",
      address: "Kazanchis, Addis Ababa",
      businessName: "Elite Fleet & Luxury Motors",
      businessPhone: "+251 11 500 0002",
      officeAddress: "Kazanchis Business Center, 4th Floor",
    },
    {
      name: "Customer Henok",
      email: "user@example.com",
      password: "password123",
      role: Role.USER,
      phone: "+251 91 300 0003",
      address: "Old Airport, Addis Ababa",
    },
  ];

  const createdUserMap: Record<string, any> = {};

  for (const u of usersToSeed) {
    let existingUser = await prisma.user.findUnique({
      where: { email: u.email },
    });

    if (!existingUser) {
      try {
        await auth.api.signUpEmail({
          body: {
            name: u.name,
            email: u.email,
            password: u.password,
          },
        });
      } catch (err: any) {
        console.warn(`Note on auth signup for ${u.email}:`, err.message || err);
      }

      existingUser = await prisma.user.findUnique({
        where: { email: u.email },
      });
    }

    if (existingUser) {
      existingUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          role: u.role,
          phoneNumber: u.phone,
          address: u.address,
          ...(u.businessName
            ? {
                agentProfile: {
                  upsert: {
                    create: {
                      businessName: u.businessName,
                      businessPhone: u.businessPhone,
                      officeAddress: u.officeAddress,
                    },
                    update: {
                      businessName: u.businessName,
                      businessPhone: u.businessPhone,
                      officeAddress: u.officeAddress,
                    },
                  },
                },
              }
            : {}),
        },
      });
      console.log(`✅ Seeded user: ${u.email} [${u.role}]`);
      createdUserMap[u.role] = existingUser;
    }
  }

  const agentUser = createdUserMap[Role.AGENT] || createdUserMap[Role.ADMIN];
  const customerUser = createdUserMap[Role.USER];

  // 2. Seed Fleet Vehicles
  const fleetData = [
    {
      brand: "Mercedes-Benz",
      model: "C-Class AMG Line",
      type: "Luxury",
      fuelType: "PETROL" as const,
      transmission: "AUTOMATIC" as const,
      description:
        "High-performance luxury sedan equipped with premium leather interior, ambient lighting, panoramic sunroof, and state-of-the-art driver assistance systems.",
      seats: 5,
      doors: 4,
      color: "Obsidian Black",
      pricePerDay: 4500,
      available: true,
      imageFile: "luxury.jpg",
    },
    {
      brand: "Toyota",
      model: "RAV4 Hybrid AWD",
      type: "SUV",
      fuelType: "HYBRID" as const,
      transmission: "AUTOMATIC" as const,
      description:
        "Capable, ultra-efficient all-wheel-drive SUV ideal for city commutes and long-distance road trips across diverse terrains.",
      seats: 5,
      doors: 4,
      color: "Silver Metallic",
      pricePerDay: 2800,
      available: true,
      imageFile: "suv.jpg",
    },
    {
      brand: "Tesla",
      model: "Model Y Long Range",
      type: "Electric",
      fuelType: "ELECTRIC" as const,
      transmission: "AUTOMATIC" as const,
      description:
        "Zero-emission all-electric crossover with instant torque, dual-motor AWD, expansive glass roof, and cutting-edge touchscreen infotainment.",
      seats: 5,
      doors: 4,
      color: "Pearl White",
      pricePerDay: 3600,
      available: true,
      imageFile: "electric.jpg",
    },
    {
      brand: "Toyota",
      model: "Corolla 2024",
      type: "Sedan",
      fuelType: "PETROL" as const,
      transmission: "AUTOMATIC" as const,
      description:
        "The world's most reliable compact sedan. Smooth handling, excellent fuel economy, and ample luggage space for stress-free travel.",
      seats: 5,
      doors: 4,
      color: "Glacier White",
      pricePerDay: 1500,
      available: true,
      imageFile: "sedan.jpg",
    },
    {
      brand: "Hyundai",
      model: "Tucson Ultimate",
      type: "SUV",
      fuelType: "PETROL" as const,
      transmission: "AUTOMATIC" as const,
      description:
        "Modern sculpted crossover offering bold styling, spacious legroom, multi-zone climate control, and digital cockpit navigation.",
      seats: 5,
      doors: 4,
      color: "Titan Gray",
      pricePerDay: 2300,
      available: true,
      imageFile: "suv.jpg",
    },
    {
      brand: "BMW",
      model: "5-Series Executive",
      type: "Luxury",
      fuelType: "PETROL" as const,
      transmission: "AUTOMATIC" as const,
      description:
        "Refined executive sedan with sport-tuned suspension, Harman Kardon audio, and supreme high-speed comfort.",
      seats: 5,
      doors: 4,
      color: "Mineral White",
      pricePerDay: 5200,
      available: true,
      imageFile: "luxury.jpg",
    },
    {
      brand: "Audi",
      model: "e-tron Sportback",
      type: "Electric",
      fuelType: "ELECTRIC" as const,
      transmission: "AUTOMATIC" as const,
      description:
        "Futuristic electric luxury vehicle combining aerodynamic coupe styling with SUV versatility and rapid acceleration.",
      seats: 5,
      doors: 4,
      color: "Daytona Gray",
      pricePerDay: 4800,
      available: true,
      imageFile: "electric.jpg",
    },
    {
      brand: "Honda",
      model: "Civic Sport",
      type: "Sedan",
      fuelType: "PETROL" as const,
      transmission: "MANUAL" as const,
      description:
        "Engaging manual sedan with sporty handling, Apple CarPlay, and responsive turbocharged powertrain.",
      seats: 5,
      doors: 4,
      color: "Rallye Red",
      pricePerDay: 1400,
      available: true,
      imageFile: "sedan.jpg",
    },
  ];

  let firstCarId: string | null = null;

  for (const car of fleetData) {
    const existingCar = await prisma.car.findFirst({
      where: { brand: car.brand, model: car.model },
    });

    if (!existingCar) {
      const created = await prisma.car.create({
        data: {
          brand: car.brand,
          model: car.model,
          type: car.type,
          fuelType: car.fuelType,
          transmission: car.transmission,
          description: car.description,
          seats: car.seats,
          doors: car.doors,
          color: car.color,
          pricePerDay: car.pricePerDay,
          available: car.available,
          ownerId: agentUser?.id,
          images: {
            create: [{ url: car.imageFile }],
          },
        },
      });
      console.log(`🚗 Seeded car: ${car.brand} ${car.model} (${car.type})`);
      if (!firstCarId) firstCarId = created.id;
    } else {
      if (!firstCarId) firstCarId = existingCar.id;
      // Ensure image exists
      const hasImage = await prisma.carImage.findFirst({
        where: { carId: existingCar.id },
      });
      if (!hasImage) {
        await prisma.carImage.create({
          data: { carId: existingCar.id, url: car.imageFile },
        });
      }
    }
  }

  // 3. Seed Sample Booking for user@example.com
  if (customerUser && firstCarId) {
    const existingBooking = await prisma.booking.findFirst({
      where: { userId: customerUser.id },
    });

    if (!existingBooking) {
      const startDate = new Date(Date.now() + 86400000); // Tomorrow
      const endDate = new Date(Date.now() + 86400000 * 4); // In 4 days
      const days = 3;
      const firstCar = await prisma.car.findUnique({ where: { id: firstCarId } });
      const amount = (firstCar?.pricePerDay || 2000) * days;

      const newBooking = await prisma.booking.create({
        data: {
          userId: customerUser.id,
          carId: firstCarId,
          startDate,
          endDate,
          status: "CONFIRMED",
          payment: {
            create: {
              amount,
              method: "polar_checkout",
              status: "SUCCESS",
            },
          },
        },
      });

      console.log(`📋 Seeded confirmed reservation: ${newBooking.id} for ${customerUser.email}`);
    }
  }

  console.log("✨ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
