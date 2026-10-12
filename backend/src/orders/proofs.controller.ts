import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Req,
  Ip,
  UseGuards,
} from '@nestjs/common';
import { CreateProofUseCase } from './use-cases/create-proof.usecase';
import { ApproveProofUseCase } from './use-cases/approve-proof.usecase';
import { RejectProofUseCase } from './use-cases/reject-proof.usecase';
import { GetOrderProofsUseCase } from './use-cases/get-order-proofs.usecase';
import { CreateProofDto, ApproveProofDto, RejectProofDto } from './dto/proof.dto';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import type { Request } from 'express';

interface AuthenticatedUser {
  sub: string;
  role: string;
  email: string;
}

interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

@Controller('api/v1')
@UseGuards(PermissionsGuard)
export class ProofsController {
  constructor(
    private readonly createProofUseCase: CreateProofUseCase,
    private readonly approveProofUseCase: ApproveProofUseCase,
    private readonly rejectProofUseCase: RejectProofUseCase,
    private readonly getOrderProofsUseCase: GetOrderProofsUseCase,
  ) {}

  @Post('orders/:orderId/proofs')
  @RequirePermissions({ action: 'manage', subject: 'DesignFile' })
  async createProof(
    @Param('orderId') orderId: string,
    @Body() dto: CreateProofDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const designerId = req.user.sub;
    return this.createProofUseCase.execute(orderId, dto, designerId);
  }

  @Get('orders/:orderId/proofs')
  @RequirePermissions({ action: 'read', subject: 'Order' })
  async getOrderProofs(
    @Param('orderId') orderId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const user = { id: req.user.sub, role: req.user.role };
    return this.getOrderProofsUseCase.execute(orderId, user);
  }

  @Patch('proofs/:id/approve')
  @RequirePermissions({ action: 'read', subject: 'Order' })
  async approveProof(
    @Param('id') id: string,
    @Body() dto: ApproveProofDto,
    @Req() req: AuthenticatedRequest,
    @Ip() clientIp: string,
  ) {
    const user = { id: req.user.sub, role: req.user.role };
    return this.approveProofUseCase.execute(id, dto, user, clientIp);
  }

  @Patch('proofs/:id/reject')
  @RequirePermissions({ action: 'read', subject: 'Order' })
  async rejectProof(
    @Param('id') id: string,
    @Body() dto: RejectProofDto,
    @Req() req: AuthenticatedRequest,
    @Ip() clientIp: string,
  ) {
    const user = { id: req.user.sub, role: req.user.role };
    return this.rejectProofUseCase.execute(id, dto, user, clientIp);
  }
}
