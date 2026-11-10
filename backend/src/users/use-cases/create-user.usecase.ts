import {
  Injectable,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class CreateUserUseCase {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async execute(
    dto: CreateUserDto,
    currentUserId: string,
    currentUserRole?: string,
  ) {
    if (dto.roleId && currentUserRole !== 'Owner') {
      const targetRole = await this.prisma.role?.findUnique?.({
        where: { id: dto.roleId },
      });
      if (targetRole?.name === 'Owner' || targetRole?.name === 'Admin') {
        throw new ForbiddenException(
          'Hanya Owner yang dapat membuat akun dengan role Owner atau Admin',
        );
      }
    }

    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email sudah terdaftar');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        fullName: dto.fullName,
        roleId: dto.roleId,
        status: 'ACTIVE',
        phone: dto.phone,
      },
    });

    await this.audit.log({
      userId: currentUserId,
      action: 'USER_CREATED',
      entityType: 'User',
      entityId: user.id,
      newValue: { email: user.email, roleId: user.roleId },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...result } = user;
    return result;
  }
}
