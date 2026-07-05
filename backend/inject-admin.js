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

async function injectAdmin() {
  const defaultEmail = 'admin@mkprinting.com';
  const existingAdmin = await prisma.user.findUnique({ where: { email: defaultEmail } });
  
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('Admin@123!', 10);
    await prisma.user.create({
      data: {
        email: defaultEmail,
        passwordHash,
        fullName: 'System Owner',
        role: {
          connectOrCreate: {
            where: { name: 'Owner' },
            create: { name: 'Owner', displayName: 'System Owner', description: 'Full system access', permissions: ['*'] }
          }
        },
        isActive: true,
      },
    });
    console.log('Successfully injected admin user!');
  } else {
    console.log('Admin user already exists.');
  }
}

injectAdmin().catch(console.error).finally(() => prisma.$disconnect());
