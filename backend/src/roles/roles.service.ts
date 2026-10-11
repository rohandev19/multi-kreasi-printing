import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    name: string;
    displayName?: string;
    description?: string;
    permissions?: { action: string; subject: string; conditions?: any }[];
  }) {
    const existing = await this.prisma.role.findUnique({
      where: { name: data.name },
    });
    if (existing) {
      throw new ConflictException('Role name already exists');
    }

    return this.prisma.role.create({
      data: {
        name: data.name,
        displayName: data.displayName || data.name,
        description: data.description,
        permissions: {
          create: data.permissions || [],
        },
      },
      include: {
        permissions: true,
      },
    });
  }

  async findAll() {
    return this.prisma.role.findMany({
      include: { permissions: true },
    });
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: { permissions: true },
    });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async update(
    id: string,
    data: {
      name?: string;
      displayName?: string;
      description?: string;
      permissions?: { action: string; subject: string; conditions?: any }[];
    },
  ) {
    return this.prisma.role.update({
      where: { id },
      data: {
        name: data.name,
        displayName: data.displayName,
        description: data.description,
        ...(data.permissions && {
          permissions: {
            set: [], // Disconnect all old ones
            create: data.permissions,
          },
        }),
      },
      include: {
        permissions: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.role.delete({
      where: { id },
    });
  }
}
