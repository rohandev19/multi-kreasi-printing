import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../../storage/storage.service';

@Injectable()
export class DownloadDesignFileUseCase {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  async execute(
    fileId: string,
    user: { sub?: string; role?: string; email?: string },
  ) {
    const file = await this.prisma.designFile.findUnique({
      where: { id: fileId },
      include: { order: { include: { customer: true } } },
    });
    if (!file) throw new NotFoundException('File desain tidak ditemukan');

    if (
      user.role === 'Customer' &&
      file.order.customer?.email !== user.email
    ) {
      throw new ForbiddenException('Akses ditolak');
    }

    const url = await this.storage.getSignedUrl(file.r2Path);
    return { url };
  }
}
