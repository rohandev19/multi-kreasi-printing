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
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailVerificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST', 'localhost'),
      port: this.configService.get<number>('SMTP_PORT', 1025), // Default to Mailhog
      secure: this.configService.get<boolean>('SMTP_SECURE', false),
      auth: {
        user: this.configService.get<string>('SMTP_USER', ''),
        pass: this.configService.get<string>('SMTP_PASS', ''),
      },
    });
  }

  async sendVerificationEmail(userId: string, email: string): Promise<void> {
    try {
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      await this.prisma.emailVerificationToken.create({
        data: {
          userId,
          token,
          expiresAt,
        },
      });

      const appUrl = this.configService.get<string>(
        'APP_URL',
        'http://localhost:5173',
      );
      const verificationLink = `${appUrl}/verify-email?token=${token}`;

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
          '"Multi Kreasi Printing" <noreply@mkprinting.test>',
        ),
        to: email,
        subject: 'Verify Your Email - Multi Kreasi Printing',
        html: htmlTemplate,
      });

      this.logger.log(`Verification email sent to ${email}`);
    } catch (error: any) {
      this.logger.error(
        `Failed to send verification email to ${email}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to send verification email',
      );
    }
  }

  async verifyEmail(token: string): Promise<void> {
    const verificationToken =
      await this.prisma.emailVerificationToken.findUnique({
        where: { token },
        include: { user: true },
      });

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
          status: 'Active',
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
