import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SuppliersService } from '../suppliers.service';
import { NotFoundException } from '@nestjs/common';

describe('SuppliersService', () => {
  let service: SuppliersService;
  let prisma: any;
  let audit: any;

  beforeEach(() => {
    prisma = {
      supplier: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
    };
    audit = {
      log: vi.fn(),
    };
    service = new SuppliersService(prisma, audit);
  });

  it('should get all active suppliers', async () => {
    prisma.supplier.findMany.mockResolvedValue([
      { id: 'sup-1', name: 'PT Kertas Nusantara', _count: { materials: 3 } },
    ]);

    const res = await service.getSuppliers();
    expect(res).toHaveLength(1);
    expect(prisma.supplier.findMany).toHaveBeenCalledWith({
      where: { deletedAt: null },
      include: { _count: { select: { materials: true } } },
      orderBy: { name: 'asc' },
    });
  });

  it('should throw NotFoundException if supplier not found by id', async () => {
    prisma.supplier.findFirst.mockResolvedValue(null);

    await expect(service.getSupplierById('unknown-id')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should create supplier and log audit', async () => {
    const newSupplier = {
      id: 'sup-2',
      name: 'CV Tinta Prima',
      email: 'sales@tintaprima.com',
      phone: '0812345678',
    };
    prisma.supplier.create.mockResolvedValue(newSupplier);

    const res = await service.createSupplier(newSupplier, 'user-admin');

    expect(prisma.supplier.create).toHaveBeenCalledWith({
      data: {
        name: 'CV Tinta Prima',
        contactPerson: undefined,
        email: 'sales@tintaprima.com',
        phone: '0812345678',
        address: undefined,
      },
    });
    expect(audit.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'SUPPLIER_CREATED',
        entityId: 'sup-2',
      }),
    );
    expect(res).toEqual(newSupplier);
  });

  it('should soft delete supplier and log audit', async () => {
    prisma.supplier.findFirst.mockResolvedValue({
      id: 'sup-3',
      name: 'PT Lama',
    });
    prisma.supplier.update.mockResolvedValue({
      id: 'sup-3',
      deletedAt: new Date(),
    });

    const res = await service.deleteSupplier('sup-3', 'user-admin');

    expect(prisma.supplier.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'sup-3' },
        data: expect.objectContaining({ deletedAt: expect.any(Date) }),
      }),
    );
    expect(audit.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'SUPPLIER_DELETED',
        entityId: 'sup-3',
      }),
    );
    expect(res.message).toBe('Pemasok berhasil dihapus');
  });
});
