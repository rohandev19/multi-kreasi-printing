import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '../../auth/jwt.service';

@WebSocketGateway({
  cors: {
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      const allowed = [
        process.env.FRONTEND_URL,
        process.env.APP_URL,
        'http://localhost:5173',
        'http://localhost:3000',
        'https://mkprinting.my.id',
      ].filter(Boolean);

      if (
        !origin ||
        allowed.includes(origin) ||
        process.env.NODE_ENV !== 'production'
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  },
})
export class NotificationsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(private readonly jwtService: JwtService) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket, ..._args: unknown[]) {
    try {
      const token = this.extractTokenFromHeader(client.handshake);
      if (!token) {
        this.logger.warn(
          `NotificationsGateway: No token provided by client ${client.id}`,
        );
        throw new Error('No token provided');
      }

      const payload = this.jwtService.verifyToken(token);
      if (!payload) {
        this.logger.warn(
          `NotificationsGateway: Invalid token by client ${client.id}`,
        );
        throw new Error('Invalid token');
      }

      // Join a room specifically for this user
      const userId = payload.sub;
      client.join(userId);
      this.logger.log(
        `NotificationsGateway: Client connected: ${client.id} (UserId: ${userId})`,
      );
    } catch (error) {
      this.logger.warn(
        `NotificationsGateway: Client connection failed: ${client.id} - ${error.message}`,
      );
      // Wait before disconnecting so client receives error if needed
      setTimeout(() => client.disconnect(), 100);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  private extractTokenFromHeader(
    handshake: Socket['handshake'],
  ): string | undefined {
    const authToken = (handshake.auth as { token?: string } | undefined)?.token;
    const auth = authToken || handshake.headers?.authorization;
    if (auth && auth.startsWith('Bearer ')) {
      return auth.substring(7);
    }
    return auth;
  }

  /**
   * Emit a notification to a specific user
   */
  sendNotificationToUser(
    userId: string,
    notification: Record<string, unknown>,
  ) {
    this.server.to(userId).emit('notification:new', notification);
    this.logger.debug(`Emitted notification:new to user ${userId}`);
  }
}
