import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
  ConflictException,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import type { AuthenticatedRequest } from '../../auth/jwt.service';

const IN_PROGRESS_MARKER = '__IDEMPOTENCY_IN_PROGRESS__';

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  private readonly inFlightKeys = new Set<string>();

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const rawHeader = request.headers['idempotency-key'];
    const idempotencyKey = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;

    if (!idempotencyKey) {
      // If no idempotency key is provided, just proceed normally
      return next.handle();
    }

    const userId =
      request.user?.id || request.user?.sub || request.user?.userId || 'guest';
    const cacheKey = `idempotency:${userId}:${idempotencyKey}`;

    if (this.inFlightKeys.has(cacheKey)) {
      throw new ConflictException(
        'Permintaan dengan Idempotency-Key ini sedang diproses (Concurrent Request)',
      );
    }

    // Check if we have a cached response
    const cachedResponse = await this.cacheManager.get(cacheKey);
    if (cachedResponse === IN_PROGRESS_MARKER) {
      throw new ConflictException(
        'Permintaan dengan Idempotency-Key ini sedang diproses (Concurrent Request)',
      );
    }
    if (cachedResponse) {
      return of(cachedResponse);
    }

    this.inFlightKeys.add(cacheKey);
    await this.cacheManager.set(cacheKey, IN_PROGRESS_MARKER, 30000);

    // If not cached, proceed with the request and cache the successful response
    return next.handle().pipe(
      tap((response) => {
        // Cache the response for 24 hours (86400000 ms)
        void this.cacheManager.set(cacheKey, response, 86400000);
      }),
      finalize(() => {
        this.inFlightKeys.delete(cacheKey);
      }),
    );
  }
}
