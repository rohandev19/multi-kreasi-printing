import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { LoginUseCase } from '../use-cases/login.usecase';
import { LogoutUseCase } from '../use-cases/logout.usecase';
import { RefreshTokenUseCase } from '../use-cases/refresh-token.usecase';
import { RegisterUseCase } from '../use-cases/register.usecase';
import { EmailVerificationService } from '../services/email-verification.service';
import { PrismaService } from '../../prisma/prisma.service';
import { UnauthorizedException } from '@nestjs/common';
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';

describe('AuthController Integration', () => {
  let controller: AuthController;
  let loginUseCase: LoginUseCase;
  let logoutUseCase: LogoutUseCase;
  let refreshTokenUseCase: RefreshTokenUseCase;
  let registerUseCase: RegisterUseCase;
  let emailVerificationService: EmailVerificationService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: LoginUseCase,
          useValue: { execute: vi.fn() },
        },
        {
          provide: LogoutUseCase,
          useValue: { execute: vi.fn() },
        },
        {
          provide: RefreshTokenUseCase,
          useValue: { execute: vi.fn() },
        },
        {
          provide: RegisterUseCase,
          useValue: { execute: vi.fn() },
        },
        {
          provide: EmailVerificationService,
          useValue: {
            verifyEmail: vi.fn(),
            resendVerificationEmail: vi.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: vi.fn(),
            },
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
    loginUseCase = module.get<LoginUseCase>(LoginUseCase);
    logoutUseCase = module.get<LogoutUseCase>(LogoutUseCase);
    refreshTokenUseCase = module.get<RefreshTokenUseCase>(RefreshTokenUseCase);
    registerUseCase = module.get<RegisterUseCase>(RegisterUseCase);
    emailVerificationService = module.get<EmailVerificationService>(
      EmailVerificationService,
    );
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('login', () => {
    it('should successfully login and set cookie', async () => {
      const loginDto = { email: 'test@example.com', password: 'Password123!' };
      const expectedResponse = {
        refreshToken: 'refresh-token-123',
        response: { access_token: 'access-token', user: { id: '1' } },
      };

      (loginUseCase.execute as Mock).mockResolvedValue(expectedResponse);

      const mockRes = {
        cookie: vi.fn(),
      } as any;

      const result = await controller.login(loginDto, mockRes);

      expect(loginUseCase.execute).toHaveBeenCalledWith(loginDto);
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'refresh-token-123',
        expect.any(Object),
      );
      expect(result).toEqual(expectedResponse.response);
    });
  });

  describe('refresh', () => {
    it('should successfully refresh token and set new cookie', async () => {
      const mockReq = {
        cookies: { refresh_token: 'old-refresh-token' },
      } as any;

      const expectedResponse = {
        refreshToken: 'new-refresh-token',
        response: { access_token: 'new-access-token', user: { id: '1' } },
      };

      (refreshTokenUseCase.execute as Mock).mockResolvedValue(expectedResponse);

      const mockRes = {
        cookie: vi.fn(),
      } as any;

      const result = await controller.refresh(mockReq, mockRes);

      expect(refreshTokenUseCase.execute).toHaveBeenCalledWith(
        'old-refresh-token',
      );
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'new-refresh-token',
        expect.any(Object),
      );
      expect(result).toEqual(expectedResponse.response);
    });
  });

  describe('getMe', () => {
    it('should return user details', async () => {
      const mockReq = {
        user: { sub: 'user-1' },
      } as any;

      const mockDbUser = {
        id: 'user-1',
        email: 'test@example.com',
        fullName: 'Test User',
        role: { name: 'Customer' },
      };

      (prisma.user.findUnique as Mock).mockResolvedValue(mockDbUser);

      const result = await controller.getMe(mockReq);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        include: { role: true },
      });
      expect(result).toEqual({
        id: 'user-1',
        email: 'test@example.com',
        role: 'Customer',
        name: 'Test User',
      });
    });

    it('should throw UnauthorizedException if user not found in DB', async () => {
      const mockReq = {
        user: { sub: 'user-1' },
      } as any;

      (prisma.user.findUnique as Mock).mockResolvedValue(null);

      await expect(controller.getMe(mockReq)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('should execute logout use case and clear cookie', async () => {
      const mockReq = {
        user: { sub: 'user-1' },
      } as any;

      const mockRes = {
        clearCookie: vi.fn(),
      } as any;

      const result = await controller.logout(mockReq, mockRes);

      expect(logoutUseCase.execute).toHaveBeenCalledWith('user-1');
      expect(mockRes.clearCookie).toHaveBeenCalledWith('refresh_token');
      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });

  describe('verifyEmail', () => {
    it('should call emailVerificationService.verifyEmail', async () => {
      const token = 'valid-token';

      const result = await controller.verifyEmail(token);

      expect(emailVerificationService.verifyEmail).toHaveBeenCalledWith(token);
      expect(result).toEqual({ message: 'Email verified successfully' });
    });
  });
});
