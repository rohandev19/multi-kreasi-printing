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
    origin: '*',
  },
})
export class NotificationsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(
    private readonly jwtService: JwtService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket, ...args: any[]) {
    try {
      const token = this.extractTokenFromHeader(client.handshake);
      if (!token) {
        throw new Error('No token provided');
      }

      const payload = this.jwtService.verifyToken(token);

      // Join a room specifically for this user
      const userId = payload.sub;
      client.join(userId);
      this.logger.log(`Client connected: ${client.id} (UserId: ${userId})`);
    } catch (error) {
      this.logger.warn(`Client connection failed: ${client.id} - ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  private extractTokenFromHeader(handshake: any): string | undefined {
    const auth = handshake.auth?.token || handshake.headers?.authorization;
    if (auth && auth.startsWith('Bearer ')) {
      return auth.substring(7);
    }
    return auth;
  }

  /**
   * Emit a notification to a specific user
   */
  sendNotificationToUser(userId: string, notification: any) {
    this.server.to(userId).emit('notification:new', notification);
    this.logger.debug(`Emitted notification:new to user ${userId}`);
  }
}
