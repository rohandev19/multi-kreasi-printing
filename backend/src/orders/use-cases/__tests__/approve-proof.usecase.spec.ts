import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApproveProofUseCase } from '../approve-proof.usecase';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';

describe('ApproveProofUseCase', () => {
  let useCase: ApproveProofUseCase;
  let prisma: any;
  let audit: any;
  let eventEmitter: any;

  beforeEach(() => {
    prisma = {
      user: { findUnique: vi.fn() },
      proof: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      order: { update: vi.fn() },
      orderTimeline: { create: vi.fn() },
      $transaction: vi.fn(async (cb) => cb(prisma)),
    };
    audit = { log: vi.fn() };
    eventEmitter = { emit: vi.fn() };

    useCase = new ApproveProofUseCase(prisma, audit, eventEmitter);
  });

  it('throws BadRequestException if disclaimer was not agreed to', async () => {
    await expect(
      useCase.execute(
        'proof-1',
        { agreedToDisclaimer: false },
        { id: 'user-1', role: 'Customer' },
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws NotFoundException if proof does not exist', async () => {
    prisma.proof.findUnique.mockResolvedValue(null);

    await expect(
      useCase.execute(
        'proof-999',
        { agreedToDisclaimer: true },
        { id: 'user-1', role: 'Customer' },
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws ForbiddenException if customer does not own the order', async () => {
    prisma.proof.findUnique.mockResolvedValue({
      id: 'proof-1',
      status: 'Pending_Approval',
      order: {
        id: 'order-1',
        customer: { email: 'real-customer@corp.com' },
      },
    });
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-imposter',
      email: 'imposter@corp.com',
    });

    await expect(
      useCase.execute(
        'proof-1',
        { agreedToDisclaimer: true },
        { id: 'user-imposter', role: 'Customer' },
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('approves proof, records IP address, updates order to Proof_Approved and logs audit', async () => {
    prisma.proof.findUnique.mockResolvedValue({
      id: 'proof-1',
      version: 1,
      orderId: 'order-1',
      status: 'Pending_Approval',
      order: {
        id: 'order-1',
        status: 'Proof_Pending_Approval',
        customer: { email: 'buyer@corp.com' },
      },
    });
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'buyer@corp.com',
    });
    prisma.proof.update.mockResolvedValue({
      id: 'proof-1',
      status: 'Approved',
      approvedBy: 'user-1',
    });

    const result = await useCase.execute(
      'proof-1',
      { agreedToDisclaimer: true, customerNotes: 'Acc layout oke' },
      { id: 'user-1', role: 'Customer' },
      '192.168.1.10',
    );

    expect(result.status).toBe('Approved');
    expect(prisma.proof.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'Approved',
          approvedBy: 'user-1',
          approvalIp: '192.168.1.10',
          customerNotes: 'Acc layout oke',
        }),
      }),
    );
    expect(prisma.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'order-1' },
        data: expect.objectContaining({ status: 'Proof_Approved' }),
      }),
    );
    expect(audit.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'PROOF_APPROVED',
        ipAddress: '192.168.1.10',
      }),
    );
  });
});
