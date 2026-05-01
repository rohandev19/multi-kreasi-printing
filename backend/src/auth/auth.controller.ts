import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Response, Request } from 'express';
import { LoginRequestDto } from './dto/login.dto';
import { LoginUseCase } from './use-cases/login.usecase';
import { LogoutUseCase } from './use-cases/logout.usecase';
import { RefreshTokenUseCase } from './use-cases/refresh-token.usecase';
import { RegisterRequestDto } from './dto/register.dto';
import { RegisterUseCase } from './use-cases/register.usecase';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { EmailVerificationService } from './services/email-verification.service';
import { Public } from './decorators/public.decorator';

@Controller('api/v1/auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly registerUseCase: RegisterUseCase,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly prisma: PrismaService,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginRequestDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.loginUseCase.execute(loginDto);

    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return result.response;
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refresh_token;
    const result = await this.refreshTokenUseCase.execute(refreshToken);

    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return result.response;
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getMe(@Req() req: Request) {
    const user = (req as any).user;
    if (!user || !user.sub) {
      throw new UnauthorizedException();
    }
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.sub },
      include: { role: true },
    });
    if (!dbUser) {
      throw new UnauthorizedException();
    }
    return {
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role.name,
      name: dbUser.fullName,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = (req as any).user;
    if (user && user.sub) {
      await this.logoutUseCase.execute(user.sub);
    }
    res.clearCookie('refresh_token');
    return { message: 'Logged out successfully' };
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterRequestDto) {
    return this.registerUseCase.execute(registerDto);
  }

  @Public()
  @Get('verify-email/:token')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Param('token') token: string) {
    await this.emailVerificationService.verifyEmail(token);
    return { message: 'Email verified successfully' };
  }

  @Public()
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  async resendVerification(@Body() resendDto: ResendVerificationDto) {
    await this.emailVerificationService.resendVerificationEmail(
      resendDto.email,
    );
    return {
      message: 'Verification email sent if account exists and is unverified',
    };
  }
}
