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
import { Roles } from '../auth/decorators/roles.decorator';
import { VerifiedGuard } from '../auth/guards/verified.guard';
import { CreateQuotationDto, UpdateQuotationDto } from './dto/quotation.dto';
import { ConvertQuotationToOrderUseCase } from './use-cases/convert-quotation.usecase';

// Should share this interface from common or auth
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
  @Roles('Sales', 'Manager', 'Owner')
  create(@Body() createQuotationDto: CreateQuotationDto) {
    return this.quotationsService.create(createQuotationDto);
  }

  @Get()
  @Roles('Sales', 'Manager', 'Owner', 'Customer')
  findAll(@Req() req: AuthenticatedRequest) {
    const isCustomer = req.user.role === 'Customer';
    const customerId = req.user.customerId;
    return this.quotationsService.findAll(isCustomer ? customerId : undefined);
  }

  @Get(':id')
  @Roles('Sales', 'Manager', 'Owner', 'Customer')
  async findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const quotation = await this.quotationsService.findOne(id);
    if (req.user.role === 'Customer' && quotation.customerId !== req.user.customerId) {
      throw new ForbiddenException('You do not have permission to view this quotation');
    }
    return quotation;
  }

  @Patch(':id')
  @Roles('Sales', 'Manager', 'Owner')
  update(
    @Param('id') id: string,
    @Body() updateQuotationDto: UpdateQuotationDto,
  ) {
    return this.quotationsService.update(id, updateQuotationDto);
  }

  @Delete(':id')
  @Roles('Sales', 'Manager', 'Owner')
  remove(@Param('id') id: string) {
    return this.quotationsService.remove(id);
  }

  @Post(':id/convert')
  @Roles('Sales', 'Manager', 'Owner', 'Customer')
  async convertToOrder(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const quotation = await this.quotationsService.findOne(id);
    if (req.user.role === 'Customer' && quotation.customerId !== req.user.customerId) {
      throw new ForbiddenException('You do not have permission to convert this quotation');
    }
    return this.convertQuotation.execute(id);
  }
}
