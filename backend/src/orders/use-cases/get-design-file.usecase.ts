import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GetDesignFileUseCase {
  constructor(private prisma: PrismaService) {}

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

    return file;
  }
}
