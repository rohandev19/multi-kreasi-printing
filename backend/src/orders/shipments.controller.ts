import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import {
  CreateShipmentDto,
  ConfirmDeliveryDto,
  UpdateShipmentStatusDto,
} from './dto/shipment.dto';
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
  ) {
    const shipment = await this.prisma.shipment.update({
      where: { id },
      data: {
        status: dto.status,
        shippedAt:
          dto.status === 'In_Transit' ? new Date() : undefined,
      },
    });
    return shipment;
  }
}
