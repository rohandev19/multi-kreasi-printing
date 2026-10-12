import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { ProofLogic, ProofStatus } from '../domain/proof.entity';
import { OrderLogic } from '../domain/order.entity';
import { CreateProofDto } from '../dto/proof.dto';

@Injectable()
export class CreateProofUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(orderId: string, dto: CreateProofDto, designerId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Pesanan tidak ditemukan');
    }

    if (order.status === 'Cancelled' || order.status === 'Completed' || order.status === 'Delivered') {
      throw new BadRequestException(
        `Tidak dapat menambahkan bukti cetak pada pesanan dengan status ${order.status}`,
      );
    }

    // Get highest version for this order
    const latestProof = await this.prisma.proof.findFirst({
      where: { orderId },
      orderBy: { version: 'desc' },
    });

    const nextVersion = ProofLogic.getNextVersion(latestProof?.version);

    const result = await this.prisma.$transaction(async (tx) => {
      // Mark older active/rejected proofs as Superseded
      await tx.proof.updateMany({
        where: {
          orderId,
          status: { in: [ProofStatus.Pending_Approval, ProofStatus.Rejected] },
        },
        data: { status: ProofStatus.Superseded },
      });

      // Create new proof
      const createdProof = await tx.proof.create({
        data: {
          orderId,
          version: nextVersion,
          title: dto.title,
          description: dto.description,
          designerNotes: dto.designerNotes,
          fileUrl: dto.fileUrl,
          r2Path: dto.r2Path,
          thumbnailUrl: dto.thumbnailUrl,
          status: ProofStatus.Pending_Approval,
          createdBy: designerId,
        },
      });

      // Update Order Status to Proof_Pending_Approval if valid
      const targetOrderStatus = 'Proof_Pending_Approval';
      if (
        order.status !== targetOrderStatus &&
        OrderLogic.isValidTransition(order.status, targetOrderStatus)
      ) {
        await tx.order.update({
          where: { id: orderId },
          data: { status: targetOrderStatus, version: { increment: 1 } },
        });

        await tx.orderTimeline.create({
          data: {
            orderId,
            status: targetOrderStatus,
            notes: `Bukti cetak (Proof v${nextVersion}) telah diunggah dan menunggu persetujuan pelanggan`,
            createdBy: designerId,
          },
        });
      }

      return createdProof;
    });

    await this.audit.log({
      userId: designerId,
      action: 'PROOF_CREATED',
      entityType: 'Proof',
      entityId: result.id,
      newValue: {
        orderId,
        version: result.version,
        title: result.title,
        status: result.status,
      },
    });

    this.eventEmitter.emit('proof.created', {
      proofId: result.id,
      orderId,
      version: result.version,
      designerId,
    });

    return result;
  }
}
