import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

export function createPrismaClient(): PrismaClient {
  // Direct connection config to avoid URL parsing issues with special characters
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '17210535Rohan',
    database: 'mkprinting',
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}
