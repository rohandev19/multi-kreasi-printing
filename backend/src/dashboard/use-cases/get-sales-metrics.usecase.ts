import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DashboardMetricsResponse } from '../dto/dashboard-metrics-response.dto';

@Injectable()
export class GetSalesMetricsUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(): Promise<DashboardMetricsResponse> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      newOrdersToday,
      activeCustomersCount,
      revenueThisMonth,
      pendingOrders,
    ] = await Promise.all([
      this.prisma.order.count({
        where: {
          createdAt: {
            gte: today,
          },
        },
      }),
      this.prisma.customer.count({
        where: {
          orders: {
            some: {
              createdAt: {
                gte: firstDayOfMonth,
              },
            },
          },
        },
      }),
      this.prisma.order.aggregate({
        _sum: {
          totalAmount: true,
        },
        where: {
          createdAt: {
            gte: firstDayOfMonth,
          },
          status: {
            notIn: ['Cancelled'],
          },
        },
      }),
      this.prisma.order.count({
        where: {
          status: {
            in: ['Draft', 'Pending_Approval'],
          },
        },
      }),
    ]);

    return {
      widgets: [
        {
          id: 'sales-new-orders',
          title: 'New Orders Today',
          type: 'stat',
          value: newOrdersToday,
          icon: 'cart',
          color: 'blue',
        },
        {
          id: 'sales-revenue',
          title: 'Revenue This Month',
          type: 'stat',
          value: `$${Number(revenueThisMonth._sum.totalAmount || 0).toLocaleString()}`,
          icon: 'revenue',
          color: 'emerald',
        },
        {
          id: 'sales-active-customers',
          title: 'Active Customers',
          type: 'stat',
          value: activeCustomersCount,
          icon: 'users',
          color: 'indigo',
        },
        {
          id: 'sales-pending-orders',
          title: 'Action Needed (Orders)',
          type: 'stat',
          value: pendingOrders,
          icon: 'alert',
          color: 'amber',
        },
      ],
    };
  }
}
