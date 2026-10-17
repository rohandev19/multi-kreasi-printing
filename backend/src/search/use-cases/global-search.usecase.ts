import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  GlobalSearchDto,
  GlobalSearchResponseDto,
  SearchItemResult,
} from '../dto/global-search.dto';

export interface SearchCurrentUser {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class GlobalSearchUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    dto: GlobalSearchDto,
    currentUser: SearchCurrentUser,
  ): Promise<GlobalSearchResponseDto> {
    const rawQuery = (dto.q || '').trim();
    if (rawQuery.length < 2) {
      return {
        query: rawQuery,
        total: 0,
        results: {
          orders: [],
          customers: [],
          products: [],
          invoices: [],
          quotations: [],
        },
      };
    }

    const query = rawQuery;
    const isCustomer = currentUser.role === 'Customer';
    const limit = 6;

    if (isCustomer) {
      return this.searchForCustomer(query, currentUser, limit);
    }

    return this.searchForStaff(query, currentUser, limit);
  }

  private async searchForCustomer(
    query: string,
    currentUser: SearchCurrentUser,
    limit: number,
  ): Promise<GlobalSearchResponseDto> {
    const customer = await this.prisma.customer.findFirst({
      where: {
        OR: [
          { email: currentUser.email },
          { members: { some: { id: currentUser.sub } } },
        ],
      },
      select: { id: true },
    });

    const [orders, invoices, products] = await Promise.all([
      customer
        ? this.prisma.order.findMany({
            where: {
              customerId: customer.id,
              OR: [
                { orderNumber: { contains: query, mode: 'insensitive' } },
                {
                  items: {
                    some: {
                      product: {
                        name: { contains: query, mode: 'insensitive' },
                      },
                    },
                  },
                },
              ],
            },
            take: limit,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              orderNumber: true,
              status: true,
              totalAmount: true,
              createdAt: true,
            },
          })
        : Promise.resolve([]),

      customer
        ? this.prisma.invoice.findMany({
            where: {
              customerId: customer.id,
              invoiceNumber: { contains: query, mode: 'insensitive' },
            },
            take: limit,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              invoiceNumber: true,
              status: true,
              amount: true,
              createdAt: true,
            },
          })
        : Promise.resolve([]),

      this.prisma.product.findMany({
        where: {
          status: 'Active',
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { sku: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: limit,
        orderBy: { name: 'asc' },
        select: {
          id: true,
          sku: true,
          name: true,
          basePrice: true,
          unitOfMeasure: true,
        },
      }),
    ]);

    const orderResults: SearchItemResult[] = orders.map((o) => ({
      id: o.id,
      title: `#${o.orderNumber}`,
      subtitle: `Rp ${Number(o.totalAmount).toLocaleString('id-ID')} • ${new Date(o.createdAt).toLocaleDateString('id-ID')}`,
      badge: o.status,
      url: `/dashboard/my-orders?search=${encodeURIComponent(o.orderNumber)}`,
      type: 'order',
    }));

    const invoiceResults: SearchItemResult[] = invoices.map((inv) => ({
      id: inv.id,
      title: `Invoice #${inv.invoiceNumber}`,
      subtitle: `Rp ${Number(inv.amount).toLocaleString('id-ID')}`,
      badge: inv.status,
      url: `/dashboard/invoices?search=${encodeURIComponent(inv.invoiceNumber)}`,
      type: 'invoice',
    }));

    const productResults: SearchItemResult[] = products.map((p) => ({
      id: p.id,
      title: p.name,
      subtitle: `SKU: ${p.sku} • Mulai Rp ${Number(p.basePrice).toLocaleString('id-ID')}/${p.unitOfMeasure}`,
      url: `/products/${p.id}`,
      type: 'product',
    }));

    const total =
      orderResults.length + invoiceResults.length + productResults.length;

    return {
      query,
      total,
      results: {
        orders: orderResults,
        customers: [],
        products: productResults,
        invoices: invoiceResults,
        quotations: [],
      },
    };
  }

  private async searchForStaff(
    query: string,
    currentUser: SearchCurrentUser,
    limit: number,
  ): Promise<GlobalSearchResponseDto> {
    const role = currentUser.role;
    const canAccessCustomers = [
      'Owner',
      'Manager',
      'Sales',
      'Finance_Staff',
    ].includes(role);
    const canAccessInvoices = [
      'Owner',
      'Manager',
      'Finance_Staff',
      'Sales',
    ].includes(role);
    const canAccessQuotations = ['Owner', 'Manager', 'Sales'].includes(role);

    const [orders, products, customers, invoices, quotations] =
      await Promise.all([
        this.prisma.order.findMany({
          where: {
            OR: [
              { orderNumber: { contains: query, mode: 'insensitive' } },
              {
                customer: {
                  companyName: { contains: query, mode: 'insensitive' },
                },
              },
              {
                customer: {
                  email: { contains: query, mode: 'insensitive' },
                },
              },
              {
                items: {
                  some: {
                    product: {
                      name: { contains: query, mode: 'insensitive' },
                    },
                  },
                },
              },
            ],
          },
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            orderNumber: true,
            status: true,
            totalAmount: true,
            customer: {
              select: {
                companyName: true,
                email: true,
              },
            },
          },
        }),

        this.prisma.product.findMany({
          where: {
            status: { not: 'Archived' },
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { sku: { contains: query, mode: 'insensitive' } },
            ],
          },
          take: limit,
          orderBy: { name: 'asc' },
          select: {
            id: true,
            sku: true,
            name: true,
            basePrice: true,
            status: true,
            unitOfMeasure: true,
          },
        }),

        canAccessCustomers
          ? this.prisma.customer.findMany({
              where: {
                deletedAt: null,
                OR: [
                  { companyName: { contains: query, mode: 'insensitive' } },
                  { email: { contains: query, mode: 'insensitive' } },
                  { phone: { contains: query, mode: 'insensitive' } },
                  {
                    contacts: {
                      some: {
                        name: { contains: query, mode: 'insensitive' },
                      },
                    },
                  },
                ],
              },
              take: limit,
              orderBy: { createdAt: 'desc' },
              select: {
                id: true,
                companyName: true,
                email: true,
                phone: true,
                loyaltyTier: true,
              },
            })
          : Promise.resolve([]),

        canAccessInvoices
          ? this.prisma.invoice.findMany({
              where: {
                OR: [
                  { invoiceNumber: { contains: query, mode: 'insensitive' } },
                  {
                    customer: {
                      companyName: { contains: query, mode: 'insensitive' },
                    },
                  },
                ],
              },
              take: limit,
              orderBy: { createdAt: 'desc' },
              select: {
                id: true,
                invoiceNumber: true,
                status: true,
                amount: true,
                customer: {
                  select: {
                    companyName: true,
                  },
                },
              },
            })
          : Promise.resolve([]),

        canAccessQuotations
          ? this.prisma.quotation.findMany({
              where: {
                OR: [
                  {
                    quotationNumber: { contains: query, mode: 'insensitive' },
                  },
                  {
                    notes: { contains: query, mode: 'insensitive' },
                  },
                  {
                    customer: {
                      companyName: { contains: query, mode: 'insensitive' },
                    },
                  },
                ],
              },
              take: limit,
              orderBy: { createdAt: 'desc' },
              select: {
                id: true,
                quotationNumber: true,
                status: true,
                totalAmount: true,
                customer: {
                  select: {
                    companyName: true,
                  },
                },
              },
            })
          : Promise.resolve([]),
      ]);

    const orderResults: SearchItemResult[] = orders.map((o) => ({
      id: o.id,
      title: `#${o.orderNumber}`,
      subtitle: `${o.customer?.companyName || 'Pelanggan'} • Rp ${Number(o.totalAmount).toLocaleString('id-ID')}`,
      badge: o.status,
      url: `/dashboard/orders?search=${encodeURIComponent(o.orderNumber)}`,
      type: 'order',
    }));

    const productResults: SearchItemResult[] = products.map((p) => ({
      id: p.id,
      title: p.name,
      subtitle: `SKU: ${p.sku} • Rp ${Number(p.basePrice).toLocaleString('id-ID')}/${p.unitOfMeasure}`,
      badge: p.status,
      url: `/dashboard/products?search=${encodeURIComponent(p.name)}`,
      type: 'product',
    }));

    const customerResults: SearchItemResult[] = customers.map((c) => ({
      id: c.id,
      title: c.companyName,
      subtitle: `${c.email || '-'} • ${c.phone || '-'}`,
      badge: c.loyaltyTier,
      url: `/dashboard/customers?search=${encodeURIComponent(c.companyName)}`,
      type: 'customer',
    }));

    const invoiceResults: SearchItemResult[] = invoices.map((inv) => ({
      id: inv.id,
      title: `Invoice #${inv.invoiceNumber}`,
      subtitle: `${inv.customer?.companyName || 'Pelanggan'} • Rp ${Number(inv.amount).toLocaleString('id-ID')}`,
      badge: inv.status,
      url: `/dashboard/invoices?search=${encodeURIComponent(inv.invoiceNumber)}`,
      type: 'invoice',
    }));

    const quotationResults: SearchItemResult[] = quotations.map((q) => ({
      id: q.id,
      title: `Penawaran #${q.quotationNumber}`,
      subtitle: `${q.customer?.companyName || 'Pelanggan'} • Rp ${Number(q.totalAmount).toLocaleString('id-ID')}`,
      badge: q.status,
      url: `/dashboard/quotations?search=${encodeURIComponent(q.quotationNumber)}`,
      type: 'quotation',
    }));

    const total =
      orderResults.length +
      productResults.length +
      customerResults.length +
      invoiceResults.length +
      quotationResults.length;

    return {
      query,
      total,
      results: {
        orders: orderResults,
        customers: customerResults,
        products: productResults,
        invoices: invoiceResults,
        quotations: quotationResults,
      },
    };
  }
}
