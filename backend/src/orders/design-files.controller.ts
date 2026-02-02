import { Body, Controller, Param, Patch, Post, Req, Get, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadDesignFileUseCase } from './use-cases/upload-design-file.usecase';
import { ReviewDesignFileUseCase } from './use-cases/review-design-file.usecase';
import { GetDesignFileUseCase } from './use-cases/get-design-file.usecase';
import { DownloadDesignFileUseCase } from './use-cases/download-design-file.usecase';
import { ReviewDesignFileDto } from './dto/review-design-file.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import type { Request } from 'express';
import { DesignFileStatus } from './domain/design-file.entity';

@Controller('api/v1/design-files')
export class DesignFilesController {
  constructor(
    private readonly uploadDesignFile: UploadDesignFileUseCase,
    private readonly reviewDesignFile: ReviewDesignFileUseCase,
    private readonly getDesignFile: GetDesignFileUseCase,
    private readonly downloadDesignFile: DownloadDesignFileUseCase,
  ) {}

  @Post('upload')
  @Roles('Sales', 'Manager', 'Owner')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDesign(
    @Body('orderId') orderId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('notes') notes: string,
    @Req() req: Request,
  ) {
    if (!orderId) throw new BadRequestException('orderId harus disertakan');
    if (!file) throw new BadRequestException('File tidak ditemukan');
    const userId = (req as any).user.id;
    return this.uploadDesignFile.execute(orderId, file, notes, userId);
  }

  @Get(':id')
  @Roles('Customer', 'Production', 'Sales', 'Manager', 'Owner')
  async getDetails(@Param('id') id: string, @Req() req: Request) {
    const user = (req as any).user;
    return this.getDesignFile.execute(id, user.id, user.role.name);
  }

  @Get(':id/download')
  @Roles('Customer', 'Production', 'Sales', 'Manager', 'Owner')
  async download(@Param('id') id: string, @Req() req: Request) {
    const user = (req as any).user;
    return this.downloadDesignFile.execute(id, user.id, user.role.name);
  }

  @Patch(':id/approve')
  @Roles('Production', 'Manager', 'Owner')
  async approveDesign(
    @Param('id') id: string,
    @Body() dto: { notes?: string },
    @Req() req: Request,
  ) {
    const userId = (req as any).user.id;
    return this.reviewDesignFile.execute(id, { status: DesignFileStatus.Approved, notes: dto.notes }, userId);
  }

  @Patch(':id/reject')
  @Roles('Production', 'Manager', 'Owner')
  async rejectDesign(
    @Param('id') id: string,
    @Body() dto: { notes: string },
    @Req() req: Request,
  ) {
    const userId = (req as any).user.id;
    return this.reviewDesignFile.execute(id, { status: DesignFileStatus.Rejected, notes: dto.notes }, userId);
  }
}
