import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CacheModule } from './cache/cache.module';
import { LoggerModule } from './logger/logger.module';
import { LoggingMiddleware } from './logger/logging.middleware';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AuditModule } from './audit/audit.module';
import { UsersModule } from './users/users.module';
import { CustomersModule } from './customers/customers.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { ProductionModule } from './production/production.module';
import { FinanceModule } from './finance/finance.module';
import { EventsModule } from './events/events.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { LegalModule } from './legal/legal.module';
import { CartModule } from './cart/cart.module';
import { InventoryModule } from './inventory/inventory.module';
import { BullModule } from '@nestjs/bullmq';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import { APP_GUARD } from '@nestjs/core';
import { QuotationsModule } from './quotations/quotations.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule,
    LoggerModule,
    PrismaModule,
    AuthModule,
    AuditModule,
    UsersModule,
    CustomersModule,
    ProductsModule,
    OrdersModule,
    ProductionModule,
    FinanceModule,
    EventsModule,
    NotificationsModule,
    DashboardModule,
    LegalModule,
    CartModule,
    InventoryModule,
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
    }),
    ThrottlerModule.forRootAsync({
      useFactory: () => ({
        throttlers: [
          {
            ttl: parseInt(process.env.RATE_LIMIT_TTL || '60000', 10), // default 1 minute
            limit: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // default 100 requests
          },
        ],
        storage:
          process.env.NODE_ENV === 'production'
            ? new ThrottlerStorageRedisService({
                host: process.env.REDIS_HOST || '127.0.0.1',
                port: parseInt(process.env.REDIS_PORT || '6379', 10),
                password: process.env.REDIS_PASSWORD,
              })
            : undefined,
      }),
    }),
    QuotationsModule,
    SettingsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggingMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
