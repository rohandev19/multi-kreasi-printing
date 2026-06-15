import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GetDesignFileUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(
    fileId: string,
    user: { sub?: string; role?: string; email?: string },
  ) {
    const file = await this.prisma.designFile.findUnique({
      where: { id: fileId },
      include: { order: { include: { customer: true } } },
    });
    if (!file) throw new NotFoundException('File desain tidak ditemukan');

    // IDOR Prevention
    if (
      user.role === 'Customer' &&
      file.order.customer?.email !== user.email
    ) {
      throw new ForbiddenException('Akses ditolak');
    }

    return file;
  }
}
