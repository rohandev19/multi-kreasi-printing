import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Req,
  Query,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ChatsService } from './chats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import type { AuthenticatedRequest } from '../auth/jwt.service';

@Controller('chats')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post('init')
  async initChat(
    @Req() req: AuthenticatedRequest,
    @Body('orderId') orderId?: string,
  ) {
    const userRole = req.user?.role || 'Customer';
    const customerId =
      userRole === 'Customer'
        ? req.user?.id || req.user?.sub
        : (req.body as { customerId?: string })?.customerId;

    if (!customerId) {
      throw new BadRequestException('customerId is required for Admin/Staff');
    }

    return this.chatsService.getOrCreateRoom(customerId, orderId);
  }

  @Get('rooms')
  async getAllRooms(@Req() req: AuthenticatedRequest) {
    const userRole = req.user?.role || 'Customer';
    if (userRole === 'Customer') {
      throw new ForbiddenException('Customers cannot view all rooms');
    }
    return this.chatsService.getAllRooms();
  }

  @Get(':roomId/messages')
  async getMessages(
    @Param('roomId') roomId: string,
    @Req() req: AuthenticatedRequest,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    const userRole = req.user?.role || 'Customer';
    const userId = req.user?.id || req.user?.sub || '';
    const parsedLimit = limit ? parseInt(limit, 10) : 50;
    return this.chatsService.getRoomMessages(
      roomId,
      userId,
      userRole,
      parsedLimit,
      cursor,
    );
  }

  @Post(':roomId/read')
  async markAsRead(
    @Param('roomId') roomId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const userRole = req.user?.role || 'Customer';
    const userId = req.user?.id || req.user?.sub || '';
    await this.chatsService.markAsRead(roomId, userId, userRole);
    return { success: true };
  }
}
