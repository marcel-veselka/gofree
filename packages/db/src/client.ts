import { PrismaClient } from '@prisma/client';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';

// Configure WebSocket for Neon serverless (required in Node.js runtime)
neonConfig.webSocketConstructor = ws;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createClient(): PrismaClient {
  const dbUrl = process.env.DATABASE_URL ?? '';

  // Use Neon serverless driver for Neon databases (no binary engine needed)
  if (dbUrl.includes('neon.tech')) {
    const pool = new Pool({ connectionString: dbUrl });
    const adapter = new PrismaNeon(pool as any);
    return new PrismaClient({ adapter } as any);
  }

  // Standard binary engine for local PostgreSQL
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}
