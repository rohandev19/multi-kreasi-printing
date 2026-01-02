import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class CreateCustomerUseCase {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async execute(dto: CreateCustomerDto, currentUserId: string) {
    if (dto.email) {
      const existingEmail = await this.prisma.customer.findUnique({
        where: { email: dto.email },
      });
      if (existingEmail)
        throw new ConflictException('Email pelanggan sudah terdaftar');
    }

    if (dto.npwp) {
      const existingNpwp = await this.prisma.customer.findUnique({
        where: { npwp: dto.npwp },
      });
      if (existingNpwp)
        throw new ConflictException('NPWP pelanggan sudah terdaftar');
    }

    const customer = await this.prisma.customer.create({
      data: {
        companyName: dto.companyName,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
        npwp: dto.npwp,
        loyaltyTier: 'Bronze',
        metrics: { totalRevenue: 0, totalOrders: 0 },
      },
    });

    await this.audit.log({
      userId: currentUserId,
      action: 'CUSTOMER_CREATED',
      entityType: 'Customer',
      entityId: customer.id,
      newValue: { companyName: customer.companyName },
    });

    return customer;
  }
}
