import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import {
  CreateShipmentDto,
  ConfirmDeliveryDto,
  UpdateShipmentStatusDto,
  UpdateShipmentTrackingDto,
} from './dto/shipment.dto';
import { ShipmentLogic } from './domain/shipment.entity';
import { CreateShipmentUseCase } from './use-cases/create-shipment.usecase';
import { GetOrderShipmentsUseCase } from './use-cases/get-order-shipments.usecase';
import { ConfirmDeliveryUseCase } from './use-cases/confirm-delivery.usecase';
import { GetShipmentDetailsUseCase } from './use-cases/get-shipment-details.usecase';
import { PrismaService } from '../prisma/prisma.service';
import type { Request } from 'express';

@Controller('api/v1')
@UseGuards(JwtAuthGuard)
export class ShipmentsController {
  constructor(
    private readonly createShipmentUseCase: CreateShipmentUseCase,
    private readonly getOrderShipmentsUseCase: GetOrderShipmentsUseCase,
    private readonly confirmDeliveryUseCase: ConfirmDeliveryUseCase,
    private readonly getShipmentDetailsUseCase: GetShipmentDetailsUseCase,
    private readonly prisma: PrismaService,
  ) {}

  @Post('shipments')
  @RequirePermissions({ action: 'manage', subject: 'Order' })
  async createShipment(
    @Body() dto: CreateShipmentDto,
    @Req() req: Request,
  ) {
    const currentUserId = (req as any).user.userId || (req as any).user.sub;
    return this.createShipmentUseCase.execute(dto, currentUserId);
  }

  @Get('shipments')
  @RequirePermissions({ action: 'read', subject: 'Order' })
  async listAllShipments() {
    return this.prisma.shipment.findMany({
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            customer: {
              select: {
                id: true,
                companyName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        items: {
          include: {
            orderItem: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    unitOfMeasure: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  @Get('orders/:orderId/shipments')
  @RequirePermissions({ action: 'read', subject: 'Order' })
  async getOrderShipments(@Param('orderId') orderId: string) {
    return this.getOrderShipmentsUseCase.execute(orderId);
  }

  @Get('shipments/:id')
  @RequirePermissions({ action: 'read', subject: 'Order' })
  async getShipmentDetails(@Param('id') id: string) {
    return this.getShipmentDetailsUseCase.execute(id);
  }

  @Patch('shipments/:id/confirm-delivery')
  @RequirePermissions({ action: 'manage', subject: 'Order' })
  async confirmDelivery(
    @Param('id') id: string,
    @Body() dto: ConfirmDeliveryDto,
    @Req() req: Request,
  ) {
    const currentUserId = (req as any).user.userId || (req as any).user.sub;
    return this.confirmDeliveryUseCase.execute(id, dto, currentUserId);
  }

  @Patch('shipments/:id/status')
  @RequirePermissions({ action: 'manage', subject: 'Order' })
  async updateShipmentStatus(
    @Param('id') id: string,
    @Body() dto: UpdateShipmentStatusDto,
    @Req() req: Request,
  ) {
    const currentUserId = (req as any).user?.userId || (req as any).user?.sub;
    const shipment = await this.prisma.shipment.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            items: true,
            shipments: {
              include: { items: true },
            },
          },
        },
        items: true,
      },
    });

    if (!shipment) {
      throw new NotFoundException(`Surat Jalan dengan ID ${id} tidak ditemukan.`);
    }

    const updatedShipment = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.shipment.update({
        where: { id },
        data: {
          status: dto.status,
          shippedAt:
            dto.status === 'In_Transit'
              ? dto.shippedAt
                ? new Date(dto.shippedAt)
                : new Date()
              : undefined,
          deliveredAt: dto.status === 'Delivered' ? new Date() : undefined,
          carrier: dto.carrier !== undefined ? dto.carrier : undefined,
          trackingNumber: dto.trackingNumber !== undefined ? dto.trackingNumber : undefined,
          driverName: dto.driverName !== undefined ? dto.driverName : undefined,
          driverPhone: dto.driverPhone !== undefined ? dto.driverPhone : undefined,
          vehicleNumber: dto.vehicleNumber !== undefined ? dto.vehicleNumber : undefined,
          notes: dto.notes !== undefined ? dto.notes : undefined,
        },
      });

      if (shipment.order) {
        if (dto.status === 'In_Transit') {
          // Calculate fulfillment progress
          const allShipments = shipment.order.shipments.map((s) =>
            s.id === id ? { ...s, status: 'In_Transit' } : s,
          );
          const inTransitOrDeliveredShipmentItems = allShipments
            .filter((s) => s.status === 'In_Transit' || s.status === 'Delivered')
            .flatMap((s) => s.items);

          const progress = ShipmentLogic.calculateFulfillmentProgress(
            shipment.order.items.map((i) => ({ id: i.id, quantity: i.quantity })),
            inTransitOrDeliveredShipmentItems.map((i) => ({
              orderItemId: i.orderItemId,
              quantity: i.quantity,
            })),
          );

          const newOrderStatus = progress.isComplete ? 'Shipped' : 'Partially_Shipped';

          await tx.order.update({
            where: { id: shipment.orderId },
            data: { status: newOrderStatus },
          });

          const carrierDetail = dto.carrier || shipment.carrier || 'Armada MKP';
          const trackingDetail = dto.trackingNumber ? ` (Resi/AWB: ${dto.trackingNumber})` : '';

          await tx.orderTimeline.create({
            data: {
              orderId: shipment.orderId,
              status: newOrderStatus,
              notes: `Surat Jalan ${shipment.shipmentNumber} diberangkatkan (${carrierDetail}${trackingDetail}). Status pesanan diperbarui menjadi ${newOrderStatus === 'Shipped' ? 'Telah Dikirim (Shipped)' : 'Dikirim Sebagian (Partially Shipped)'}.`,
              createdBy: currentUserId,
            },
          });
        } else if (dto.status === 'Delivered') {
          const allShipments = shipment.order.shipments.map((s) =>
            s.id === id ? { ...s, status: 'Delivered' } : s,
          );
          const deliveredItems = allShipments
            .filter((s) => s.status === 'Delivered')
            .flatMap((s) => s.items);

          const progress = ShipmentLogic.calculateFulfillmentProgress(
            shipment.order.items.map((i) => ({ id: i.id, quantity: i.quantity })),
            deliveredItems.map((i) => ({
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
                notes: `Seluruh pengiriman telah selesai diterima oleh pelanggan.`,
                createdBy: currentUserId,
              },
            });
          }
        }
      }

      return updated;
    });

    return updatedShipment;
  }

  @Patch('shipments/:id/tracking')
  @RequirePermissions({ action: 'manage', subject: 'Order' })
  async updateShipmentTracking(
    @Param('id') id: string,
    @Body() dto: UpdateShipmentTrackingDto,
    @Req() req: Request,
  ) {
    const currentUserId = (req as any).user?.userId || (req as any).user?.sub;
    const shipment = await this.prisma.shipment.findUnique({
      where: { id },
    });

    if (!shipment) {
      throw new NotFoundException(`Surat Jalan dengan ID ${id} tidak ditemukan.`);
    }

    const updatedShipment = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.shipment.update({
        where: { id },
        data: {
          carrier: dto.carrier !== undefined ? dto.carrier : undefined,
          trackingNumber: dto.trackingNumber !== undefined ? dto.trackingNumber : undefined,
          driverName: dto.driverName !== undefined ? dto.driverName : undefined,
          driverPhone: dto.driverPhone !== undefined ? dto.driverPhone : undefined,
          vehicleNumber: dto.vehicleNumber !== undefined ? dto.vehicleNumber : undefined,
          notes: dto.notes !== undefined ? dto.notes : undefined,
        },
      });

      const changes: string[] = [];
      if (dto.carrier && dto.carrier !== shipment.carrier) {
        changes.push(`Kurir: ${dto.carrier}`);
      }
      if (dto.trackingNumber && dto.trackingNumber !== shipment.trackingNumber) {
        changes.push(`Resi/AWB: ${dto.trackingNumber}`);
      }
      if (dto.driverName && dto.driverName !== shipment.driverName) {
        changes.push(`Driver: ${dto.driverName}`);
      }
      if (dto.vehicleNumber && dto.vehicleNumber !== shipment.vehicleNumber) {
        changes.push(`Plat Kendaraan: ${dto.vehicleNumber}`);
      }

      if (changes.length > 0) {
        await tx.orderTimeline.create({
          data: {
            orderId: shipment.orderId,
            status: shipment.status,
            notes: `Informasi logistik Surat Jalan ${shipment.shipmentNumber} diperbarui: ${changes.join(', ')}`,
            createdBy: currentUserId,
          },
        });
      }

      return updated;
    });

    return updatedShipment;
  }
}

