import {
  IsObject,
  IsString,
  IsOptional,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

class GeneralSettingsDto {
  @IsString()
  @IsNotEmpty()
  appName!: string;
}

class BusinessSettingsDto {
  @IsString()
  @IsNotEmpty()
  companyName!: string;
}

export class AppSettingsDto {
  @IsObject()
  @ValidateNested()
  @Type(() => GeneralSettingsDto)
  general!: GeneralSettingsDto;

  @IsObject()
  @ValidateNested()
  @Type(() => BusinessSettingsDto)
  business!: BusinessSettingsDto;

  // We can add more specific validation as needed, but this prevents complete garbage JSON
}

export class UpdateSettingDto {
  @IsObject()
  @IsNotEmpty()
  value!: any;

  @IsString()
  @IsOptional()
  description?: string;
}
