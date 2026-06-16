import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

function createPrismaClient() {
  try {
    return new PrismaClient()
  } catch {
    if (process.env.NODE_ENV === "production" && !process.env.DATABASE_URL) {
      console.warn("DATABASE_URL not set — Prisma client will fail at runtime")
    }
    return null as unknown as PrismaClient
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
