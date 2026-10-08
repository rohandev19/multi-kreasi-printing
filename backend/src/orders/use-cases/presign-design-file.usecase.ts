import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../../storage/storage.service';
import {
  DesignFileLogic,
  DesignFileStatus,
} from '../domain/design-file.entity';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PresignDesignFileUseCase {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  async execute(
    orderId: string,
    originalName: string,
    mimeType: string,
    fileSize: number,
    currentUserId: string,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('Pesanan tidak ditemukan');

    if (!DesignFileLogic.isValidFileSize(fileSize)) {
      throw new BadRequestException('Ukuran file melebihi batas maksimal 100MB');
    }

    if (!DesignFileLogic.isValidFileType(mimeType)) {
      throw new BadRequestException('Tipe file tidak diizinkan. Gunakan PSD, AI, PDF, JPG, atau PNG.');
    }

    const fileExtension = path.extname(originalName).toLowerCase();
    
    // Determine the next version
    const lastVersionFile = await this.prisma.designFile.findFirst({
      where: { orderId },
      orderBy: { version: 'desc' },
    });

    const version = DesignFileLogic.getNextVersion(lastVersionFile?.version);

    const uniqueFilename = `${uuidv4()}${fileExtension}`;
    const r2Path = `orders/${orderId}/designs/v${version}/${uniqueFilename}`;

    // Get Presigned URL
    const presignedUrl = await this.storage.getPresignedUploadUrl(r2Path);

    // Save to DB as Pending_Upload
    const designFile = await this.prisma.designFile.create({
      data: {
        orderId,
        status: DesignFileStatus.Pending_Upload,
        version,
        originalName,
        r2Path,
        fileSize,
        mimeType,
        uploadedBy: currentUserId,
      },
    });

    return {
      designFileId: designFile.id,
      presignedUrl,
      r2Path,
      version,
    };
  }
}
