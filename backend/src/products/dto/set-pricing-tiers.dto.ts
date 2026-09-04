import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';

export class PricingTierDto {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  minQuantity!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  maxQuantity?: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  unitPrice!: number;
}

export class SetPricingTiersDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PricingTierDto)
  tiers!: PricingTierDto[];
}
