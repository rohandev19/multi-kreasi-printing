import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { AdjustStockDto, StockMovementType } from './dto/adjust-stock.dto';

@Injectable()
export class InventoryService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async createMaterial(dto: CreateMaterialDto, userId: string) {
    const material = await this.prisma.material.create({
      data: {
        ...dto,
      },
    });

    await this.audit.log({
      userId,
      action: 'MATERIAL_CREATED',
      entityType: 'Material',
      entityId: material.id,
      oldValue: null,
      newValue: material,
    });

    return material;
  }

  async getMaterials(
    role: string,
    page = 1,
    limit = 50,
  ): Promise<{
    data: unknown[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const includeSupplier = role === 'Owner' || role === 'Manager';
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));
    const skip = (safePage - 1) * safeLimit;

    const [materials, total] = await Promise.all([
      this.prisma.material.findMany({
        skip,
        take: safeLimit,
        include: {
          supplier: includeSupplier,
          category: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.material.count(),
    ]);

    return {
      data: materials,
      meta: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  async getMaterialById(id: string) {
    const material = await this.prisma.material.findUnique({
      where: { id },
      include: {
        supplier: true,
        category: true,
      },
    });

    if (!material) throw new NotFoundException('Material not found');
    return material;
  }

  async updateMaterial(
    id: string,
    dto: Partial<CreateMaterialDto>,
    userId: string,
  ) {
    const oldMaterial = await this.getMaterialById(id);

    const material = await this.prisma.material.update({
      where: { id },
      data: dto,
    });

    await this.audit.log({
      userId,
      action: 'MATERIAL_UPDATED',
      entityType: 'Material',
      entityId: material.id,
      oldValue: oldMaterial,
      newValue: material,
    });

    return material;
  }

  async adjustStock(id: string, dto: AdjustStockDto, userId: string) {
    if (
      (dto.type === StockMovementType.IN ||
        dto.type === StockMovementType.OUT) &&
      dto.quantity <= 0
    ) {
      throw new BadRequestException(
        'Quantity untuk pergerakan stok IN/OUT harus lebih besar dari 0',
      );
    }

    let stockChange = 0;
    if (dto.type === StockMovementType.IN) {
      stockChange = dto.quantity;
    } else if (dto.type === StockMovementType.OUT) {
      stockChange = -dto.quantity;
    } else {
      stockChange = dto.quantity; // ADJUSTMENT can be positive or negative
    }

    const { oldMaterial, updatedMaterial, movement } =
      await this.prisma.$transaction(async (tx) => {
        const current = await tx.material.findUnique({
          where: { id },
        });
        if (!current) {
          throw new NotFoundException('Material not found');
        }

        if (stockChange < 0) {
          const deductAmount = Math.abs(stockChange);
          // Atomic conditional decrement: prevents negative stock under high concurrency
          const result = await tx.material.updateMany({
            where: {
              id,
              currentStock: { gte: deductAmount },
            },
            data: {
              currentStock: { decrement: deductAmount },
              version: { increment: 1 },
            },
          });

          if (result.count === 0) {
            throw new ConflictException(
              `Stok material ${current.name} tidak mencukupi (tersedia: ${Number(current.currentStock)}, dibutuhkan: ${deductAmount})`,
            );
          }
        } else if (stockChange > 0) {
          await tx.material.updateMany({
            where: { id },
            data: {
              currentStock: { increment: stockChange },
              version: { increment: 1 },
            },
          });
        }

        const afterUpdate = await tx.material.findUnique({
          where: { id },
        });
        if (!afterUpdate) {
          throw new NotFoundException('Material not found');
        }

        const newStatus =
          Number(afterUpdate.currentStock) <= Number(afterUpdate.minStockLevel)
            ? 'Low_Stock'
            : 'In_Stock';

        const finalMaterial =
          afterUpdate.status !== newStatus
            ? await tx.material.update({
                where: { id },
                data: { status: newStatus },
              })
            : afterUpdate;

        const createdMovement = await tx.stockMovement.create({
          data: {
            materialId: id,
            type: dto.type,
            quantity: dto.quantity,
            reason: dto.reason,
            referenceId: dto.referenceId,
            createdBy: userId,
          },
        });

        return {
          oldMaterial: current,
          updatedMaterial: finalMaterial,
          movement: createdMovement,
        };
      });

    await this.audit.log({
      userId,
      action: 'STOCK_ADJUSTED',
      entityType: 'Material',
      entityId: id,
      oldValue: {
        currentStock: oldMaterial.currentStock,
        status: oldMaterial.status,
      },
      newValue: {
        currentStock: updatedMaterial.currentStock,
        status: updatedMaterial.status,
        movementId: movement.id,
      },
    });

    return updatedMaterial;
  }
}
