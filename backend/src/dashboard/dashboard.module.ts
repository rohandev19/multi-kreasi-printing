import { Module, Logger } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { DashboardController } from './dashboard.controller';
import { GetDashboardMetricsUseCase } from './use-cases/get-dashboard-metrics.usecase';
import { GetRevenueChartDataUseCase } from './use-cases/get-revenue-chart-data.usecase';
import { GetProductionStatusUseCase } from './use-cases/get-production-status.usecase';
import { CalculateKPIsUseCase } from './use-cases/calculate-kpis.usecase';
import { DashboardCacheInvalidationListener } from './listeners/dashboard-cache-invalidation.listener';
import { AuthModule } from '../auth/auth.module';

import { GetOwnerMetricsUseCase } from './use-cases/get-owner-metrics.usecase';
import { GetManagerMetricsUseCase } from './use-cases/get-manager-metrics.usecase';
import { GetDesignerMetricsUseCase } from './use-cases/get-designer-metrics.usecase';
import { GetProductionStaffMetricsUseCase } from './use-cases/get-production-staff-metrics.usecase';
import { GetWarehouseStaffMetricsUseCase } from './use-cases/get-warehouse-staff-metrics.usecase';
import { GetFinanceStaffMetricsUseCase } from './use-cases/get-finance-staff-metrics.usecase';
import { GetCustomerMetricsUseCase } from './use-cases/get-customer-metrics.usecase';
import { GetSalesMetricsUseCase } from './use-cases/get-sales-metrics.usecase';

@Module({
  imports: [
    NestCacheModule.register({
      ttl: 300, // 5 minutes default TTL in seconds
      max: 100, // maximum number of items in cache
    }),
    AuthModule,
  ],
  controllers: [DashboardController],
  providers: [
    Logger,
    GetDashboardMetricsUseCase,
    GetOwnerMetricsUseCase,
    GetManagerMetricsUseCase,
    GetDesignerMetricsUseCase,
    GetProductionStaffMetricsUseCase,
    GetWarehouseStaffMetricsUseCase,
    GetFinanceStaffMetricsUseCase,
    GetCustomerMetricsUseCase,
    GetSalesMetricsUseCase,
    GetRevenueChartDataUseCase,
    GetProductionStatusUseCase,
    CalculateKPIsUseCase,
    DashboardCacheInvalidationListener,
  ],
})
export class DashboardModule {}
