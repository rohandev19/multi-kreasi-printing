import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterRequestDto } from '../dto/register.dto';
import * as bcrypt from 'bcrypt';
import { EmailVerificationService } from '../services/email-verification.service';

@Injectable()
export class RegisterUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  async execute(
    dto: RegisterRequestDto,
  ): Promise<{ message: string; userId: string; autoVerified: boolean }> {
    const normalizedEmail = dto.email.trim().toLowerCase();
    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (
      existingUser &&
      (existingUser.emailVerified || existingUser.status !== 'Unverified')
    ) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    // Get default role for new registrants (usually Customer)
    let customerRole = await this.prisma.role.findUnique({
      where: { name: 'Customer' },
    });

    if (!customerRole) {
      // Create Customer role if it doesn't exist for some reason
      customerRole = await this.prisma.role.create({
        data: {
          name: 'Customer',
          displayName: 'Customer',
          description: 'Regular customer',
        },
      });
    }

    const smtpEnabled = this.emailVerificationService.isConfigured();
    const initialStatus = smtpEnabled ? 'Unverified' : 'ACTIVE';
    const initialEmailVerified = !smtpEnabled;
    const cleanedPhone = dto.phone?.trim() || null;

    const user = existingUser
      ? await this.prisma.user.update({
          where: { id: existingUser.id },
          data: {
            passwordHash,
            fullName: dto.fullName.trim(),
            phone: cleanedPhone,
            roleId: customerRole.id,
            status: initialStatus,
            emailVerified: initialEmailVerified,
          },
        })
      : await this.prisma.user.create({
          data: {
            email: normalizedEmail,
            passwordHash,
            fullName: dto.fullName.trim(),
            phone: cleanedPhone,
            roleId: customerRole.id,
            status: initialStatus,
            emailVerified: initialEmailVerified,
          },
        });

    if (smtpEnabled) {
      // Clear any unused tokens if retrying an unverified registration
      if (existingUser) {
        await this.prisma.emailVerificationToken.deleteMany({
          where: { userId: user.id, usedAt: null },
        });
      }
      await this.emailVerificationService.sendVerificationEmail(
        user.id,
        user.email,
      );
      return {
        message:
          'Registration successful. Please check your email to verify your account.',
        userId: user.id,
        autoVerified: false,
      };
    }

    return {
      message:
        'Pendaftaran berhasil! Akun Anda telah aktif dan siap digunakan.',
      userId: user.id,
      autoVerified: true,
    };
  }
}
