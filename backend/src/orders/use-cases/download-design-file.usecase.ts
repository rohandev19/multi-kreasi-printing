import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../../storage/storage.service';

@Injectable()
export class DownloadDesignFileUseCase {
  constructor(private prisma: PrismaService, private storage: StorageService) {}

  async execute(fileId: string, currentUserId: string, currentUserRole: string) {
    const file = await this.prisma.designFile.findUnique({ 
      where: { id: fileId },
      include: { order: true } 
    });
    if (!file) throw new NotFoundException('File desain tidak ditemukan');

    if (currentUserRole === 'Customer' && file.order.customerId !== currentUserId) {
      throw new ForbiddenException('Akses ditolak');
    }

    const url = await this.storage.getSignedUrl(file.r2Path);
    return { url };
  }
}
