import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  sku!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  categoryId!: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  basePrice!: number;

  @IsString()
  @IsNotEmpty()
  unitOfMeasure!: string;

  @IsString()
  @IsOptional()
  status?: string;
}
