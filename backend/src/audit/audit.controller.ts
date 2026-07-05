import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/v1/audit')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @Roles('Owner', 'Manager')
  async getAuditLogs(@Query('limit') limitStr?: string) {
    const limit = limitStr ? parseInt(limitStr, 10) : 50;

    const logs = await this.prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    return { data: logs };
  }
}
