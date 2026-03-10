import { Module, Logger } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { DashboardController } from './dashboard.controller';
import { GetDashboardMetricsUseCase } from './use-cases/get-dashboard-metrics.usecase';
import { GetRevenueChartDataUseCase } from './use-cases/get-revenue-chart-data.usecase';
import { GetProductionStatusUseCase } from './use-cases/get-production-status.usecase';
import { CalculateKPIsUseCase } from './use-cases/calculate-kpis.usecase';
import { DashboardCacheInvalidationListener } from './listeners/dashboard-cache-invalidation.listener';
import { AuthModule } from '../auth/auth.module';

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
    GetRevenueChartDataUseCase,
    GetProductionStatusUseCase,
    CalculateKPIsUseCase,
    DashboardCacheInvalidationListener,
  ],
})
export class DashboardModule {}
