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

  // Create Categories
  const categoriesData = [
    { name: 'Business Cards', description: 'Professional business cards' },
    { name: 'Banners', description: 'Indoor and outdoor banners' },
    { name: 'Marketing', description: 'Brochures, flyers, and marketing materials' },
    { name: 'Stickers', description: 'Custom die-cut stickers and labels' },
  ];

  const createdCategories = [];
  for (const cat of categoriesData) {
    const existingCat = await prisma.category.findFirst({ where: { name: cat.name } });
    if (!existingCat) {
      const newCat = await prisma.category.create({ data: cat });
      createdCategories.push(newCat);
    } else {
      createdCategories.push(existingCat);
    }
  }

  // Create Products
  const productsData = [
    {
      sku: 'BC-PREM-01',
      name: 'Premium Business Cards',
      description: '300gsm matte finish with double-sided printing. Box of 100.',
      categoryName: 'Business Cards',
      basePrice: 150000,
      unitOfMeasure: 'Box',
      imageUrl: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    },
    {
      sku: 'BN-IND-01',
      name: 'Indoor Vinyl Banner',
      description: 'High-resolution indoor banner. Price per square meter.',
      categoryName: 'Banners',
      basePrice: 85000,
      unitOfMeasure: 'SqMeter',
      imageUrl: 'https://images.unsplash.com/photo-1559223607-a43c990c692c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    },
    {
      sku: 'MK-BRO-01',
      name: 'Corporate Brochure',
      description: 'A4 tri-fold brochure on glossy paper. Pack of 50.',
      categoryName: 'Marketing',
      basePrice: 250000,
      unitOfMeasure: 'Pack',
      imageUrl: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    },
    {
      sku: 'ST-CUS-01',
      name: 'Custom Stickers',
      description: 'Die-cut vinyl stickers. Minimum order 100 pcs.',
      categoryName: 'Stickers',
      basePrice: 1500,
      unitOfMeasure: 'Piece',
      imageUrl: 'https://images.unsplash.com/photo-1626242557434-b2df76a0845a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    },
  ];

  for (const prod of productsData) {
    const existingProd = await prisma.product.findUnique({ where: { sku: prod.sku } });
    if (!existingProd) {
      const category = createdCategories.find(c => c.name === prod.categoryName);
      if (category) {
        const newProduct = await prisma.product.create({
          data: {
            sku: prod.sku,
            name: prod.name,
            description: prod.description,
            categoryId: category.id,
            basePrice: prod.basePrice,
            unitOfMeasure: prod.unitOfMeasure,
          },
        });
        
        await prisma.productImage.create({
          data: {
            productId: newProduct.id,
            r2Path: 'dummy/path',
            url: prod.imageUrl,
            isPrimary: true,
          }
        });
        console.log(`Created product: ${prod.name}`);
      }
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
