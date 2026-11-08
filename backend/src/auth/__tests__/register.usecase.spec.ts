import { ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RegisterUseCase } from '../use-cases/register.usecase';
import { EmailVerificationService } from '../services/email-verification.service';

describe('RegisterUseCase & EmailVerificationService', () => {
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      role: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'role-customer-1',
          name: 'Customer',
        }),
        create: vi.fn(),
      },
      emailVerificationToken: {
        create: vi.fn(),
        deleteMany: vi.fn(),
      },
    };
  });

  it('auto-verifies and activates new user when SMTP_HOST is not configured', async () => {
    const configService = {
      get: vi.fn((key: string, defaultValue?: any) => defaultValue),
    } as unknown as ConfigService;

    const emailService = new EmailVerificationService(
      mockPrisma,
      configService,
    );
    expect(emailService.isConfigured()).toBe(false);

    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockImplementation(async ({ data }: any) => ({
      id: 'user-new-1',
      ...data,
    }));

    const registerUseCase = new RegisterUseCase(mockPrisma, emailService);
    const result = await registerUseCase.execute({
      email: 'newcustomer@example.test',
      password: 'Password123',
      fullName: 'Test Customer',
      phone: '081200001111',
    });

    expect(result.autoVerified).toBe(true);
    expect(mockPrisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: 'newcustomer@example.test',
          fullName: 'Test Customer',
          phone: '081200001111',
          status: 'ACTIVE',
          emailVerified: true,
        }),
      }),
    );
    expect(mockPrisma.emailVerificationToken.create).not.toHaveBeenCalled();
  });

  it('allows recovering a previously stuck Unverified account', async () => {
    const configService = {
      get: vi.fn((key: string, defaultValue?: any) => defaultValue),
    } as unknown as ConfigService;

    const emailService = new EmailVerificationService(
      mockPrisma,
      configService,
    );

    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-stuck-1',
      email: 'stuck@example.test',
      status: 'Unverified',
      emailVerified: false,
    });
    mockPrisma.user.update.mockImplementation(async ({ data }: any) => ({
      id: 'user-stuck-1',
      email: 'stuck@example.test',
      ...data,
    }));

    const registerUseCase = new RegisterUseCase(mockPrisma, emailService);
    const result = await registerUseCase.execute({
      email: 'stuck@example.test',
      password: 'NewPassword123',
      fullName: 'Recovered User',
    });

    expect(result.autoVerified).toBe(true);
    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'user-stuck-1' },
        data: expect.objectContaining({
          status: 'ACTIVE',
          emailVerified: true,
        }),
      }),
    );
  });

  it('rejects duplicate registration when existing user is already active/verified', async () => {
    const configService = {
      get: vi.fn((key: string, defaultValue?: any) => defaultValue),
    } as unknown as ConfigService;

    const emailService = new EmailVerificationService(
      mockPrisma,
      configService,
    );

    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-active-1',
      email: 'active@example.test',
      status: 'ACTIVE',
      emailVerified: true,
    });

    const registerUseCase = new RegisterUseCase(mockPrisma, emailService);
    await expect(
      registerUseCase.execute({
        email: 'active@example.test',
        password: 'Password123',
        fullName: 'Duplicate User',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('parses string SMTP_SECURE="false" as boolean false and reads SMTP_PASSWORD fallback', () => {
    const envMap: Record<string, string> = {
      SMTP_HOST: 'smtp.example.test',
      SMTP_PORT: '587',
      SMTP_SECURE: 'false',
      SMTP_USER: 'mailer@example.test',
      SMTP_PASSWORD: 'synthetic-password',
    };
    const configService = {
      get: vi.fn((key: string, defaultValue?: any) =>
        key in envMap ? envMap[key] : defaultValue,
      ),
    } as unknown as ConfigService;

    const emailService = new EmailVerificationService(
      mockPrisma,
      configService,
    );
    expect(emailService.isConfigured()).toBe(true);
    const options = (emailService as any).transporter.options;
    expect(options.host).toBe('smtp.example.test');
    expect(options.port).toBe(587);
    expect(options.secure).toBe(false);
    expect(options.auth).toEqual({
      user: 'mailer@example.test',
      pass: 'synthetic-password',
    });
  });
});

