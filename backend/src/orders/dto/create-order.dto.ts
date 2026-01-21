import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

export class OrderItemDto {
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @IsNumber()
  @Min(1)
  quantity!: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  customerId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];

  @IsOptional()
  @IsString()
  @IsIn(['Low', 'Normal', 'High', 'Urgent'])
  priority?: string;

  @IsOptional()
  @IsDateString()
  estimatedDeliveryDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
