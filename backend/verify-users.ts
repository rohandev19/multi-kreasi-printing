import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.user.updateMany({
    data: { emailVerified: true },
  });
  console.log('All users verified');
}

main().catch(console.error).finally(async () => {
  await prisma.$disconnect();
});
