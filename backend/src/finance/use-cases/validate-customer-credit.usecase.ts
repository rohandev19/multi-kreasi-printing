import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreditLogic, CreditApprovalResult } from '../domain/credit.entity';

@Injectable()
export class ValidateCustomerCreditUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(
    customerId: string,
    newOrderAmount: number,
  ): Promise<CreditApprovalResult> {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        orders: {
          include: {
            invoices: {
              include: {
                payments: true,
              },
            },
          },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }

    const today = new Date();
    let currentOutstanding = 0;
    let overdueCount = 0;

    for (const order of customer.orders) {
      if (order.invoices && order.invoices.length > 0) {
        for (const inv of order.invoices) {
          if (inv.status !== 'Fully_Paid' && inv.status !== 'Cancelled') {
            const totalAmount = Number(inv.amount || 0);
            const paidAmount = inv.payments.reduce(
              (sum: number, p: any) => sum + Number(p.amount || 0),
              0,
            );
            const outstanding = Math.max(0, totalAmount - paidAmount);

            if (outstanding > 0) {
              currentOutstanding += outstanding;
              if (new Date(inv.dueDate).getTime() < today.getTime()) {
                overdueCount += 1;
              }
            }
          }
        }
      }
    }

    return CreditLogic.evaluateCreditApproval({
      creditLimit: Number(customer.creditLimit || 0),
      paymentTermDays: customer.paymentTermDays,
      creditStatus: customer.creditStatus,
      currentOutstanding,
      overdueCount,
      newOrderAmount,
    });
  }
}
