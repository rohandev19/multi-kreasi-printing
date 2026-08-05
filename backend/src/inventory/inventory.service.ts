import { Injectable, NotFoundException } from '@nestjs/common';
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

  async getMaterials(role: string) {
    const includeSupplier = role === 'Owner' || role === 'Manager';

    return this.prisma.material.findMany({
      include: {
        supplier: includeSupplier,
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });
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
    const material = await this.getMaterialById(id);

    let stockChange = 0;
    if (dto.type === StockMovementType.IN) {
      stockChange = dto.quantity;
    } else if (dto.type === StockMovementType.OUT) {
      stockChange = -dto.quantity;
    } else {
      stockChange = dto.quantity; // ADJUSTMENT can be positive or negative
    }

    const newStock = material.currentStock + stockChange;

    const [updatedMaterial, movement] = await this.prisma.$transaction([
      this.prisma.material.update({
        where: { id },
        data: {
          currentStock: newStock,
          status: newStock <= material.minStockLevel ? 'Low_Stock' : 'In_Stock',
        },
      }),
      this.prisma.stockMovement.create({
        data: {
          materialId: id,
          type: dto.type,
          quantity: dto.quantity,
          reason: dto.reason,
          referenceId: dto.referenceId,
          createdBy: userId,
        },
      }),
    ]);

    await this.audit.log({
      userId,
      action: 'STOCK_ADJUSTED',
      entityType: 'Material',
      entityId: id,
      oldValue: {
        currentStock: material.currentStock,
        status: material.status,
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
