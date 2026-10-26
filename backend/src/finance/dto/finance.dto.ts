import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class RecordPaymentDto {
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsString()
  referenceNumber?: string;
}

export class InvoiceFilterDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  customerId?: string;
}

export class UpdateCustomerCreditDto {
  @IsNumber()
  @Min(0)
  creditLimit: number;

  @IsNumber()
  @Min(0)
  paymentTermDays: number;

  @IsOptional()
  @IsString()
  creditStatus?: string;

  @IsOptional()
  @IsString()
  creditNotes?: string;
}

export class ValidateCreditOrderDto {
  @IsString()
  customerId: string;

  @IsNumber()
  @Min(0)
  orderAmount: number;
}
