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
      const redisOptions = {
        maxRetriesPerRequest: 1,
        retryStrategy: (times: number) => {
          if (process.env.NODE_ENV === 'production') {
            return Math.min(times * 50, 2000);
          }
          return null;
        },
        lazyConnect: process.env.NODE_ENV !== 'production',
        // Auto-detect TLS from rediss:// scheme (e.g. Heroku Key-Value) or explicit flag
        tls:
          process.env.REDIS_URL?.startsWith('rediss://') ||
          process.env.REDIS_TLS === 'true'
            ? { rejectUnauthorized: false }
            : undefined,
      };

      this.redisClient = process.env.REDIS_URL
        ? new Redis(process.env.REDIS_URL, redisOptions)
        : new Redis({
            ...redisOptions,
            host: process.env.REDIS_HOST || '127.0.0.1',
            port: parseInt(process.env.REDIS_PORT || '6379', 10),
            password: process.env.REDIS_PASSWORD,
          });

      // Handle async connection specifically for development fallback
      if (process.env.NODE_ENV !== 'production') {
        this.redisClient.connect().catch((err) => {
          this.logger.warn(
            `Redis unavailable in development: ${err.message}. Bypassing cache.`,
          );
          this.redisClient = null;
        });
      } else {
        // In production, catch error events but don't set client to null
        // because we want it to reconnect using the retryStrategy
      }

      this.redisClient.on('connect', () => {
        this.logger.log('Connected to Redis successfully');
      });

      this.redisClient.on('error', (err) => {
        if (process.env.NODE_ENV === 'production') {
          this.logger.error(
            `Redis connection error (MANDATORY IN PROD): ${err.message}`,
          );
        } else {
          this.logger.warn(`Redis connection error: ${err.message}`);
        }
      });
    } catch (err) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error(
          `CRITICAL: Failed to initialize Redis which is mandatory in production. Error: ${err.message}`,
        );
      } else {
        this.logger.warn(`Redis initialization failed: ${err.message}`);
        this.redisClient = null;
      }
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
