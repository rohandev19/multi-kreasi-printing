import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreditLogic,
  AgingBuckets,
  CreditRiskLevel,
  InvoiceAgingItem,
} from '../domain/credit.entity';

export interface CustomerAgingRow {
  customerId: string;
  companyName: string;
  email: string | null;
  phone: string | null;
  creditLimit: number;
  paymentTermDays: number;
  creditStatus: string;
  creditNotes: string | null;
  availableCredit: number;
  aging: AgingBuckets;
  riskLevel: CreditRiskLevel;
  invoiceCount: number;
}

export interface ArAgingReportResult {
  summary: {
    totalReceivables: number;
    totalCurrent: number;
    totalOverdue: number;
    bucket1_30Total: number;
    bucket31_60Total: number;
    bucket61_90Total: number;
    bucketOver90Total: number;
    totalCustomersWithOutstanding: number;
    highRiskCustomersCount: number;
  };
  customers: CustomerAgingRow[];
  generatedAt: string;
}

@Injectable()
export class GetArAgingReportUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(
    referenceDate: Date = new Date(),
  ): Promise<ArAgingReportResult> {
    // Fetch all customers with their credit profile and their invoices
    const customers = await this.prisma.customer.findMany({
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
      orderBy: { companyName: 'asc' },
    });

    const customerRows: CustomerAgingRow[] = [];

    let totalReceivables = 0;
    let totalCurrent = 0;
    let totalOverdue = 0;
    let bucket1_30Total = 0;
    let bucket31_60Total = 0;
    let bucket61_90Total = 0;
    let bucketOver90Total = 0;
    let highRiskCount = 0;

    for (const customer of customers) {
      // Gather all invoices across customer orders
      const invoices: InvoiceAgingItem[] = [];

      for (const order of customer.orders) {
        if (order.invoices && order.invoices.length > 0) {
          for (const inv of order.invoices) {
            const totalAmount = Number(inv.amount || 0);
            const paidAmount = inv.payments.reduce(
              (sum: number, p: any) => sum + Number(p.amount || 0),
              0,
            );
            const outstanding = Math.max(0, totalAmount - paidAmount);

            invoices.push({
              id: inv.id,
              invoiceNumber: inv.invoiceNumber,
              amount: totalAmount,
              paidAmount,
              outstanding,
              dueDate: inv.dueDate,
              status: inv.status,
            });
          }
        }
      }

      const aging = CreditLogic.calculateAging(invoices, referenceDate);
      const creditLimit = Number(customer.creditLimit || 0);
      const riskLevel = CreditLogic.determineRiskLevel(
        aging,
        creditLimit,
        customer.creditStatus,
      );

      const availableCredit = Math.max(0, creditLimit - aging.totalOutstanding);

      if (riskLevel === 'HIGH' || riskLevel === 'CRITICAL') {
        highRiskCount++;
      }

      totalReceivables += aging.totalOutstanding;
      totalCurrent += aging.current;
      totalOverdue += aging.overdueAmount;
      bucket1_30Total += aging.bucket1_30;
      bucket31_60Total += aging.bucket31_60;
      bucket61_90Total += aging.bucket61_90;
      bucketOver90Total += aging.bucketOver90;

      customerRows.push({
        customerId: customer.id,
        companyName: customer.companyName,
        email: customer.email,
        phone: customer.phone,
        creditLimit,
        paymentTermDays: customer.paymentTermDays,
        creditStatus: customer.creditStatus,
        creditNotes: customer.creditNotes,
        availableCredit,
        aging,
        riskLevel,
        invoiceCount: invoices.filter(
          (i) => i.status !== 'Fully_Paid' && i.status !== 'Cancelled',
        ).length,
      });
    }

    // Sort by totalOutstanding descending
    customerRows.sort(
      (a, b) => b.aging.totalOutstanding - a.aging.totalOutstanding,
    );

    const customersWithDebt = customerRows.filter(
      (c) => c.aging.totalOutstanding > 0,
    ).length;

    return {
      summary: {
        totalReceivables,
        totalCurrent,
        totalOverdue,
        bucket1_30Total,
        bucket31_60Total,
        bucket61_90Total,
        bucketOver90Total,
        totalCustomersWithOutstanding: customersWithDebt,
        highRiskCustomersCount: highRiskCount,
      },
      customers: customerRows,
      generatedAt: referenceDate.toISOString(),
    };
  }
}
