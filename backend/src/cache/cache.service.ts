import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private redisClient: Redis | null;

  onModuleInit() {
    try {
      this.redisClient = new Redis({
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD,
        maxRetriesPerRequest: 1,
        retryStrategy: () => null, // Don't retry on failure
        lazyConnect: true, // Don't connect immediately
      });

      // Try to connect asynchronously
      this.redisClient.connect().catch((err) => {
        this.logger.warn(`Redis unavailable (optional): ${err.message}`);
        this.redisClient = null; // Set to null if connection fails
      });

      this.redisClient.on('connect', () => {
        this.logger.log('Connected to Redis (Support for Memurai/Native Redis)');
      });

      this.redisClient.on('error', (err) => {
        this.logger.warn(`Redis connection error (optional): ${err.message}`);
      });
    } catch (err) {
      this.logger.warn(`Redis initialization failed (optional): ${err.message}`);
      this.redisClient = null;
    }
  }

  onModuleDestroy() {
    if (this.redisClient) {
      this.redisClient.disconnect();
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.redisClient) return null;
    try {
      const data = await this.redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      this.logger.warn(`Redis get failed: ${err.message}`);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    if (!this.redisClient) return;
    try {
      const data = JSON.stringify(value);
      if (ttlSeconds) {
        await this.redisClient.set(key, data, 'EX', ttlSeconds);
      } else {
        await this.redisClient.set(key, data);
      }
    } catch (err) {
      this.logger.warn(`Redis set failed: ${err.message}`);
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.redisClient) return;
    try {
      await this.redisClient.del(key);
    } catch (err) {
      this.logger.warn(`Redis delete failed: ${err.message}`);
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    if (!this.redisClient) return;
    try {
      const keys = await this.redisClient.keys(pattern);
      if (keys.length > 0) {
        await this.redisClient.del(...keys);
      }
    } catch (err) {
      this.logger.warn(`Redis invalidate pattern failed: ${err.message}`);
    }
  }

  async healthCheck(): Promise<boolean> {
    if (!this.redisClient) return false;
    try {
      const res = await this.redisClient.ping();
      return res === 'PONG';
    } catch {
      return false;
    }
  }
}
