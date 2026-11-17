import { defineConfig } from "@prisma/config";
import "dotenv/config";

const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.HENADB_PRISMA_DATABASE_URL ||
  process.env.HENADB_DATABASE_URL_POOLED ||
  process.env.HENADB_DATABASE_URL ||
  process.env.HENADB_POSTGRES_URL;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});

