import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class VerifiedGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // The user object should have been attached by the JwtAuthGuard
    if (!user || !user.sub) {
      return false;
    }

    // Check database to ensure we have the latest verified status
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.sub },
      select: { emailVerified: true },
    });

    if (!dbUser || dbUser.emailVerified === false) {
      throw new ForbiddenException({
        message:
          'Email not verified. Please verify your email to perform this action.',
        action: 'RESEND_VERIFICATION',
      });
    }

    return true;
  }
}
