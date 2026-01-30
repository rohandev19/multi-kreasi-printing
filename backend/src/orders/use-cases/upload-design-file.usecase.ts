import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../../storage/storage.service';
import { DesignFileLogic, DesignFileStatus } from '../domain/design-file.entity';
import { AuditService } from '../../audit/audit.service';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadDesignFileUseCase {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
    private audit: AuditService,
  ) {}

  async execute(orderId: string, file: Express.Multer.File, notes: string | undefined, currentUserId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Pesanan tidak ditemukan');

    if (!DesignFileLogic.isValidFileSize(file.size)) {
      throw new BadRequestException('Ukuran file melebihi batas maksimal 100MB');
    }

    if (!DesignFileLogic.isValidFileType(file.mimetype)) {
      throw new BadRequestException('Tipe file tidak diizinkan. Gunakan PSD, AI, PDF, JPG, atau PNG.');
    }

    // Determine the next version
    const lastVersionFile = await this.prisma.designFile.findFirst({
      where: { orderId },
      orderBy: { version: 'desc' },
    });
    
    const version = DesignFileLogic.getNextVersion(lastVersionFile?.version);

    // Upload to R2
    const fileExtension = path.extname(file.originalname);
    const uniqueFilename = `${uuidv4()}${fileExtension}`;
    const r2Path = `orders/${orderId}/designs/v${version}/${uniqueFilename}`;

    await this.storage.uploadFile(r2Path, file.buffer, file.mimetype);

    // Save to DB
    const designFile = await this.prisma.designFile.create({
      data: {
        orderId,
        status: DesignFileStatus.Uploaded,
        version,
        originalName: file.originalname,
        r2Path,
        fileSize: file.size,
        mimeType: file.mimetype,
        notes,
        uploadedBy: currentUserId,
      }
    });

    await this.audit.log({
      userId: currentUserId,
      action: 'DESIGN_FILE_UPLOADED',
      entityType: 'DesignFile',
      entityId: designFile.id,
      newValue: { version, fileName: file.originalname },
    });

    return designFile;
  }
}
