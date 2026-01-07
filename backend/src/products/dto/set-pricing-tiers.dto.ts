import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNumber, IsOptional, Min, ValidateNested } from 'class-validator';

export class PricingTierDto {
  @IsInt()
  @Min(1)
  minQuantity!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxQuantity?: number;

  @IsNumber()
  @Min(0)
  unitPrice!: number;
}

export class SetPricingTiersDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PricingTierDto)
  tiers!: PricingTierDto[];
}
