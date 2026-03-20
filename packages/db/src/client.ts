import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createClient(): PrismaClient {
  const dbUrl = process.env.DATABASE_URL ?? '';

  // Use Neon serverless adapter for Neon databases (works on Vercel without binary engine)
  if (dbUrl.includes('neon.tech')) {
    const { Pool } = require('@neondatabase/serverless');
    const { PrismaNeon } = require('@prisma/adapter-neon');

    const pool = new Pool({ connectionString: dbUrl });
    const adapter = new PrismaNeon(pool);

    return new PrismaClient({ adapter } as any);
  }

  // Standard binary engine for local dev (PostgreSQL)
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}
