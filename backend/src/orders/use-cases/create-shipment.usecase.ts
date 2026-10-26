import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ShipmentLogic } from '../domain/shipment.entity';
import { CreateShipmentDto } from '../dto/shipment.dto';

@Injectable()
export class CreateShipmentUseCase {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private eventEmitter: EventEmitter2,
  ) {}

  async execute(dto: CreateShipmentDto, currentUserId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: {
        items: true,
        shipments: {
          include: {
            items: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(
        `Pesanan dengan ID ${dto.orderId} tidak ditemukan.`,
      );
    }

    // Collect all existing shipment items
    const existingShipmentItems = order.shipments.flatMap((s) => s.items);

    // Validate partial dispatch with domain rules
    const validation = ShipmentLogic.validateDispatch(
      order.status,
      order.items.map((i) => ({ id: i.id, quantity: i.quantity })),
      existingShipmentItems.map((i) => ({
        orderItemId: i.orderItemId,
        quantity: i.quantity,
      })),
      dto.items,
    );

    if (!validation.valid) {
      throw new BadRequestException(validation.error);
    }

    const currentYear = new Date().getFullYear();
    const count = await this.prisma.shipment.count({
      where: {
        createdAt: {
          gte: new Date(`${currentYear}-01-01T00:00:00.000Z`),
        },
      },
    });

    const shipmentNumber = ShipmentLogic.generateShipmentNumber(
      count + 1,
      currentYear,
    );

    const totalItemsCount = dto.items.reduce((sum, i) => sum + i.quantity, 0);

    const createdShipment = await this.prisma.$transaction(async (tx) => {
      const shipment = await tx.shipment.create({
        data: {
          shipmentNumber,
          orderId: order.id,
          recipientName: dto.recipientName,
          recipientPhone: dto.recipientPhone || null,
          deliveryAddress: dto.deliveryAddress,
          driverName: dto.driverName || null,
          driverPhone: dto.driverPhone || null,
          vehicleNumber: dto.vehicleNumber || null,
          carrier: dto.carrier || 'Armada Internal MKP',
          trackingNumber: dto.trackingNumber || null,
          status: 'Preparing',
          notes: dto.notes || null,
          items: {
            create: dto.items.map((item) => ({
              orderItemId: item.orderItemId,
              quantity: item.quantity,
              notes: item.notes || null,
            })),
          },
        },
        include: {
          items: {
            include: {
              orderItem: {
                include: { product: true },
              },
            },
          },
        },
      });

      await tx.orderTimeline.create({
        data: {
          orderId: order.id,
          status: order.status,
          notes: `Surat Jalan ${shipmentNumber} dibuat (${totalItemsCount} pcs barang dikirim ke ${dto.recipientName})`,
          createdBy: currentUserId,
        },
      });

      return shipment;
    });

    await this.audit.log({
      userId: currentUserId,
      action: 'SHIPMENT_CREATED',
      entityType: 'Shipment',
      entityId: createdShipment.id,
      newValue: {
        shipmentNumber,
        orderNumber: order.orderNumber,
        totalItemsCount,
      },
    });

    this.eventEmitter.emit('shipment.created', {
      shipmentId: createdShipment.id,
      shipmentNumber,
      orderId: order.id,
      orderNumber: order.orderNumber,
      recipientName: dto.recipientName,
    });

    return createdShipment;
  }
}
