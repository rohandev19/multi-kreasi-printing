import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { UpdateUserDto } from '../dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async execute(id: string, dto: UpdateUserDto, currentUserId: string) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Pengguna tidak ditemukan');

    const { password, ...rest } = dto;
    const updateData: Prisma.UserUpdateInput = { ...rest };
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    await this.audit.log({
      userId: currentUserId,
      action: 'USER_UPDATED',
      entityType: 'User',
      entityId: updatedUser.id,
      oldValue: { roleId: existing.roleId, status: existing.status },
      newValue: { roleId: updatedUser.roleId, status: updatedUser.status },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...result } = updatedUser;
    return result;
  }
}
