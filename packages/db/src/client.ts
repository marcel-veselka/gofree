import { PrismaClient } from '@prisma/client';

let db: PrismaClient;

// Use Neon serverless adapter on Vercel (no binary engine needed)
if (process.env.VERCEL) {
  const { Pool, neonConfig } = require('@neondatabase/serverless') as typeof import('@neondatabase/serverless');
  const { PrismaNeon } = require('@prisma/adapter-neon') as typeof import('@prisma/adapter-neon');

  neonConfig.fetchConnectionCache = true;
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaNeon(pool);

  const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
  db = globalForPrisma.prisma ?? new PrismaClient({ adapter } as any);
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
} else {
  // Standard binary engine for local dev
  const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
  db = globalForPrisma.prisma ?? new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
}

export { db };
