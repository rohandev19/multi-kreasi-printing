import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Req,
  Get,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadDesignFileUseCase } from './use-cases/upload-design-file.usecase';
import { PresignDesignFileUseCase } from './use-cases/presign-design-file.usecase';
import { ConfirmDesignFileUseCase } from './use-cases/confirm-design-file.usecase';
import { PresignDesignFileDto } from './dto/presign-design-file.dto';
import { ReviewDesignFileUseCase } from './use-cases/review-design-file.usecase';
import { GetDesignFileUseCase } from './use-cases/get-design-file.usecase';
import { DownloadDesignFileUseCase } from './use-cases/download-design-file.usecase';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { PrismaService } from '../prisma/prisma.service';
import type { Request } from 'express';

export interface AuthenticatedUser {
  sub: string;
  role: string;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
import { DesignFileStatus } from './domain/design-file.entity';

@Controller('api/v1/design-files')
export class DesignFilesController {
  constructor(
    private readonly uploadDesignFile: UploadDesignFileUseCase,
    private readonly presignDesignFile: PresignDesignFileUseCase,
    private readonly confirmDesignFile: ConfirmDesignFileUseCase,
    private readonly reviewDesignFile: ReviewDesignFileUseCase,
    private readonly getDesignFile: GetDesignFileUseCase,
    private readonly downloadDesignFile: DownloadDesignFileUseCase,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @RequirePermissions({ action: 'read', subject: 'DesignFiles' })
  async list(@Req() req: AuthenticatedRequest) {
    const user = req.user;
    let whereClause = {};

    if (user.role === 'Designer') {
      whereClause = { status: DesignFileStatus.Manual_Review };
    }

    return this.prisma.designFile.findMany({
      where: whereClause,
      include: {
        order: {
          select: {
            orderNumber: true,
            customer: {
              select: {
                companyName: true,
              },
            },
          },
        },
        uploadedByUser: {
          select: {
            fullName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  @Post('upload')
  @RequirePermissions({ action: 'manage', subject: 'DesignFiles' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadDesign(
    @Body('orderId') orderId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('notes') notes: string,
    @Req() req: AuthenticatedRequest,
  ) {
    if (!orderId) throw new BadRequestException('orderId harus disertakan');
    if (!file) throw new BadRequestException('File tidak ditemukan');
    const userId = req.user.sub;
    return this.uploadDesignFile.execute(orderId, file, notes, userId);
  }

  @Post('presign-upload')
  @RequirePermissions({ action: 'manage', subject: 'DesignFiles' })
  async presignUpload(
    @Body('orderId') orderId: string,
    @Body() dto: PresignDesignFileDto,
    @Req() req: AuthenticatedRequest,
  ) {
    if (!orderId) throw new BadRequestException('orderId harus disertakan');
    return this.presignDesignFile.execute(
      orderId,
      dto.originalName,
      dto.mimeType,
      dto.fileSize,
      req.user.sub,
    );
  }

  @Post(':id/confirm-upload')
  @RequirePermissions({ action: 'manage', subject: 'DesignFiles' })
  async confirmUpload(
    @Param('id') id: string,
    @Body('orderId') orderId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    if (!orderId) throw new BadRequestException('orderId harus disertakan');
    return this.confirmDesignFile.execute(orderId, id, req.user.sub);
  }

  @Get(':id')
  @RequirePermissions({ action: 'manage', subject: 'DesignFiles' })
  async getDetails(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const user = req.user;
    return this.getDesignFile.execute(id, user);
  }

  @Get(':id/download')
  @RequirePermissions({ action: 'read', subject: 'DesignFiles' })
  async download(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const user = req.user;
    return this.downloadDesignFile.execute(id, user);
  }

  @Patch(':id/approve')
  @RequirePermissions({ action: 'manage', subject: 'DesignFiles' })
  async approveDesign(
    @Param('id') id: string,
    @Body() dto: { notes?: string },
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.sub;
    return this.reviewDesignFile.execute(
      id,
      { status: DesignFileStatus.Approved, notes: dto.notes },
      userId,
    );
  }

  @Patch(':id/reject')
  @RequirePermissions({ action: 'manage', subject: 'DesignFiles' })
  async rejectDesign(
    @Param('id') id: string,
    @Body() dto: { notes: string },
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.sub;
    return this.reviewDesignFile.execute(
      id,
      { status: DesignFileStatus.Rejected, notes: dto.notes },
      userId,
    );
  }

  @Patch(':id/request-revision')
  @RequirePermissions({ action: 'manage', subject: 'DesignFiles' })
  async requestRevision(
    @Param('id') id: string,
    @Body() dto: { notes: string },
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.sub;
    return this.reviewDesignFile.execute(
      id,
      { status: DesignFileStatus.Revision_Required, notes: dto.notes },
      userId,
    );
  }
}
