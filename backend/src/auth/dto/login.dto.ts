import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginRequestDto {
  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password minimal 8 karakter' })
  password!: string;
}
