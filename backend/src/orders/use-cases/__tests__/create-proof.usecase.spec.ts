import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateProofUseCase } from '../create-proof.usecase';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('CreateProofUseCase', () => {
  let useCase: CreateProofUseCase;
  let prisma: any;
  let audit: any;
  let eventEmitter: any;

  beforeEach(() => {
    prisma = {
      order: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      proof: {
        findFirst: vi.fn(),
        updateMany: vi.fn(),
        create: vi.fn(),
      },
      orderTimeline: {
        create: vi.fn(),
      },
      $transaction: vi.fn(async (cb) => cb(prisma)),
    };
    audit = { log: vi.fn() };
    eventEmitter = { emit: vi.fn() };

    useCase = new CreateProofUseCase(prisma, audit, eventEmitter);
  });

  it('throws NotFoundException if order does not exist', async () => {
    prisma.order.findUnique.mockResolvedValue(null);

    await expect(
      useCase.execute(
        'order-1',
        {
          title: 'Proof v1',
          fileUrl: 'https://cdn/proof.pdf',
          r2Path: 'proofs/proof.pdf',
        },
        'designer-1',
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws BadRequestException if order is Cancelled', async () => {
    prisma.order.findUnique.mockResolvedValue({ id: 'order-1', status: 'Cancelled' });

    await expect(
      useCase.execute(
        'order-1',
        {
          title: 'Proof v1',
          fileUrl: 'https://cdn/proof.pdf',
          r2Path: 'proofs/proof.pdf',
        },
        'designer-1',
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('creates proof with version 1 if no previous proofs exist and updates order status', async () => {
    prisma.order.findUnique.mockResolvedValue({
      id: 'order-1',
      status: 'Design_In_Progress',
    });
    prisma.proof.findFirst.mockResolvedValue(null);
    prisma.proof.create.mockResolvedValue({
      id: 'proof-1',
      orderId: 'order-1',
      version: 1,
      title: 'Proof v1',
      status: 'Pending_Approval',
    });

    const result = await useCase.execute(
      'order-1',
      {
        title: 'Proof v1',
        fileUrl: 'https://cdn/proof.pdf',
        r2Path: 'proofs/proof.pdf',
        designerNotes: 'Bleed 3mm added',
      },
      'designer-1',
    );

    expect(result.version).toBe(1);
    expect(prisma.proof.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          version: 1,
          status: 'Pending_Approval',
          createdBy: 'designer-1',
        }),
      }),
    );
    expect(prisma.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'Proof_Pending_Approval' }),
      }),
    );
    expect(audit.log).toHaveBeenCalled();
    expect(eventEmitter.emit).toHaveBeenCalledWith('proof.created', expect.any(Object));
  });

  it('increments version to 2 if proof v1 exists and marks previous pending proofs as superseded', async () => {
    prisma.order.findUnique.mockResolvedValue({
      id: 'order-1',
      status: 'Proof_Rejected',
    });
    prisma.proof.findFirst.mockResolvedValue({ version: 1 });
    prisma.proof.create.mockResolvedValue({
      id: 'proof-2',
      orderId: 'order-1',
      version: 2,
      title: 'Proof v2 Revisi',
      status: 'Pending_Approval',
    });

    const result = await useCase.execute(
      'order-1',
      {
        title: 'Proof v2 Revisi',
        fileUrl: 'https://cdn/proof-v2.pdf',
        r2Path: 'proofs/proof-v2.pdf',
      },
      'designer-1',
    );

    expect(result.version).toBe(2);
    expect(prisma.proof.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { status: 'Superseded' },
      }),
    );
  });
});
