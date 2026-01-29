import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ReviewDesignFileDto {
  @IsString()
  @IsNotEmpty()
  status!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
