import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class CreateCustomQuotationDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsNotEmpty()
  productCategory: string;

  @IsString()
  @IsNotEmpty()
  specifications: string;

  @IsNumber()
  estimatedQuantity: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
