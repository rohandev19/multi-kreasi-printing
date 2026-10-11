import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsThrottlerGuard implements CanActivate {
  private readonly rateLimits = new Map<string, number[]>();
  private readonly LIMIT = 10; // Max messages
  private readonly WINDOW_MS = 10000; // per 10 seconds

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient();
    const userId = client.data?.user?.sub || client.id;

    const now = Date.now();

    let userRequests = this.rateLimits.get(userId) || [];

    // Filter requests within the window
    userRequests = userRequests.filter(
      (timestamp) => now - timestamp < this.WINDOW_MS,
    );

    if (userRequests.length >= this.LIMIT) {
      throw new WsException(
        'Too many messages, please wait a moment before sending more.',
      );
    }

    userRequests.push(now);
    this.rateLimits.set(userId, userRequests);

    // Simple memory cleanup every now and then could be added, but map size is bounded by active chat users
    return true;
  }
}
