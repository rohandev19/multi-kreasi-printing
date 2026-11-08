import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '../jwt.service';
import { LoginRequestDto } from '../dto/login.dto';
import * as bcrypt from 'bcrypt';

import { AuditService } from '../../audit/audit.service';
import { EmailVerificationService } from '../services/email-verification.service';

@Injectable()
export class LoginUseCase {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private auditService: AuditService,
    private emailVerificationService: EmailVerificationService,
  ) {}

  async execute(dto: LoginRequestDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.trim().toLowerCase() },
      include: { role: true },
    });

    if (!user) {
      await this.auditService.log({
        action: 'LOGIN_FAILED_NOT_FOUND',
        entityType: 'User',
        newValue: { email: dto.email },
      });
      throw new UnauthorizedException('Email atau password salah');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      await this.auditService.log({
        action: 'LOGIN_FAILED_PASSWORD',
        userId: user.id,
        entityType: 'User',
        entityId: user.id,
      });
      throw new UnauthorizedException('Email atau password salah');
    }

    if (user.status === 'Unverified') {
      if (!this.emailVerificationService.isConfigured()) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { status: 'ACTIVE', emailVerified: true },
        });
        user.status = 'ACTIVE';
        user.emailVerified = true;
      } else {
        throw new UnauthorizedException(
          'Akun belum diverifikasi. Silakan cek email Anda untuk verifikasi.',
        );
      }
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Akun Anda tidak aktif atau diblokir.');
    }

    // Generate tokens
    const accessToken = this.jwtService.generateAccessToken(
      user.id,
      user.email,
      user.role.name,
    );
    const refreshToken = this.jwtService.generateRefreshToken(user.id);

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await this.auditService.log({
      userId: user.id,
      action: 'LOGIN_SUCCESS',
      entityType: 'User',
      entityId: user.id,
    });

    return {
      refreshToken,
      response: {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role.name,
        },
      },
    };
  }
}
