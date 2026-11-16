import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import fs from "fs";
import path from "path";

let dbUrl = process.env.DATABASE_URL || "file:./dev.db";

if (process.env.VERCEL && dbUrl.startsWith("file:")) {
  const tmpDbPath = path.join("/tmp", "dev.db");
  if (!fs.existsSync(tmpDbPath)) {
    const bundledDbPath = path.join(process.cwd(), "dev.db");
    const prismaDbPath = path.join(process.cwd(), "prisma", "dev.db");
    if (fs.existsSync(bundledDbPath)) {
      try {
        fs.copyFileSync(bundledDbPath, tmpDbPath);
      } catch (e) {
        console.error("Failed to copy bundled dev.db to /tmp:", e);
      }
    } else if (fs.existsSync(prismaDbPath)) {
      try {
        fs.copyFileSync(prismaDbPath, tmpDbPath);
      } catch (e) {
        console.error("Failed to copy prisma/dev.db to /tmp:", e);
      }
    }
  }
  dbUrl = `file:${tmpDbPath}`;
}

const adapter = new PrismaBetterSqlite3({
  url: dbUrl,
});

export const prisma = new PrismaClient({
  adapter,
});
