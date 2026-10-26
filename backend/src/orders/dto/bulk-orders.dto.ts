import {
  IsArray,
  IsString,
  IsOptional,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';

export class BulkOrderStatusDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'Minimal pilih 1 pesanan' })
  @ArrayMaxSize(500, { message: 'Maksimal 500 pesanan per operasi massal' })
  @IsString({ each: true })
  ids: string[];

  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
