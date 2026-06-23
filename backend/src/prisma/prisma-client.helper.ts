import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

let prismaInstance: PrismaClient | null = null;

export function createPrismaClient(): PrismaClient {
  if (prismaInstance) return prismaInstance;

  // Direct connection config to avoid URL parsing issues with special characters
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '17210535Rohan',
    database: 'mkprinting',
    max: 20,
    idleTimeoutMillis: 30000,
  });
  const adapter = new PrismaPg(pool);
  prismaInstance = new PrismaClient({ adapter });
  return prismaInstance;
}
