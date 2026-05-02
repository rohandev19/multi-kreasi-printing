import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DashboardMetricsResponse, WidgetType } from '../dto/dashboard-metrics-response.dto';

@Injectable()
export class GetSalesMetricsUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(): Promise<DashboardMetricsResponse> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // 1. New Orders today
    const newOrdersToday = await this.prisma.order.count({
      where: {
        createdAt: {
          gte: today,
        },
      },
    });

    // 2. Active Customers (Customers with orders this month)
    const activeCustomersCount = await this.prisma.customer.count({
      where: {
        orders: {
          some: {
            createdAt: {
              gte: firstDayOfMonth,
            },
          },
        },
      },
    });

    // 3. Revenue this month
    const revenueThisMonth = await this.prisma.order.aggregate({
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
    });

    // 4. Draft or Pending Approval Orders
    const pendingOrders = await this.prisma.order.count({
      where: {
        status: {
          in: ['Draft', 'Pending_Approval'],
        },
      },
    });

    return {
      widgets: [
        {
          id: 'sales-new-orders',
          title: 'New Orders Today',
          type: WidgetType.STAT,
          value: newOrdersToday,
          icon: 'cart',
          color: 'blue',
        },
        {
          id: 'sales-revenue',
          title: 'Revenue This Month',
          type: WidgetType.STAT,
          value: `$${Number(revenueThisMonth._sum.totalAmount || 0).toLocaleString()}`,
          icon: 'revenue',
          color: 'emerald',
        },
        {
          id: 'sales-active-customers',
          title: 'Active Customers',
          type: WidgetType.STAT,
          value: activeCustomersCount,
          icon: 'users',
          color: 'indigo',
        },
        {
          id: 'sales-pending-orders',
          title: 'Action Needed (Orders)',
          type: WidgetType.STAT,
          value: pendingOrders,
          icon: 'alert',
          color: 'amber',
        },
      ],
    };
  }
}
