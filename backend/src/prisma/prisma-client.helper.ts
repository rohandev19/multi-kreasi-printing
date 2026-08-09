import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

let prismaInstance: PrismaClient | null = null;

export function createPrismaClient(): PrismaClient {
  if (prismaInstance) return prismaInstance;

  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'mkprinting',
    max: parseInt(process.env.DB_POOL_MAX || '20', 10),
    idleTimeoutMillis: 30000,
  });
  const adapter = new PrismaPg(pool);
  prismaInstance = new PrismaClient({ adapter });
  return prismaInstance;
}
