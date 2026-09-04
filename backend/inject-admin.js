const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const DATABASE_URL = process.env.DATABASE_URL;

let pool;
if (DATABASE_URL) {
  const sslMatch = DATABASE_URL.includes('amazonaws.com') || DATABASE_URL.includes('neon.tech') || process.env.PG_REQUIRE_SSL === 'true';
  pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: sslMatch ? { rejectUnauthorized: false } : undefined,
  });
  console.log(`[inject-admin] Using DATABASE_URL from env (ssl=${Boolean(sslMatch)})`);
} else {
  pool = new Pool({
    host: process.env.PGHOST || 'localhost',
    port: Number(process.env.PGPORT || 5432),
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || '17210535Rohan',
    database: process.env.PGDATABASE || 'mkprinting',
  });
  console.log('[inject-admin] Using local PostgreSQL credentials');
}

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function injectAdmin() {
  const defaultEmail = 'admin@mkprinting.com';
  const defaultPassword = 'Admin@123!';

  const existingAdmin = await prisma.user.findUnique({ where: { email: defaultEmail } });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(defaultPassword, 10);
    await prisma.user.create({
      data: {
        email: defaultEmail,
        passwordHash,
        fullName: 'System Owner',
        status: 'ACTIVE',
        role: {
          connectOrCreate: {
            where: { name: 'Owner' },
            create: { name: 'Owner', displayName: 'System Owner', description: 'Full system access', permissions: ['*'] }
          }
        },
      },
    });
    console.log(`✅ Successfully created admin user: ${defaultEmail} / ${defaultPassword}`);
  } else {
    console.log(`ℹ️ Admin user ${defaultEmail} already exists (id=${existingAdmin.id}, status=${existingAdmin.status}). Run reset.js to reset password.`);
  }
}

injectAdmin()
  .catch((err) => {
    console.error('❌ inject-admin failed:', err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
