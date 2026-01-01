import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const roles = [
    { name: 'Owner', displayName: 'System Owner', description: 'Full system access', permissions: ['*'] },
    { name: 'Manager', displayName: 'Manager', description: 'Store and operational management', permissions: ['manage:users', 'manage:orders', 'view:reports'] },
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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
