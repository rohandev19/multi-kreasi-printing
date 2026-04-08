import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  DesignFileLogic,
  DesignFileStatus,
} from '../domain/design-file.entity';
import { AuditService } from '../../audit/audit.service';
import { ReviewDesignFileDto } from '../dto/review-design-file.dto';

@Injectable()
export class ReviewDesignFileUseCase {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async execute(
    fileId: string,
    dto: ReviewDesignFileDto,
    currentUserId: string,
  ) {
    const file = await this.prisma.designFile.findUnique({
      where: { id: fileId },
    });
    if (!file) throw new NotFoundException('File desain tidak ditemukan');

    if (!DesignFileLogic.isValidTransition(file.status, dto.status)) {
      throw new BadRequestException(
        `Transisi status file dari ${file.status} ke ${dto.status} tidak valid`,
      );
    }

    if (
      (dto.status === DesignFileStatus.Rejected ||
        dto.status === DesignFileStatus.Revision_Required) &&
      !dto.notes
    ) {
      throw new BadRequestException('Alasan penolakan atau revisi harus diisi');
    }

    const updated = await this.prisma.designFile.update({
      where: { id: fileId },
      data: {
        status: dto.status,
        notes: dto.notes,
      },
    });

    await this.audit.log({
      userId: currentUserId,
      action: 'DESIGN_FILE_REVIEWED',
      entityType: 'DesignFile',
      entityId: fileId,
      oldValue: { status: file.status },
      newValue: { status: updated.status, notes: dto.notes },
    });

    return updated;
  }
}
