import { Injectable, NotFoundException } from '@nestjs/common';
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
    const job = await this.prisma.productionJob.findUnique({
      where: { id: jobId },
    });
    if (!job) throw new NotFoundException('Production job not found');

    const material = await this.prisma.material.findUnique({
      where: { id: materialId },
    });
    if (!material) throw new NotFoundException('Material not found');

    const consumption = await this.prisma.materialConsumption.create({
      data: {
        jobId,
        materialId,
        quantity,
        notes,
      },
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
