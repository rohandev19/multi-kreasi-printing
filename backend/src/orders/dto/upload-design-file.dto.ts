import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UploadDesignFileDto {
  @IsString()
  @IsNotEmpty()
  orderId!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
