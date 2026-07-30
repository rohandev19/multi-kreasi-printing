import { Injectable } from '@nestjs/common';
import { createPrismaClient } from '../../prisma/prisma-client.helper';

@Injectable()
export class GetReportsMetricsUseCase {
  private prisma = createPrismaClient();

  async execute() {
    // 1. Orders by Status
    const ordersByStatusRaw = await this.prisma.order.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    const ordersByStatus = ordersByStatusRaw.map((item: any) => ({
      name: item.status.replace('_', ' '),
      value: item._count.id,
    }));

    // 2. Orders by Priority
    const ordersByPriorityRaw = await this.prisma.order.groupBy({
      by: ['priority'],
      _count: {
        id: true,
      },
    });

    const ordersByPriority = ordersByPriorityRaw.map((item: any) => ({
      name: item.priority,
      value: item._count.id,
    }));

    // 3. Top Customers by Revenue
    const topCustomersRaw = await this.prisma.order.groupBy({
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
    });

    const customerIds = topCustomersRaw.map((c: any) => c.customerId);
    const customersInfo = await this.prisma.customer.findMany({
      where: { id: { in: customerIds } },
      select: { id: true, companyName: true },
    });

    const topCustomers = topCustomersRaw.map((tc: any) => {
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
