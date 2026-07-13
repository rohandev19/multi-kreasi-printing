import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { DesignFileStatus } from '../domain/design-file.entity';

export class ReviewDesignFileDto {
  @IsString()
  @IsNotEmpty()
  status!: DesignFileStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
