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

  async execute(dto: RegisterRequestDto): Promise<{ message: string; userId: string }> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
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
          permissions: [],
        }
      });
    }

    // Create user with Unverified status
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        fullName: dto.fullName,
        roleId: customerRole.id,
        status: 'Unverified',
        emailVerified: false,
      },
    });

    // Send verification email
    await this.emailVerificationService.sendVerificationEmail(user.id, user.email);

    return {
      message: 'Registration successful. Please check your email to verify your account.',
      userId: user.id,
    };
  }
}
