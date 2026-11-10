import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsEnum,
  IsOptional,
  IsUUID,
  Min,
  ValidateIf,
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
  @ValidateIf(
    (o: AdjustStockDto) =>
      o.type === StockMovementType.IN || o.type === StockMovementType.OUT,
  )
  @Min(1, { message: 'Quantity untuk tipe IN/OUT minimal adalah 1' })
  quantity: number;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsUUID()
  referenceId?: string;
}
