import { Injectable, Logger } from '@nestjs/common';
import { createPrismaClient } from '../../prisma/prisma-client.helper';
import { DashboardMetricsResponse } from '../dto/dashboard-metrics-response.dto';

@Injectable()
export class GetCustomerMetricsUseCase {
  private readonly logger = new Logger(GetCustomerMetricsUseCase.name);
  private prisma = createPrismaClient();

  async execute(userId: string): Promise<DashboardMetricsResponse> {
    this.logger.log(`Fetching Customer Metrics for user ${userId}...`);

    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return { widgets: [] };
      }

      // Try to find the associated customer record using email
      const customer = await this.prisma.customer.findUnique({
        where: { email: user.email },
      });

      let activeOrders = 0;
      let completedOrders = 0;
      let totalAmountSpent = 0;

      if (customer) {
        activeOrders = await this.prisma.order.count({
          where: {
            customerId: customer.id,
            status: { notIn: ['Completed', 'Cancelled'] },
          },
        });

        completedOrders = await this.prisma.order.count({
          where: {
            customerId: customer.id,
            status: 'Completed',
          },
        });

        const spendingAgg = await this.prisma.order.aggregate({
          _sum: { totalAmount: true },
          where: {
            customerId: customer.id,
            status: { notIn: ['Cancelled'] },
          },
        });
        totalAmountSpent = spendingAgg._sum.totalAmount?.toNumber() || 0;
      }

      // 4. Cart Items
      let cartItemsCount = 0;
      const cart = await this.prisma.cart.findUnique({
        where: { userId },
        include: { items: true },
      });

      if (cart) {
        cartItemsCount = cart.items.reduce(
          (acc, item) => acc + item.quantity,
          0,
        );
      }

      return {
        widgets: [
          {
            id: 'customer-active-orders',
            title: 'Active Orders',
            type: 'stat',
            value: activeOrders,
            icon: 'clock',
            color: 'blue',
          },
          {
            id: 'customer-completed-orders',
            title: 'Completed Orders',
            type: 'stat',
            value: completedOrders,
            icon: 'check',
            color: 'emerald',
          },
          {
            id: 'customer-amount-spent',
            title: 'Total Spent',
            type: 'stat',
            value: totalAmountSpent,
            icon: 'revenue',
            color: 'purple',
          },
          {
            id: 'customer-cart',
            title: 'Items in Cart',
            type: 'stat',
            value: cartItemsCount,
            icon: 'cart',
            color: 'amber',
          },
        ],
      };
    } catch (error) {
      this.logger.error('Error fetching customer metrics', error);
      return { widgets: [] };
    }
  }
}
