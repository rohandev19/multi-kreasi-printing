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

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    if (!this.redisClient) return;
    try {
      const data = JSON.stringify(value);
      if (ttlSeconds) {
        await this.redisClient.set(key, data, 'EX', ttlSeconds);
      } else {
        await this.redisClient.set(key, data);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Redis set failed: ${msg}`);
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
      // Non-blocking scan stream prevents freezing Redis single-thread
      const stream = this.redisClient.scanStream({
        match: pattern,
        count: 100,
      });

      const keysToDelete: string[] = [];

      stream.on('data', (resultKeys: string[]) => {
        for (const k of resultKeys) {
          keysToDelete.push(k);
        }
      });

      await new Promise<void>((resolve, reject) => {
        stream.on('end', () => {
          (async () => {
            if (keysToDelete.length > 0 && this.redisClient) {
              const batchSize = 100;
              for (let i = 0; i < keysToDelete.length; i += batchSize) {
                const batch = keysToDelete.slice(i, i + batchSize);
                await this.redisClient.del(...batch);
              }
            }
          })()
            .then(() => resolve())
            .catch((err: unknown) =>
              reject(err instanceof Error ? err : new Error(String(err))),
            );
        });
        stream.on('error', (streamErr: unknown) =>
          reject(
            streamErr instanceof Error
              ? streamErr
              : new Error(String(streamErr)),
          ),
        );
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Redis invalidate pattern failed: ${msg}`);
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
