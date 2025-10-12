// lib/prisma.ts

import { PrismaClient } from '@prisma/client'

// Use a global variable to store the PrismaClient instance
// This is done to prevent creating new instances on every hot reload in development
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    // Optional: Add logging for better debugging
    // log: ['query', 'error', 'warn'], 
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma