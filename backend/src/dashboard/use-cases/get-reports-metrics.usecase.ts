import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GetReportsMetricsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute() {
    const [ordersByStatusRaw, ordersByPriorityRaw, topCustomersRaw] =
      await Promise.all([
        this.prisma.order.groupBy({
          by: ['status'],
          _count: {
            id: true,
          },
        }),
        this.prisma.order.groupBy({
          by: ['priority'],
          _count: {
            id: true,
          },
        }),
        this.prisma.order.groupBy({
          by: ['customerId'],
          _sum: {
            totalAmount: true,
          },
          _count: {
            id: true,
          },
          orderBy: {
            _sum: {
              totalAmount: 'desc',
            },
          },
          take: 5,
        }),
      ]);

    const ordersByStatus = ordersByStatusRaw.map((item) => ({
      name: item.status.replace('_', ' '),
      value: item._count.id,
    }));

    const ordersByPriority = ordersByPriorityRaw.map((item) => ({
      name: item.priority,
      value: item._count.id,
    }));

    const customerIds = topCustomersRaw.map((c) => c.customerId);
    const customersInfo = await this.prisma.customer.findMany({
      where: { id: { in: customerIds } },
      select: { id: true, companyName: true },
    });

    const topCustomers = topCustomersRaw.map((tc) => {
      const customer = customersInfo.find((c) => c.id === tc.customerId);
      return {
        id: tc.customerId,
        companyName: customer?.companyName || 'Unknown Customer',
        orders: tc._count.id,
        revenue: tc._sum.totalAmount ? Number(tc._sum.totalAmount) : 0,
      };
    });

    return {
      ordersByStatus,
      ordersByPriority,
      topCustomers,
    };
  }
}
