const { createPrismaClient } = require('./dist/src/prisma/prisma-client.helper');
const p = createPrismaClient();

async function main() {
  const orders = await p.order.findMany({
    select: {
      id: true,
      orderNumber: true,
      status: true,
      totalAmount: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  });
  console.log('Orders in DB:');
  console.log(JSON.stringify(orders, null, 2));
}

main().catch(console.error).finally(() => p.$disconnect());
