import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsEnum,
  IsOptional,
  IsUUID,
} from 'class-validator';

export enum StockMovementType {
  IN = 'IN',
  OUT = 'OUT',
  ADJUSTMENT = 'ADJUSTMENT',
}

export class AdjustStockDto {
  @IsEnum(StockMovementType)
  type: StockMovementType;

  @IsInt()
  @IsNotEmpty()
  quantity: number;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsUUID()
  referenceId?: string;
}
