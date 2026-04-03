import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: connectionString?.replace(
    "sslmode=require",
    "sslmode=no-verify",
  ),
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
