import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  IsUUID,
  IsIn,
  Min,
  Max,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class QuotationItemDto {
  @IsUUID()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsNumber()
  @Min(0)
  subtotal: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateQuotationDto {
  @IsUUID()
  customerId: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  discountPercent?: number;

  @IsNumber()
  @IsOptional()
  tax?: number;

  @IsString()
  @IsOptional()
  validUntil?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  terms?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuotationItemDto)
  items: QuotationItemDto[];
}

export class UpdateQuotationDto {
  @IsUUID()
  @IsOptional()
  customerId?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  discountPercent?: number;

  @IsNumber()
  @IsOptional()
  subtotal?: number;

  @IsNumber()
  @IsOptional()
  tax?: number;

  @IsNumber()
  @IsOptional()
  totalAmount?: number;

  @IsString()
  @IsOptional()
  @IsIn([
    'Draft',
    'Pending_Manager_Approval',
    'Sent',
    'Accepted',
    'Rejected',
    'Converted',
  ])
  status?: string;

  @IsString()
  @IsOptional()
  validUntil?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  terms?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuotationItemDto)
  @IsOptional()
  items?: QuotationItemDto[];
}

export class ApproveQuotationDiscountDto {
  @IsString()
  @IsOptional()
  notes?: string;
}

export class RejectQuotationDiscountDto {
  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class AcceptQuotationDto {
  @IsString()
  @IsOptional()
  poNumber?: string;

  @IsString()
  @IsOptional()
  poFileUrl?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class RejectQuotationDto {
  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class CreateQuotationRevisionDto {
  @IsString()
  @IsOptional()
  notes?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  discountPercent?: number;
}
