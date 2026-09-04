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
  console.log(`[reset] Using DATABASE_URL from env (ssl=${Boolean(sslMatch)})`);
} else {
  pool = new Pool({
    host: process.env.PGHOST || 'localhost',
    port: Number(process.env.PGPORT || 5432),
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || '17210535Rohan',
    database: process.env.PGDATABASE || 'mkprinting',
  });
  console.log('[reset] Using local PostgreSQL credentials');
}

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function reset() {
  const targetEmail = 'admin@mkprinting.com';
  const passwordHash = await bcrypt.hash('Admin@123!', 10);

  const existing = await prisma.user.findUnique({ where: { email: targetEmail } });
  if (!existing) {
    console.log(`⚠️  User ${targetEmail} not found — run inject-admin.js first`);
    return;
  }

  await prisma.user.update({
    where: { email: targetEmail },
    data: { passwordHash, status: 'ACTIVE' },
  });
  console.log('✅ Password successfully reset to Admin@123! (and status set ACTIVE) for ' + targetEmail);
}

reset()
  .catch((err) => {
    console.error('❌ reset failed:', err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
