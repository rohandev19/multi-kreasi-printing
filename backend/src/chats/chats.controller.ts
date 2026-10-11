import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { Request } from 'express';
import { ChatsService } from './chats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

@Controller('chats')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post('init')
  async initChat(
    @Req() req: Request & { user?: any },
    @Body('orderId') orderId?: string,
  ) {
    const userRole = req.user?.role || 'Customer';
    const customerId =
      userRole === 'Customer' ? req.user?.id : req.body.customerId;

    if (!customerId) {
      throw new Error('customerId is required for Admin/Staff');
    }

    return this.chatsService.getOrCreateRoom(customerId, orderId);
  }

  @Get('rooms')
  async getAllRooms(@Req() req: Request & { user?: any }) {
    const userRole = req.user?.role || 'Customer';
    if (userRole === 'Customer') {
      throw new Error('Customers cannot view all rooms');
    }
    return this.chatsService.getAllRooms();
  }

  @Get(':roomId/messages')
  async getMessages(
    @Param('roomId') roomId: string,
    @Req() req: Request & { user?: any },
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    const userRole = req.user?.role || 'Customer';
    const parsedLimit = limit ? parseInt(limit, 10) : 50;
    return this.chatsService.getRoomMessages(
      roomId,
      req.user?.id,
      userRole,
      parsedLimit,
      cursor,
    );
  }

  @Post(':roomId/read')
  async markAsRead(
    @Param('roomId') roomId: string,
    @Req() req: Request & { user?: any },
  ) {
    await this.chatsService.markAsRead(roomId, req.user?.id);
    return { success: true };
  }
}
