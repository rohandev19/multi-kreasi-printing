import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class UpdateCustomerUseCase {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async execute(id: string, dto: UpdateCustomerDto, currentUserId: string) {
    const existing = await this.prisma.customer.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Pelanggan tidak ditemukan');

    if (dto.email && dto.email !== existing.email) {
      const existingEmail = await this.prisma.customer.findUnique({
        where: { email: dto.email },
      });
      if (existingEmail)
        throw new ConflictException('Email pelanggan sudah terdaftar');
    }

    if (dto.npwp && dto.npwp !== existing.npwp) {
      const existingNpwp = await this.prisma.customer.findUnique({
        where: { npwp: dto.npwp },
      });
      if (existingNpwp)
        throw new ConflictException('NPWP pelanggan sudah terdaftar');
    }

    const updated = await this.prisma.customer.update({
      where: { id },
      data: dto,
    });

    await this.audit.log({
      userId: currentUserId,
      action: 'CUSTOMER_UPDATED',
      entityType: 'Customer',
      entityId: id,
    });

    return updated;
  }
}
