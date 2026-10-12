import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ShipmentLogic } from '../domain/shipment.entity';
import { ConfirmDeliveryDto } from '../dto/shipment.dto';

@Injectable()
export class ConfirmDeliveryUseCase {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private eventEmitter: EventEmitter2,
  ) {}

  async execute(shipmentId: string, dto: ConfirmDeliveryDto, currentUserId: string) {
    const shipment = await this.prisma.shipment.findUnique({
      where: { id: shipmentId },
      include: {
        order: {
          include: {
            items: true,
            shipments: {
              include: { items: true },
            },
          },
        },
      },
    });

    if (!shipment) {
      throw new NotFoundException(`Surat Jalan dengan ID ${shipmentId} tidak ditemukan.`);
    }

    if (shipment.status === 'Delivered') {
      throw new BadRequestException('Pengiriman ini telah dikonfirmasi terkirim sebelumnya.');
    }

    const deliveredAt = dto.deliveredAt ? new Date(dto.deliveredAt) : new Date();

    const updatedShipment = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.shipment.update({
        where: { id: shipmentId },
        data: {
          status: 'Delivered',
          deliveredAt,
          receivedBy: dto.receivedBy,
          podNotes: dto.podNotes || null,
          podSignature: dto.podSignature || null,
        },
      });

      await tx.orderTimeline.create({
        data: {
          orderId: shipment.orderId,
          status: shipment.order.status,
          notes: `Barang pada Surat Jalan ${shipment.shipmentNumber} telah diterima oleh ${dto.receivedBy}`,
          createdBy: currentUserId,
        },
      });

      // Check if all order shipments are now Delivered and entire order is fulfilled
      const allShipments = shipment.order.shipments.map((s) =>
        s.id === shipmentId ? { ...s, status: 'Delivered' } : s,
      );

      const allShipmentItems = allShipments
        .filter((s) => s.status === 'Delivered')
        .flatMap((s) => s.items);

      const progress = ShipmentLogic.calculateFulfillmentProgress(
        shipment.order.items.map((i) => ({ id: i.id, quantity: i.quantity })),
        allShipmentItems.map((i) => ({
          orderItemId: i.orderItemId,
          quantity: i.quantity,
        })),
      );

      if (progress.isComplete) {
        await tx.order.update({
          where: { id: shipment.orderId },
          data: { status: 'Delivered' },
        });

        await tx.orderTimeline.create({
          data: {
            orderId: shipment.orderId,
            status: 'Delivered',
            notes: 'Seluruh termin pengiriman telah selesai diterima oleh pemesan.',
            createdBy: currentUserId,
          },
        });
      }

      return updated;
    });

    await this.audit.log({
      userId: currentUserId,
      action: 'SHIPMENT_DELIVERED',
      entityType: 'Shipment',
      entityId: updatedShipment.id,
      newValue: {
        shipmentNumber: updatedShipment.shipmentNumber,
        receivedBy: dto.receivedBy,
        deliveredAt,
      },
    });

    this.eventEmitter.emit('shipment.delivered', {
      shipmentId: updatedShipment.id,
      shipmentNumber: updatedShipment.shipmentNumber,
      orderId: shipment.orderId,
      receivedBy: dto.receivedBy,
    });

    return updatedShipment;
  }
}
