import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ShipmentLogic } from '../domain/shipment.entity';

@Injectable()
export class GetOrderShipmentsUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        items: {
          include: { product: true },
        },
        shipments: {
          include: {
            items: {
              include: {
                orderItem: {
                  include: { product: true },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    const allShipmentItems = order.shipments.flatMap((s) => s.items);

    const fulfillment = ShipmentLogic.calculateFulfillmentProgress(
      order.items.map((i) => ({ id: i.id, quantity: i.quantity })),
      allShipmentItems.map((i) => ({
        orderItemId: i.orderItemId,
        quantity: i.quantity,
      })),
    );

    const remainingPerItem = ShipmentLogic.calculateRemainingQuantities(
      order.items.map((i) => ({ id: i.id, quantity: i.quantity })),
      allShipmentItems.map((i) => ({
        orderItemId: i.orderItemId,
        quantity: i.quantity,
      })),
    );

    const itemDispatchSummary = order.items.map((item) => {
      const shippedQty = allShipmentItems
        .filter((si) => si.orderItemId === item.id)
        .reduce((sum, si) => sum + si.quantity, 0);

      return {
        orderItemId: item.id,
        productId: item.productId,
        productName: item.product.name,
        orderedQuantity: item.quantity,
        shippedQuantity: shippedQty,
        remainingQuantity: remainingPerItem[item.id] ?? 0,
        unitOfMeasure: item.product.unitOfMeasure,
      };
    });

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      orderStatus: order.status,
      customer: {
        id: order.customer.id,
        companyName: order.customer.companyName,
        phone: order.customer.phone,
        address: order.customer.address,
      },
      fulfillment,
      itemDispatchSummary,
      shipments: order.shipments,
    };
  }
}
