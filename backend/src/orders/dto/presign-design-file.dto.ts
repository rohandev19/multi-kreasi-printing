import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class PresignDesignFileDto {
  @IsString()
  @IsNotEmpty()
  originalName!: string;

  @IsString()
  @IsNotEmpty()
  mimeType!: string;

  @IsNumber()
  fileSize!: number;
}
