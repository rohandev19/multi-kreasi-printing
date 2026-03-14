import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterRequestDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;
}
