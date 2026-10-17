import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async getSuppliers() {
    return this.prisma.supplier.findMany({
      where: { deletedAt: null },
      include: {
        _count: {
          select: { materials: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getSupplierById(id: string) {
    const supplier = await this.prisma.supplier.findFirst({
      where: { id, deletedAt: null },
      include: {
        materials: {
          select: {
            id: true,
            sku: true,
            name: true,
            currentStock: true,
            unitOfMeasure: true,
            status: true,
          },
        },
      },
    });

    if (!supplier) {
      throw new NotFoundException('Pemasok (Supplier) tidak ditemukan');
    }

    return supplier;
  }

  async createSupplier(dto: CreateSupplierDto, userId: string) {
    const supplier = await this.prisma.supplier.create({
      data: {
        name: dto.name,
        contactPerson: dto.contactPerson,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
      },
    });

    await this.audit.log({
      userId,
      action: 'SUPPLIER_CREATED',
      entityType: 'Supplier',
      entityId: supplier.id,
      oldValue: null,
      newValue: supplier,
    });

    return supplier;
  }

  async updateSupplier(id: string, dto: UpdateSupplierDto, userId: string) {
    const oldSupplier = await this.getSupplierById(id);

    const updated = await this.prisma.supplier.update({
      where: { id },
      data: dto,
    });

    await this.audit.log({
      userId,
      action: 'SUPPLIER_UPDATED',
      entityType: 'Supplier',
      entityId: id,
      oldValue: oldSupplier,
      newValue: updated,
    });

    return updated;
  }

  async deleteSupplier(id: string, userId: string) {
    const oldSupplier = await this.getSupplierById(id);

    const deleted = await this.prisma.supplier.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.audit.log({
      userId,
      action: 'SUPPLIER_DELETED',
      entityType: 'Supplier',
      entityId: id,
      oldValue: oldSupplier,
      newValue: { deleted: true },
    });

    return { message: 'Pemasok berhasil dihapus', id: deleted.id };
  }
}
