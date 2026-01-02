import { IsEmail, IsOptional, IsString, Matches } from 'class-validator';

export class UpdateCustomerDto {
  @IsString()
  @IsOptional()
  companyName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{15}$/, { message: 'NPWP harus 15 digit angka' })
  npwp?: string;
}
