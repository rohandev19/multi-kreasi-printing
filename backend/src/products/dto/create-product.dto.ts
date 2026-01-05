import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

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
  basePrice!: number;

  @IsString()
  @IsNotEmpty()
  unitOfMeasure!: string;
}
