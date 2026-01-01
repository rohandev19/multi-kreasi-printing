import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(data: {
    userId?: string;
    action: string;
    entityType?: string;
    entityId?: string;
    oldValue?: any;
    newValue?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        oldValue: data.oldValue ? JSON.parse(JSON.stringify(data.oldValue)) : undefined,
        newValue: data.newValue ? JSON.parse(JSON.stringify(data.newValue)) : undefined,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  }
}
