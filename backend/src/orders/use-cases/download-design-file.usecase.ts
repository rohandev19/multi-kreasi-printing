import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
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
    const whereClause: Prisma.DesignFileWhereInput = { id: fileId };
    
    if (user.role === 'Customer' && user.email) {
      whereClause.order = { customer: { email: user.email } };
    }

    const file = await this.prisma.designFile.findFirst({
      where: whereClause,
      include: { order: { include: { customer: true } } },
    });
    
    if (!file) throw new NotFoundException('File desain tidak ditemukan');

    const url = await this.storage.getSignedUrl(file.r2Path);
    return { url };
  }
}
