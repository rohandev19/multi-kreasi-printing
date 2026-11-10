import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class RecordMaterialConsumptionUseCase {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async execute(
    jobId: string,
    materialId: string,
    quantity: number,
    notes: string | undefined,
    currentUserId: string,
  ) {
    if (quantity <= 0) {
      throw new BadRequestException('Quantity konsumsi harus lebih dari 0');
    }

    const job = await this.prisma.productionJob.findUnique({
      where: { id: jobId },
    });
    if (!job) throw new NotFoundException('Production job not found');

    const material = await this.prisma.material.findUnique({
      where: { id: materialId },
    });
    if (!material) throw new NotFoundException('Material not found');

    const consumption = await this.prisma.$transaction(async (tx) => {
      const deducted = await tx.material.updateMany({
        where: {
          id: materialId,
          currentStock: { gte: quantity },
        },
        data: {
          currentStock: { decrement: quantity },
          version: { increment: 1 },
        },
      });

      if (deducted.count === 0) {
        throw new ConflictException(
          `Stok material ${material.name} tidak mencukupi untuk produksi`,
        );
      }

      const afterMaterial = await tx.material.findUnique({
        where: { id: materialId },
      });
      if (
        afterMaterial &&
        Number(afterMaterial.currentStock) <=
          Number(afterMaterial.minStockLevel) &&
        afterMaterial.status !== 'Low_Stock'
      ) {
        await tx.material.update({
          where: { id: materialId },
          data: { status: 'Low_Stock' },
        });
      }

      await tx.stockMovement.create({
        data: {
          materialId,
          type: 'OUT',
          quantity,
          reason: notes || `Production consumption for job ${job.jobNumber}`,
          referenceId: job.orderId,
          createdBy: currentUserId,
        },
      });

      return tx.materialConsumption.create({
        data: {
          jobId,
          materialId,
          quantity,
          notes,
        },
      });
    });

    await this.audit.log({
      userId: currentUserId,
      action: 'MATERIAL_CONSUMED',
      entityType: 'ProductionJob',
      entityId: jobId,
      oldValue: null,
      newValue: { materialId, quantity, consumptionId: consumption.id },
    });

    return consumption;
  }
}
