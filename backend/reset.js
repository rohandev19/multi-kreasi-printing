const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '17210535Rohan',
  database: 'mkprinting',
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function reset() {
  const passwordHash = await bcrypt.hash('Admin@123!', 10);
  await prisma.user.update({
    where: { email: 'admin@mkprinting.com' },
    data: { passwordHash, status: 'ACTIVE' }
  });
  console.log('Password successfully reset to Admin@123!');
}

reset().finally(() => prisma.$disconnect());
