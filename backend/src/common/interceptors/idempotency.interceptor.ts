import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  // Use 'any' type for cacheManager to avoid TS1272 decorator metadata error with interfaces
  constructor(@Inject(CACHE_MANAGER) private cacheManager: any) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<any>();
    const idempotencyKey = request.headers['idempotency-key'] as string;

    if (!idempotencyKey) {
      // If no idempotency key is provided, just proceed normally
      return next.handle();
    }

    const userId = request.user?.userId || 'guest';
    const cacheKey = `idempotency:${userId}:${idempotencyKey}`;

    // Check if we have a cached response
    const cachedResponse = await this.cacheManager.get(cacheKey);
    if (cachedResponse) {
      return of(cachedResponse);
    }

    // If not cached, proceed with the request and cache the successful response
    return next.handle().pipe(
      tap(async (response) => {
        // Cache the response for 24 hours (86400000 ms)
        await this.cacheManager.set(cacheKey, response, 86400000);
      }),
    );
  }
}
