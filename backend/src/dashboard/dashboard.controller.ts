import {
  Body,
  Controller,
  Get,
  Patch,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetDashboardMetricsUseCase } from './use-cases/get-dashboard-metrics.usecase';
import { CalculateKPIsUseCase } from './use-cases/calculate-kpis.usecase';
import { GetRevenueChartDataUseCase } from './use-cases/get-revenue-chart-data.usecase';
import { GetProductionStatusUseCase } from './use-cases/get-production-status.usecase';
import { createPrismaClient } from '../prisma/prisma-client.helper';
import { UpdateWidgetPreferenceDto } from './dto/widget-preference.dto';

import { GetOwnerMetricsUseCase } from './use-cases/get-owner-metrics.usecase';
import { GetManagerMetricsUseCase } from './use-cases/get-manager-metrics.usecase';
import { GetDesignerMetricsUseCase } from './use-cases/get-designer-metrics.usecase';
import { GetProductionStaffMetricsUseCase } from './use-cases/get-production-staff-metrics.usecase';
import { GetWarehouseStaffMetricsUseCase } from './use-cases/get-warehouse-staff-metrics.usecase';
import { GetFinanceStaffMetricsUseCase } from './use-cases/get-finance-staff-metrics.usecase';
import { GetCustomerMetricsUseCase } from './use-cases/get-customer-metrics.usecase';
import { Param, ForbiddenException } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('v1/dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  private prisma = createPrismaClient();

  constructor(
    private readonly getMetrics: GetDashboardMetricsUseCase,
    private readonly getOwnerMetrics: GetOwnerMetricsUseCase,
    private readonly getManagerMetrics: GetManagerMetricsUseCase,
    private readonly getDesignerMetrics: GetDesignerMetricsUseCase,
    private readonly getProductionStaffMetrics: GetProductionStaffMetricsUseCase,
    private readonly getWarehouseStaffMetrics: GetWarehouseStaffMetricsUseCase,
    private readonly getFinanceStaffMetrics: GetFinanceStaffMetricsUseCase,
    private readonly getCustomerMetrics: GetCustomerMetricsUseCase,
    private readonly calculateKpis: CalculateKPIsUseCase,
    private readonly getRevenueChart: GetRevenueChartDataUseCase,
    private readonly getProductionStatus: GetProductionStatusUseCase,
  ) {}

  @Get('metrics')
  @UseInterceptors(CacheInterceptor)
  @CacheKey('dashboard-metrics')
  @CacheTTL(300000) // 5 minutes
  async getDashboardMetrics() {
    return this.getMetrics.execute();
  }

  @Get('metrics/:role')
  async getRoleMetrics(@Param('role') role: string, @Request() req: any) {
    const userRole = req.user.role;

    if (userRole !== 'Owner' && userRole.toLowerCase() !== role.toLowerCase()) {
      throw new ForbiddenException(`Cannot access metrics for role: ${role}`);
    }

    const userId = req.user.sub;

    switch (role.toLowerCase()) {
      case 'owner':
        return this.getOwnerMetrics.execute();
      case 'manager':
        return this.getManagerMetrics.execute();
      case 'designer':
        return this.getDesignerMetrics.execute();
      case 'production_staff':
        return this.getProductionStaffMetrics.execute(userId);
      case 'warehouse_staff':
        return this.getWarehouseStaffMetrics.execute();
      case 'finance_staff':
        return this.getFinanceStaffMetrics.execute();
      case 'customer':
        return this.getCustomerMetrics.execute(userId);
      default:
        return this.getMetrics.execute();
    }
  }

  @Get('kpis')
  @UseInterceptors(CacheInterceptor)
  @CacheKey('dashboard-kpis')
  @CacheTTL(900000) // 15 minutes
  async getKpis() {
    return this.calculateKpis.execute();
  }

  @Get('charts/revenue')
  @UseInterceptors(CacheInterceptor)
  @CacheKey('dashboard-revenue-chart')
  @CacheTTL(1800000) // 30 minutes
  async getRevenueChartData() {
    return this.getRevenueChart.execute();
  }

  @Get('production-status')
  // We do not cache production status as it requires real-time overview for queue
  async getProductionOverview() {
    return this.getProductionStatus.execute();
  }

  @Get('preferences')
  async getWidgetPreferences(@Request() req: any) {
    const userId = req.user.sub;
    let pref = await this.prisma.widgetPreference.findUnique({
      where: { userId },
    });

    if (!pref) {
      // Create defaults
      pref = await this.prisma.widgetPreference.create({
        data: {
          userId,
          layoutOrder: [
            'revenue',
            'orders',
            'kpis',
            'chart',
            'production',
            'low_stock',
          ],
          enabledWidgets: [
            'revenue',
            'orders',
            'kpis',
            'chart',
            'production',
            'low_stock',
          ],
        },
      });
    }

    return pref;
  }

  @Patch('preferences')
  async updateWidgetPreferences(
    @Request() req: any,
    @Body() body: UpdateWidgetPreferenceDto,
  ) {
    const userId = req.user.sub;

    return this.prisma.widgetPreference.upsert({
      where: { userId },
      update: {
        layoutOrder: body.layoutOrder,
        enabledWidgets: body.enabledWidgets,
      },
      create: {
        userId,
        layoutOrder: body.layoutOrder || [],
        enabledWidgets: body.enabledWidgets || [],
      },
    });
  }
}
