import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DashboardMetricsResponse } from '../dto/dashboard-metrics-response.dto';

@Injectable()
export class GetCustomerMetricsUseCase {
  private readonly logger = new Logger(GetCustomerMetricsUseCase.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string): Promise<DashboardMetricsResponse> {
    this.logger.log(`Fetching Customer Metrics for user ${userId}...`);

    try {
      const [user, cart] = await Promise.all([
        this.prisma.user.findUnique({ where: { id: userId } }),
        this.prisma.cart.findUnique({
          where: { userId },
          include: { items: true },
        }),
      ]);
      if (!user) {
        return { widgets: [] };
      }

      const customer = user.customerId
        ? await this.prisma.customer.findUnique({
            where: { id: user.customerId },
          })
        : await this.prisma.customer.findUnique({
            where: { email: user.email },
          });

      let activeOrders = 0;
      let completedOrders = 0;
      let totalAmountSpent = 0;

      if (customer) {
        const [activeCount, completedCount, spendingAgg] = await Promise.all([
          this.prisma.order.count({
            where: {
              customerId: customer.id,
              status: { notIn: ['Completed', 'Cancelled'] },
            },
          }),
          this.prisma.order.count({
            where: {
              customerId: customer.id,
              status: 'Completed',
            },
          }),
          this.prisma.order.aggregate({
            _sum: { totalAmount: true },
            where: {
              customerId: customer.id,
              status: { notIn: ['Cancelled'] },
            },
          }),
        ]);
        activeOrders = activeCount;
        completedOrders = completedCount;
        totalAmountSpent = spendingAgg._sum.totalAmount?.toNumber() || 0;
      }

      const cartItemsCount = cart
        ? cart.items.reduce((acc, item) => acc + item.quantity, 0)
        : 0;

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
