import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GetShipmentDetailsUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(
    shipmentId: string,
    currentUser?: { role?: string; email?: string; userId?: string },
  ) {
    const shipment = await this.prisma.shipment.findUnique({
      where: { id: shipmentId },
      include: {
        order: {
          include: {
            customer: true,
            quotations: {
              take: 1,
              orderBy: { createdAt: 'desc' },
            },
          },
        },
        items: {
          include: {
            orderItem: {
              include: { product: true },
            },
          },
        },
      },
    });

    if (!shipment) {
      throw new NotFoundException(`Surat Jalan dengan ID ${shipmentId} tidak ditemukan.`);
    }

    // IDOR Protection: Verify ownership for Customer role
    if (currentUser?.role === 'Customer') {
      const customerEmail = shipment.order.customer?.email;
      if (currentUser.email && customerEmail && customerEmail !== currentUser.email) {
        throw new ForbiddenException(
          'Akses ditolak: Anda tidak memiliki izin untuk melihat Surat Jalan ini.',
        );
      }
    }

    const latestQuotation = shipment.order.quotations[0];

    return {
      company: {
        name: 'Multi Kreasi Printing',
        tagline: 'Commercial & Packaging Printing Solution',
        address: 'Jl. Industri Percetakan No. 88, Jakarta Barat, Indonesia',
        phone: '+62 21 555-8899',
        email: 'logistik@multikreasiprinting.com',
      },
      shipment: {
        id: shipment.id,
        shipmentNumber: shipment.shipmentNumber,
        status: shipment.status,
        carrier: shipment.carrier,
        trackingNumber: shipment.trackingNumber,
        driverName: shipment.driverName,
        driverPhone: shipment.driverPhone,
        vehicleNumber: shipment.vehicleNumber,
        recipientName: shipment.recipientName,
        recipientPhone: shipment.recipientPhone,
        deliveryAddress: shipment.deliveryAddress,
        notes: shipment.notes,
        shippedAt: shipment.shippedAt,
        deliveredAt: shipment.deliveredAt,
        receivedBy: shipment.receivedBy,
        podNotes: shipment.podNotes,
        podSignature: shipment.podSignature,
        createdAt: shipment.createdAt,
      },
      order: {
        id: shipment.order.id,
        orderNumber: shipment.order.orderNumber,
        customerPoNumber: latestQuotation?.poNumber || null,
        companyName: shipment.order.customer.companyName,
        customerEmail: shipment.order.customer.email,
        customerPhone: shipment.order.customer.phone,
      },
      items: shipment.items.map((item) => ({
        id: item.id,
        orderItemId: item.orderItemId,
        productName: item.orderItem.product.name,
        sku: item.orderItem.product.sku,
        quantity: item.quantity,
        unitOfMeasure: item.orderItem.product.unitOfMeasure,
        notes: item.notes,
      })),
      totalQuantity: shipment.items.reduce((sum, item) => sum + item.quantity, 0),
    };
  }
}
