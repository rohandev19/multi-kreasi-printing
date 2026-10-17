import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TicketsService, UserContext } from './tickets.service';
import {
  CreateTicketDto,
  UpdateTicketDto,
  CreateTicketMessageDto,
} from './dto/ticket.dto';
import type { Request } from 'express';

interface RequestWithUser extends Request {
  user: {
    sub: string;
    role: string;
    email: string;
    customerId?: string;
  };
}

@Controller('api/v1/tickets')
@UseGuards(JwtAuthGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  async createTicket(
    @Body() dto: CreateTicketDto,
    @Req() req: RequestWithUser,
  ) {
    const user: UserContext = {
      sub: req.user.sub,
      role: req.user.role,
      email: req.user.email,
      customerId: req.user.customerId,
    };
    return this.ticketsService.createTicket(dto, user);
  }

  @Get('metrics')
  async getMetrics() {
    return this.ticketsService.getMetrics();
  }

  @Get()
  async findAll(
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('category') category?: string,
    @Query('assignedToId') assignedToId?: string,
    @Query('customerId') customerId?: string,
    @Req() req?: RequestWithUser,
  ) {
    const user: UserContext = {
      sub: req!.user.sub,
      role: req!.user.role,
      email: req!.user.email,
      customerId: req!.user.customerId,
    };
    return this.ticketsService.findAll(
      { status, priority, category, assignedToId, customerId },
      user,
    );
  }

  @Get(':id')
  async findById(@Param('id') id: string, @Req() req: RequestWithUser) {
    const user: UserContext = {
      sub: req.user.sub,
      role: req.user.role,
      email: req.user.email,
      customerId: req.user.customerId,
    };
    return this.ticketsService.findById(id, user);
  }

  @Patch(':id')
  async updateTicket(
    @Param('id') id: string,
    @Body() dto: UpdateTicketDto,
    @Req() req: RequestWithUser,
  ) {
    const user: UserContext = {
      sub: req.user.sub,
      role: req.user.role,
      email: req.user.email,
      customerId: req.user.customerId,
    };
    return this.ticketsService.updateTicket(id, dto, user);
  }

  @Post(':id/messages')
  async addMessage(
    @Param('id') id: string,
    @Body() dto: CreateTicketMessageDto,
    @Req() req: RequestWithUser,
  ) {
    const user: UserContext = {
      sub: req.user.sub,
      role: req.user.role,
      email: req.user.email,
      customerId: req.user.customerId,
    };
    return this.ticketsService.addMessage(id, dto, user);
  }
}
