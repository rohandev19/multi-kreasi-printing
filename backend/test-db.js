require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  try {
    const prod = await prisma.product.findUnique({ where: { id: '61353365-2a6c-49b0-9149-e8107fbc72e7' }, include: { pricingTiers: true } });
    console.log('product=', prod.name, 'tiers=', prod.pricingTiers);
  } catch(e) {
    console.log(e);
  }
}
run();
