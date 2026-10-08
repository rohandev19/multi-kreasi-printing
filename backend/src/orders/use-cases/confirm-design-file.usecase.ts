import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../../storage/storage.service';
import {
  DesignFileLogic,
  DesignFileStatus,
} from '../domain/design-file.entity';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class ConfirmDesignFileUseCase {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
    private audit: AuditService,
  ) {}

  async execute(orderId: string, designFileId: string, currentUserId: string) {
    const designFile = await this.prisma.designFile.findUnique({
      where: { id: designFileId },
    });

    if (!designFile || designFile.orderId !== orderId) {
      throw new NotFoundException('Design file tidak ditemukan');
    }

    if (designFile.status !== DesignFileStatus.Pending_Upload) {
      throw new BadRequestException('File ini tidak dalam status Pending Upload');
    }

    // In a real world scenario, we might want to check the file size/type here
    // using a HEAD request to S3, but for this mock we just transition the state.
    // Also, we can trigger background worker (BullMQ) to generate thumbnail here.

    const updated = await this.prisma.designFile.update({
      where: { id: designFileId },
      data: {
        status: DesignFileStatus.Uploaded,
      },
    });

    await this.audit.log({
      userId: currentUserId,
      action: 'DESIGN_FILE_UPLOAD_CONFIRMED',
      entityType: 'DesignFile',
      entityId: updated.id,
      newValue: { status: updated.status, r2Path: updated.r2Path },
    });

    return updated;
  }
}
