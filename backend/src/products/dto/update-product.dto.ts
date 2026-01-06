import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  basePrice?: number;

  @IsString()
  @IsOptional()
  unitOfMeasure?: string;

  @IsString()
  @IsOptional()
  status?: string;
}
