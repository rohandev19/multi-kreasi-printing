import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  IsUUID,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class QuotationItemDto {
  @IsUUID()
  productId: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unitPrice: number;

  @IsNumber()
  subtotal: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateQuotationDto {
  @IsUUID()
  customerId: string;

  @IsNumber()
  subtotal: number;

  @IsNumber()
  tax: number;

  @IsNumber()
  totalAmount: number;

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
  subtotal?: number;

  @IsNumber()
  @IsOptional()
  tax?: number;

  @IsNumber()
  @IsOptional()
  totalAmount?: number;

  @IsString()
  @IsOptional()
  @IsIn(['Draft', 'Sent', 'Approved', 'Rejected', 'Expired'])
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
