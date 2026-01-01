import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private redisClient: Redis;

  onModuleInit() {
    this.redisClient = new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD,
    });

    this.redisClient.on('connect', () => {
      this.logger.log('Connected to Redis (Support for Memurai/Native Redis)');
    });

    this.redisClient.on('error', (err) => {
      this.logger.error(`Redis connection error: ${err.message}`);
    });
  }

  onModuleDestroy() {
    if (this.redisClient) {
      this.redisClient.disconnect();
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redisClient.get(key);
    return data ? JSON.parse(data) : null;
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const data = JSON.stringify(value);
    if (ttlSeconds) {
      await this.redisClient.set(key, data, 'EX', ttlSeconds);
    } else {
      await this.redisClient.set(key, data);
    }
  }

  async delete(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await this.redisClient.keys(pattern);
    if (keys.length > 0) {
      await this.redisClient.del(...keys);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const res = await this.redisClient.ping();
      return res === 'PONG';
    } catch {
      return false;
    }
  }
}
