import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class ExportUserDataUseCase {
  private prisma = new PrismaClient();

  async execute(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        orderTimelines: true,
        designFiles: true,
        productionJobs: true,
        invoices: true,
        notificationPreferences: true,
        widgetPreference: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Map to a generic structure that respects privacy and removes sensitive fields like passwordHash
    const { passwordHash, ...safeUserData } = user;
    
    // Structure the JSON export payload
    const exportPayload = {
      exportedAt: new Date().toISOString(),
      userInfo: safeUserData,
    };

    return exportPayload;
  }
}
