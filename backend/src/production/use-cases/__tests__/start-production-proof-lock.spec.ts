import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StartProductionUseCase } from '../start-production.usecase';
import { BadRequestException } from '@nestjs/common';

describe('StartProductionUseCase - Production Lock for Proofing', () => {
  let useCase: StartProductionUseCase;
  let prisma: any;
  let audit: any;

  beforeEach(() => {
    prisma = {
      productionJob: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      proof: {
        count: vi.fn(),
      },
      machine: {
        update: vi.fn(),
      },
      $transaction: vi.fn(async (cb) => cb(prisma)),
    };
    audit = { log: vi.fn() };

    useCase = new StartProductionUseCase(prisma, audit);
  });

  it('locks production and throws BadRequestException if order is waiting for proof approval', async () => {
    prisma.productionJob.findUnique.mockResolvedValue({
      id: 'job-1',
      orderId: 'order-1',
      machineId: 'machine-1',
      status: 'Queue',
      order: {
        id: 'order-1',
        status: 'Proof_Pending_Approval',
      },
    });

    await expect(useCase.execute('job-1', 'operator-1')).rejects.toThrow(
      BadRequestException,
    );
    await expect(useCase.execute('job-1', 'operator-1')).rejects.toThrow(
      /Pekerjaan cetak terkunci: Bukti cetak \(Proof\) belum disetujui/,
    );
  });

  it('locks production if there are any pending or rejected proofs', async () => {
    prisma.productionJob.findUnique.mockResolvedValue({
      id: 'job-1',
      orderId: 'order-1',
      machineId: 'machine-1',
      status: 'Queue',
      order: {
        id: 'order-1',
        status: 'Approved',
      },
    });
    prisma.proof.count.mockResolvedValue(1); // 1 pending proof found

    await expect(useCase.execute('job-1', 'operator-1')).rejects.toThrow(
      /Pekerjaan cetak terkunci: Terdapat bukti cetak \(Proof\) yang masih menunggu persetujuan/,
    );
  });

  it('allows starting production when proofs are all resolved or approved', async () => {
    prisma.productionJob.findUnique.mockResolvedValue({
      id: 'job-1',
      orderId: 'order-1',
      machineId: 'machine-1',
      status: 'Assigned',
      order: {
        id: 'order-1',
        status: 'Proof_Approved',
      },
    });
    prisma.proof.count.mockResolvedValue(0);
    prisma.machine.update.mockResolvedValue({});
    prisma.productionJob.update.mockResolvedValue({
      id: 'job-1',
      status: 'In_Progress',
      startTime: new Date(),
    });

    const result = await useCase.execute('job-1', 'operator-1');
    expect(result.status).toBe('In_Progress');
    expect(prisma.machine.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'In_Use' } }),
    );
  });
});
