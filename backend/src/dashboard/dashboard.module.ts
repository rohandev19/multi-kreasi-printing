import { Module, Logger } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { DashboardController } from './dashboard.controller';
import { GetDashboardMetricsUseCase } from './use-cases/get-dashboard-metrics.usecase';
import { GetRevenueChartDataUseCase } from './use-cases/get-revenue-chart-data.usecase';
import { GetProductionStatusUseCase } from './use-cases/get-production-status.usecase';
import { CalculateKPIsUseCase } from './use-cases/calculate-kpis.usecase';
import { DashboardCacheInvalidationListener } from './listeners/dashboard-cache-invalidation.listener';

@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: async () => ({
        store: await redisStore({
          url: process.env.REDIS_URL || 'redis://localhost:6379',
        }),
      }),
    }),
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
