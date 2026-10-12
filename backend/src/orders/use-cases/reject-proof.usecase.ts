import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { ProofLogic, ProofStatus } from '../domain/proof.entity';
import { OrderLogic } from '../domain/order.entity';
import { RejectProofDto } from '../dto/proof.dto';

@Injectable()
export class RejectProofUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    proofId: string,
    dto: RejectProofDto,
    currentUser: { id: string; role: string },
    clientIp?: string,
  ) {
    if (!dto.customerNotes || !dto.customerNotes.trim()) {
      throw new BadRequestException('Alasan penolakan atau catatan revisi wajib diisi');
    }

    const proof = await this.prisma.proof.findUnique({
      where: { id: proofId },
      include: {
        order: {
          include: {
            customer: true,
          },
        },
      },
    });

    if (!proof) {
      throw new NotFoundException('Bukti cetak (proof) tidak ditemukan');
    }

    // IDOR protection
    if (currentUser.role === 'Customer') {
      const user = await this.prisma.user.findUnique({
        where: { id: currentUser.id },
      });
      if (user && proof.order.customer.email && user.email !== proof.order.customer.email) {
        throw new ForbiddenException(
          'Anda tidak memiliki izin untuk meminta revisi bukti cetak pesanan ini',
        );
      }
    }

    if (!ProofLogic.isValidTransition(proof.status, ProofStatus.Rejected)) {
      throw new BadRequestException(
        `Bukti cetak dengan status ${proof.status} tidak dapat ditolak`,
      );
    }

    const now = new Date();
    const result = await this.prisma.$transaction(async (tx) => {
      const updatedProof = await tx.proof.update({
        where: { id: proofId },
        data: {
          status: ProofStatus.Rejected,
          customerNotes: dto.customerNotes,
          rejectedAt: now,
        },
      });

      // Update Order Status to Proof_Rejected
      const targetOrderStatus = 'Proof_Rejected';
      if (OrderLogic.isValidTransition(proof.order.status, targetOrderStatus)) {
        await tx.order.update({
          where: { id: proof.orderId },
          data: { status: targetOrderStatus, version: { increment: 1 } },
        });

        await tx.orderTimeline.create({
          data: {
            orderId: proof.orderId,
            status: targetOrderStatus,
            notes: `Bukti cetak (Proof v${proof.version}) ditolak pelanggan. Revisi: "${dto.customerNotes}"`,
            createdBy: currentUser.id,
          },
        });
      }

      return updatedProof;
    });

    await this.audit.log({
      userId: currentUser.id,
      action: 'PROOF_REJECTED',
      entityType: 'Proof',
      entityId: proofId,
      oldValue: { status: proof.status },
      newValue: {
        status: result.status,
        customerNotes: dto.customerNotes,
        rejectedAt: now,
      },
      ipAddress: clientIp,
    });

    this.eventEmitter.emit('proof.rejected', {
      proofId,
      orderId: proof.orderId,
      version: proof.version,
      rejectedBy: currentUser.id,
      notes: dto.customerNotes,
    });

    return result;
  }
}
