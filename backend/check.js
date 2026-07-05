const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '17210535Rohan',
  database: 'mkprinting',
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'admin@mkprinting.com' } });
  console.log(user);
}

main().finally(() => prisma.$disconnect());
