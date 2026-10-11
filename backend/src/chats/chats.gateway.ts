import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatsService } from './chats.service';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Logger, UseGuards } from '@nestjs/common';
import { WsThrottlerGuard } from '../common/guards/ws-throttler.guard';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private readonly logger = new Logger(ChatsGateway.name);

  constructor(
    private readonly chatsService: ChatsService,
    private readonly configService: ConfigService,
    @InjectQueue('email-notification') private emailQueue: Queue,
  ) {}

  async handleConnection(client: Socket) {
    try {
      let token = client.handshake.auth?.token;

      if (!token) {
        const authHeader = client.handshake.headers.authorization;
        if (!authHeader) throw new Error('No token provided');
        token = authHeader;
      }

      // Remove 'Bearer ' if present
      if (token.startsWith('Bearer ')) {
        token = token.split(' ')[1];
      }

      const decoded = jwt.verify(
        token,
        this.configService.get<string>('JWT_SECRET') as string,
      ) as any;

      // Attach user info to socket
      client.data.user = decoded;

      // We can also have admins join an 'admin-room' to receive global notifications
      if (decoded.role && decoded.role !== 'Customer') {
        client.join('admin-room');
        this.logger.log(`Admin ${decoded.sub} connected and joined admin-room`);
      } else {
        this.logger.log(`Customer ${decoded.sub} connected`);
      }
    } catch (error) {
      this.logger.warn(`Socket connection rejected: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Socket disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody('roomId') roomId: string,
  ) {
    // Basic authorization could be implemented here
    client.join(roomId);
    return { event: 'joinedRoom', data: roomId };
  }

  @UseGuards(WsThrottlerGuard)
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: { roomId: string; message: string; attachment?: string },
  ) {
    const user = client.data.user;

    // Save to database
    const savedMessage = await this.chatsService.saveMessage(
      payload.roomId,
      user.sub,
      payload.message,
      payload.attachment,
    );

    // Broadcast to room
    this.server.to(payload.roomId).emit('newMessage', savedMessage);

    // If customer sent it, check if any admin is online
    if (user.role === 'Customer' || !user.role) {
      const adminRoom = this.server.sockets.adapter.rooms.get('admin-room');
      const isOnline = adminRoom && adminRoom.size > 0;

      if (isOnline) {
        // Admins are online, send them a socket notification
        this.server.to('admin-room').emit('chatNotification', {
          roomId: payload.roomId,
          message: 'New message from customer',
        });
      } else {
        // Admins are offline, send a fallback email
        this.logger.log(
          `No admins online. Enqueueing fallback email for message in room ${payload.roomId}`,
        );
        await this.emailQueue.add('send-email', {
          to: 'admin@mkprinting.com', // Would normally be fetched from settings or DB
          subject: `Offline Chat Message - Room ${payload.roomId}`,
          body: `A customer has sent a message while all admins are offline.\n\nMessage: "${payload.message}"\n\nPlease log in to the dashboard to reply.`,
          notificationId: `chat-${savedMessage.id}`,
        });
      }
    }

    return { event: 'messageSent', data: savedMessage.id };
  }
}
