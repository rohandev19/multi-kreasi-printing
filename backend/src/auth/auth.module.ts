import { Module, Global } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtService } from './jwt.service';
import { AuthController } from './auth.controller';
import { LoginUseCase } from './use-cases/login.usecase';
import { RefreshTokenUseCase } from './use-cases/refresh-token.usecase';
import { LogoutUseCase } from './use-cases/logout.usecase';
import { RegisterUseCase } from './use-cases/register.usecase';
import { EmailVerificationService } from './services/email-verification.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Global()
@Module({
  controllers: [AuthController],
  providers: [
    JwtService,
    LoginUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    RegisterUseCase,
    EmailVerificationService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  exports: [JwtService],
})
export class AuthModule {}
