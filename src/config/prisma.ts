import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

export function getDatabaseUrl(): string {
  const url =
    process.env.DATABASE_URL ||
    process.env.HENADB_POSTGRES_URL ||
    process.env.HENADB_DATABASE_URL_POOLED ||
    process.env.HENADB_DATABASE_URL ||
    process.env.HENADB_PRISMA_DATABASE_URL ||
    "";

  if (url.startsWith("prisma+postgres://")) {
    return url.replace("prisma+postgres://", "postgres://");
  }

  return url;
}

const connectionString = getDatabaseUrl();
const isLocal =
  connectionString.includes("localhost") ||
  connectionString.includes("127.0.0.1");

const pool = new pg.Pool(
  connectionString
    ? {
        connectionString,
        ssl: isLocal ? false : { rejectUnauthorized: false },
      }
    : undefined
);

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({
  adapter,
});
