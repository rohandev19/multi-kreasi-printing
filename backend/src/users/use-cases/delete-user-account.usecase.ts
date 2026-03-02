import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DeleteUserAccountUseCase {
  private prisma = new PrismaClient();

  async execute(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Right to be forgotten: Anonymize the PII rather than Hard Delete
    // Hard deletes compromise financial ledgers and past orders
    const deletedIdentifier = `deleted_${userId}@anonymized.local`;

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        email: deletedIdentifier,
        fullName: 'Deleted User',
        phone: null,
        avatarUrl: null,
        status: 'Deleted',
        deletedAt: new Date(),
        // we can also randomize the password hash so login is strictly impossible
        passwordHash: 'INVALIDATED_HASH',
      },
    });

    // Optionally: Drop preferences, design files (if PII is in them), etc.
    await this.prisma.widgetPreference.deleteMany({ where: { userId } });
    await this.prisma.notificationPreference.deleteMany({ where: { userId } });

    return { success: true, message: 'Account and PII have been securely deleted/anonymized.' };
  }
}
