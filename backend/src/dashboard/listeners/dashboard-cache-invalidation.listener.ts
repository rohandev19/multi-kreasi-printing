import { Injectable, Logger, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class DashboardCacheInvalidationListener {
  private readonly logger = new Logger(DashboardCacheInvalidationListener.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  @OnEvent('order.created')
  @OnEvent('order.completed')
  @OnEvent('payment.received')
  @OnEvent('invoice.generated')
  async handleDomainEventsToInvalidateDashboard() {
    this.logger.log(
      'Domain event received. Invalidating dashboard cache keys...',
    );
    try {
      await this.cacheManager.del('dashboard-metrics');
      await this.cacheManager.del('dashboard-kpis');
      await this.cacheManager.del('dashboard-revenue-chart');
      this.logger.debug('Dashboard cache invalidated successfully.');
    } catch (error) {
      this.logger.error('Failed to invalidate dashboard cache', error);
    }
  }
}
