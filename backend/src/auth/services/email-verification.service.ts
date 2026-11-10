import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

@Injectable()
export class EmailVerificationService {
  private transporter: nodemailer.Transporter | null = null;
  private readonly isSmtpConfigured: boolean;
  private readonly logger = new Logger(EmailVerificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const smtpHost = this.configService.get<string>('SMTP_HOST')?.trim();
    this.isSmtpConfigured = Boolean(smtpHost);

    if (this.isSmtpConfigured && smtpHost) {
      const rawPort = this.configService.get<string | number>('SMTP_PORT', 587);
      const smtpPort = Number(rawPort) || 587;
      const rawSecure = this.configService.get<string | boolean>('SMTP_SECURE');
      const smtpSecure =
        rawSecure === true || rawSecure === 'true' || smtpPort === 465;
      const smtpUser = this.configService.get<string>('SMTP_USER', '').trim();
      const smtpPass = (
        this.configService.get<string>('SMTP_PASS') ||
        this.configService.get<string>('SMTP_PASSWORD') ||
        ''
      ).trim();

      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        ...(smtpUser
          ? {
              auth: {
                user: smtpUser,
                pass: smtpPass,
              },
            }
          : {}),
      });
    }
  }

  isConfigured(): boolean {
    return this.isSmtpConfigured && this.transporter !== null;
  }

  async sendVerificationEmail(userId: string, email: string): Promise<void> {
    if (!this.isConfigured() || !this.transporter) {
      this.logger.warn(
        `SMTP is not configured; auto-verifying account for ${email}`,
      );
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          emailVerified: true,
          status: 'ACTIVE',
        },
      });
      return;
    }

    try {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto
        .createHash('sha256')
        .update(rawToken)
        .digest('hex');
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      await this.prisma.emailVerificationToken.create({
        data: {
          userId,
          token: hashedToken,
          expiresAt,
        },
      });

      const defaultAppUrl =
        process.env.NODE_ENV === 'production'
          ? 'https://mkprinting.my.id'
          : 'http://localhost:5173';
      const appUrl = this.configService
        .get<string>('APP_URL', defaultAppUrl)
        .replace(/\/+$/, '');
      const verificationLink = `${appUrl}/verify-email/${rawToken}`;

      const htmlTemplate = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verify Your Email</h2>
          <p>Thank you for registering. Please click the button below to verify your email address:</p>
          <a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
          <p>Or copy and paste this link in your browser:</p>
          <p><a href="${verificationLink}">${verificationLink}</a></p>
          <p>This link will expire in 24 hours.</p>
        </div>
      `;

      await this.transporter.sendMail({
        from: this.configService.get<string>(
          'SMTP_FROM',
          '"Multi Kreasi Printing" <noreply@mkprinting.my.id>',
        ),
        to: email,
        subject: 'Verify Your Email - Multi Kreasi Printing',
        html: htmlTemplate,
      });

      this.logger.log(`Verification email sent to ${email}`);
    } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : String(error);
      const errStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to send verification email to ${email}: ${errMessage}`,
        errStack,
      );
      throw new InternalServerErrorException(
        'Failed to send verification email',
        { cause: error },
      );
    }
  }

  async verifyEmail(token: string): Promise<void> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const verificationToken =
      (await this.prisma.emailVerificationToken.findUnique({
        where: { token: hashedToken },
        include: { user: true },
      })) ||
      (await this.prisma.emailVerificationToken.findUnique({
        where: { token },
        include: { user: true },
      }));

    if (!verificationToken) {
      throw new BadRequestException('Invalid verification token');
    }

    if (verificationToken.usedAt) {
      throw new BadRequestException('Email already verified');
    }

    if (this.isTokenExpired(verificationToken.expiresAt)) {
      throw new BadRequestException('Verification token has expired');
    }

    await this.prisma.$transaction(async (prisma) => {
      // Mark token as used
      await prisma.emailVerificationToken.update({
        where: { id: verificationToken.id },
        data: { usedAt: new Date() },
      });

      // Update user status
      await prisma.user.update({
        where: { id: verificationToken.userId },
        data: {
          emailVerified: true,
          status: 'ACTIVE',
        },
      });
    });

    this.logger.log(`Email verified for user ${verificationToken.user.email}`);
  }

  async resendVerificationEmail(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists
      return;
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // Rate limiting: cooldown 60 seconds
    const recentToken = await this.prisma.emailVerificationToken.findFirst({
      where: {
        userId: user.id,
        createdAt: {
          gte: new Date(Date.now() - 60 * 1000),
        },
      },
    });

    if (recentToken) {
      throw new BadRequestException(
        'Silakan tunggu 60 detik sebelum meminta email verifikasi baru.',
      );
    }

    // Invalidate previous tokens
    await this.prisma.emailVerificationToken.deleteMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
    });

    await this.sendVerificationEmail(user.id, user.email);
  }

  private isTokenExpired(expiresAt: Date): boolean {
    return new Date() > expiresAt;
  }
}
