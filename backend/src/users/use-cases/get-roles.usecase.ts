import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GetRolesUseCase {
  constructor(private prisma: PrismaService) {}

  async execute() {
    const roles = await this.prisma.role.findMany({
      select: {
        id: true,
        name: true,
        displayName: true,
        description: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return {
      data: roles,
    };
  }
}
