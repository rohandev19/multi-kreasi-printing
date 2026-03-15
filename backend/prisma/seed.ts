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

  // Create a default Customer user for testing
  const customerRole = await prisma.role.findUnique({ where: { name: 'Customer' } });
  if (customerRole) {
    const customerEmail = 'customer@example.com';
    const existingCustomer = await prisma.user.findUnique({ where: { email: customerEmail } });
    
    if (!existingCustomer) {
      const passwordHash = await bcrypt.hash('Customer@123!', 10);
      await prisma.user.create({
        data: {
          email: customerEmail,
          passwordHash,
          fullName: 'Test Customer',
          roleId: customerRole.id,
          status: 'ACTIVE',
        },
      });
      console.log('Default customer created: customer@example.com / Customer@123!');
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
