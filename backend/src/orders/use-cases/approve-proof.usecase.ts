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
import { ApproveProofDto } from '../dto/proof.dto';

@Injectable()
export class ApproveProofUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    proofId: string,
    dto: ApproveProofDto,
    currentUser: { id: string; role: string },
    clientIp?: string,
  ) {
    if (!dto.agreedToDisclaimer) {
      throw new BadRequestException(
        'Persetujuan disclaimer cetak wajib dicentang sebelum menyetujui bukti cetak',
      );
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

    // IDOR protection: Verify ownership for Customer role
    if (currentUser.role === 'Customer') {
      const user = await this.prisma.user.findUnique({
        where: { id: currentUser.id },
      });
      // Match by customer email or company email
      if (
        user &&
        proof.order.customer.email &&
        user.email !== proof.order.customer.email
      ) {
        throw new ForbiddenException(
          'Anda tidak memiliki izin untuk menyetujui bukti cetak pesanan ini',
        );
      }
    }

    if (!ProofLogic.isValidTransition(proof.status, ProofStatus.Approved)) {
      throw new BadRequestException(
        `Bukti cetak dengan status ${proof.status} tidak dapat disetujui`,
      );
    }

    const now = new Date();
    const result = await this.prisma.$transaction(async (tx) => {
      const updatedProof = await tx.proof.update({
        where: { id: proofId },
        data: {
          status: ProofStatus.Approved,
          approvedBy: currentUser.id,
          approvedAt: now,
          approvalIp: clientIp,
          customerNotes: dto.customerNotes,
        },
      });

      // Update Order Status to Proof_Approved
      const targetOrderStatus = 'Proof_Approved';
      if (OrderLogic.isValidTransition(proof.order.status, targetOrderStatus)) {
        await tx.order.update({
          where: { id: proof.orderId },
          data: { status: targetOrderStatus, version: { increment: 1 } },
        });

        await tx.orderTimeline.create({
          data: {
            orderId: proof.orderId,
            status: targetOrderStatus,
            notes: `Bukti cetak (Proof v${proof.version}) disetujui oleh pelanggan. Pekerjaan cetak siap dialirkan ke antrean produksi.`,
            createdBy: currentUser.id,
          },
        });
      }

      return updatedProof;
    });

    await this.audit.log({
      userId: currentUser.id,
      action: 'PROOF_APPROVED',
      entityType: 'Proof',
      entityId: proofId,
      oldValue: { status: proof.status },
      newValue: {
        status: result.status,
        approvedAt: now,
        approvalIp: clientIp,
      },
      ipAddress: clientIp,
    });

    this.eventEmitter.emit('proof.approved', {
      proofId,
      orderId: proof.orderId,
      version: proof.version,
      approvedBy: currentUser.id,
    });

    return result;
  }
}
