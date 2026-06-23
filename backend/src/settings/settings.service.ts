import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.systemSettings.findMany({
      orderBy: { key: 'asc' },
    });
  }

  async findOne(key: string) {
    const setting = await this.prisma.systemSettings.findUnique({
      where: { key },
    });

    if (!setting) {
      throw new NotFoundException(`Setting with key ${key} not found`);
    }

    return setting;
  }

  async update(key: string, value: any, description?: string) {
    return this.prisma.systemSettings.upsert({
      where: { key },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      update: { value, ...(description && { description }) },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      create: { key, value, description },
    });
  }
}
