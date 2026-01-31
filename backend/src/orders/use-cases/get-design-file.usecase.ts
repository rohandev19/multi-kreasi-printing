import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GetDesignFileUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(fileId: string, currentUserId: string, currentUserRole: string) {
    const file = await this.prisma.designFile.findUnique({ 
      where: { id: fileId },
      include: { order: true } 
    });
    if (!file) throw new NotFoundException('File desain tidak ditemukan');

    // IDOR Prevention
    if (currentUserRole === 'Customer' && file.order.customerId !== currentUserId) {
      throw new ForbiddenException('Akses ditolak');
    }

    return file;
  }
}
