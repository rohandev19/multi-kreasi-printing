import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatsService {
  constructor(private prisma: PrismaService) {}

  async getOrCreateRoom(customerId: string, orderId?: string) {
    let room = await this.prisma.chatRoom.findFirst({
      where: {
        customerId,
        ...(orderId ? { orderId } : {}),
      },
      include: {
        customer: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
      },
    });

    if (!room) {
      room = await this.prisma.chatRoom.create({
        data: {
          customerId,
          orderId,
        },
        include: {
          customer: {
            select: { id: true, fullName: true, avatarUrl: true },
          },
        },
      });
    }

    return room;
  }

  async getAllRooms() {
    return this.prisma.chatRoom.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        customer: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            message: true,
            createdAt: true,
            isRead: true,
            senderId: true,
          },
        },
      },
    });
  }

  async getRoomMessages(
    roomId: string,
    userId: string,
    userRole: string,
    limit: number = 50,
    cursor?: string,
  ) {
    const room = await this.prisma.chatRoom.findUnique({
      where: { id: roomId },
    });

    if (!room) throw new NotFoundException('Chat room not found');

    // Security check: only the customer or an admin/staff can view
    if (userRole === 'Customer' && room.customerId !== userId) {
      throw new ForbiddenException('You are not allowed to view this chat');
    }

    const messages = await this.prisma.chatMessage.findMany({
      where: { roomId },
      take: limit + 1, // Fetch one extra to determine if there are more
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}), // Skip the cursor itself
      orderBy: { createdAt: 'desc' }, // Fetch latest first
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            role: { select: { name: true } },
          },
        },
      },
    });

    let nextCursor: typeof cursor | undefined = undefined;
    if (messages.length > limit) {
      const nextItem = messages.pop();
      nextCursor = nextItem?.id;
    }

    // Reverse to send them in chronological order (oldest to newest) to the client
    return {
      data: messages.reverse(),
      nextCursor,
    };
  }

  async saveMessage(
    roomId: string,
    senderId: string,
    message: string,
    attachment?: string,
  ) {
    // Basic check
    const room = await this.prisma.chatRoom.findUnique({
      where: { id: roomId },
    });
    if (!room) throw new NotFoundException('Chat room not found');

    const chatMessage = await this.prisma.chatMessage.create({
      data: {
        roomId,
        senderId,
        message,
        attachment,
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            role: { select: { name: true } },
          },
        },
      },
    });

    // Update room updatedAt
    await this.prisma.chatRoom.update({
      where: { id: roomId },
      data: { updatedAt: new Date() },
    });

    return chatMessage;
  }

  async markAsRead(roomId: string, userId: string) {
    // Mark all messages in the room NOT sent by the current user as read
    await this.prisma.chatMessage.updateMany({
      where: {
        roomId,
        senderId: { not: userId },
        isRead: false,
      },
      data: { isRead: true },
    });
  }
}
