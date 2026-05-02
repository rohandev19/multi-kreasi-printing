import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const roles = [
    { name: 'Owner', displayName: 'System Owner', description: 'Full system access', permissions: ['*'] },
    { name: 'Manager', displayName: 'Manager', description: 'Store and operational management', permissions: ['manage:users', 'manage:orders', 'view:reports'] },
    { name: 'Sales', displayName: 'Sales Staff', description: 'Handles sales and customer relations', permissions: ['manage:orders', 'view:customers'] },
    { name: 'Designer', displayName: 'Designer', description: 'Handles design assets', permissions: ['manage:designs', 'view:orders'] },
    { name: 'Production_Staff', displayName: 'Production Staff', description: 'Handles printing and production', permissions: ['manage:production', 'view:orders'] },
    { name: 'Warehouse_Staff', displayName: 'Warehouse Staff', description: 'Handles stock and materials', permissions: ['manage:inventory', 'view:orders'] },
    { name: 'Finance_Staff', displayName: 'Finance Staff', description: 'Handles payments and invoices', permissions: ['manage:finance', 'view:orders'] },
    { name: 'Customer', displayName: 'Customer', description: 'Standard user/customer', permissions: ['view:own_orders', 'create:order'] },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: {
        name: role.name,
        displayName: role.displayName,
        description: role.description,
        permissions: role.permissions,
      },
    });
  }

  // Create a default Owner user if none exists
  const ownerRole = await prisma.role.findUnique({ where: { name: 'Owner' } });
  if (ownerRole) {
    const defaultEmail = 'admin@mkprinting.com';
    const existingAdmin = await prisma.user.findUnique({ where: { email: defaultEmail } });
    
    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash('Admin@123!', 10);
      await prisma.user.create({
        data: {
          email: defaultEmail,
          passwordHash,
          fullName: 'System Owner',
          roleId: ownerRole.id,
          status: 'ACTIVE',
        },
      });
      console.log('Default admin created: admin@mkprinting.com / Admin@123!');
    }
  }

  const testUsers = [
    { name: 'Manager', email: 'manager@mkprinting.com', pass: 'Manager@123!' },
    { name: 'Sales', email: 'sales@mkprinting.com', pass: 'Sales@123!' },
    { name: 'Designer', email: 'designer@mkprinting.com', pass: 'Designer@123!' },
    { name: 'Production_Staff', email: 'production@mkprinting.com', pass: 'Production@123!' },
    { name: 'Warehouse_Staff', email: 'warehouse@mkprinting.com', pass: 'Warehouse@123!' },
    { name: 'Finance_Staff', email: 'finance@mkprinting.com', pass: 'Finance@123!' },
    { name: 'Customer', email: 'customer@example.com', pass: 'Customer@123!' },
  ];

  for (const user of testUsers) {
    const role = await prisma.role.findUnique({ where: { name: user.name } });
    if (role) {
      const existingUser = await prisma.user.findUnique({ where: { email: user.email } });
      if (!existingUser) {
        const passwordHash = await bcrypt.hash(user.pass, 10);
        await prisma.user.create({
          data: {
            email: user.email,
            passwordHash,
            fullName: `Test ${user.name.replace('_', ' ')}`,
            roleId: role.id,
            status: 'ACTIVE',
          },
        });
        console.log(`Default ${user.name} created: ${user.email} / ${user.pass}`);
      }
    }
  }

  // Create sample customer company
  const existingCompany = await prisma.customer.findFirst({
    where: { email: 'info@tokoabc.com' }
  });

  if (!existingCompany) {
    await prisma.customer.create({
      data: {
        companyName: 'Toko ABC',
        email: 'info@tokoabc.com',
        phone: '081234567890',
        address: 'Jl. Contoh No. 123, Jakarta',
        loyaltyTier: 'Bronze',
      },
    });
    console.log('Sample customer company created');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
