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
import { Cache } from 'cache-manager';
import { Request } from 'express';

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();
    const idempotencyKey = request.headers['idempotency-key'] as string;

    if (!idempotencyKey) {
      // If no idempotency key is provided, just proceed normally
      return next.handle();
    }

    const cacheKey = `idempotency:${request.user?.['userId'] || 'guest'}:${idempotencyKey}`;
    
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
