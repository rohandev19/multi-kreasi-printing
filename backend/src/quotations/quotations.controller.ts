import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { QuotationsService } from './quotations.service';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { VerifiedGuard } from '../auth/guards/verified.guard';
import {
  CreateQuotationDto,
  UpdateQuotationDto,
  ApproveQuotationDiscountDto,
  RejectQuotationDiscountDto,
  AcceptQuotationDto,
  RejectQuotationDto,
  CreateQuotationRevisionDto,
} from './dto/quotation.dto';
import { ConvertQuotationToOrderUseCase } from './use-cases/convert-quotation.usecase';

interface AuthenticatedRequest extends Request {
  user: { sub: string; role: string; customerId?: string };
}

@Controller('api/v1/quotations')
@UseGuards(VerifiedGuard)
export class QuotationsController {
  constructor(
    private readonly quotationsService: QuotationsService,
    private readonly convertQuotation: ConvertQuotationToOrderUseCase,
  ) {}

  @Post()
  @RequirePermissions({ action: 'manage', subject: 'Quotation' })
  create(@Body() createQuotationDto: CreateQuotationDto) {
    return this.quotationsService.create(createQuotationDto);
  }

  @Get()
  @RequirePermissions({ action: 'read', subject: 'Quotation' })
  findAll(@Req() req: AuthenticatedRequest) {
    const isCustomer = req.user.role === 'Customer';
    const customerId = req.user.customerId;
    return this.quotationsService.findAll(isCustomer ? customerId : undefined);
  }

  @Get(':id')
  @RequirePermissions({ action: 'read', subject: 'Quotation' })
  async findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const quotation = await this.quotationsService.findOne(id);
    if (
      req.user.role === 'Customer' &&
      quotation.customerId !== req.user.customerId
    ) {
      throw new ForbiddenException(
        'You do not have permission to view this quotation',
      );
    }
    return quotation;
  }

  @Patch(':id')
  @RequirePermissions({ action: 'manage', subject: 'Quotation' })
  update(
    @Param('id') id: string,
    @Body() updateQuotationDto: UpdateQuotationDto,
  ) {
    return this.quotationsService.update(id, updateQuotationDto);
  }

  @Delete(':id')
  @RequirePermissions({ action: 'manage', subject: 'Quotation' })
  remove(@Param('id') id: string) {
    return this.quotationsService.remove(id);
  }

  @Patch(':id/approve-discount')
  @RequirePermissions({ action: 'manage', subject: 'Quotation' })
  async approveDiscount(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: ApproveQuotationDiscountDto,
  ) {
    if (req.user.role === 'Customer') {
      throw new ForbiddenException(
        'Customers are not authorized to approve quotation discounts',
      );
    }
    return this.quotationsService.approveDiscount(id, req.user.sub, dto);
  }

  @Patch(':id/reject-discount')
  @RequirePermissions({ action: 'manage', subject: 'Quotation' })
  async rejectDiscount(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: RejectQuotationDiscountDto,
  ) {
    if (req.user.role === 'Customer') {
      throw new ForbiddenException(
        'Customers are not authorized to reject quotation discounts',
      );
    }
    return this.quotationsService.rejectDiscount(id, req.user.sub, dto);
  }

  @Patch(':id/accept')
  @RequirePermissions({ action: 'read', subject: 'Quotation' })
  async accept(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: AcceptQuotationDto,
  ) {
    const customerId =
      req.user.role === 'Customer' ? req.user.customerId : undefined;
    return this.quotationsService.accept(id, customerId, dto);
  }

  @Patch(':id/reject')
  @RequirePermissions({ action: 'read', subject: 'Quotation' })
  async reject(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: RejectQuotationDto,
  ) {
    const customerId =
      req.user.role === 'Customer' ? req.user.customerId : undefined;
    return this.quotationsService.reject(id, customerId, dto);
  }

  @Post(':id/revisions')
  @RequirePermissions({ action: 'manage', subject: 'Quotation' })
  async createRevision(
    @Param('id') id: string,
    @Body() dto: CreateQuotationRevisionDto,
  ) {
    return this.quotationsService.createRevision(id, dto);
  }

  @Post(':id/convert')
  @RequirePermissions({ action: 'manage', subject: 'Quotation' })
  async convertToOrder(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const quotation = await this.quotationsService.findOne(id);
    if (
      req.user.role === 'Customer' &&
      quotation.customerId !== req.user.customerId
    ) {
      throw new ForbiddenException(
        'You do not have permission to convert this quotation',
      );
    }
    return this.convertQuotation.execute(id);
  }
}
