import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '../jwt.service';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async execute(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token tidak ada');
    }

    const payload = this.jwtService.verifyToken(refreshToken);
    if (!payload || payload.type !== 'refresh') {
      throw new UnauthorizedException('Refresh token tidak valid atau sudah kadaluarsa');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { role: true },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Pengguna tidak aktif');
    }

    const newAccessToken = this.jwtService.generateAccessToken(user.id, user.email, user.role.name);
    const newRefreshToken = this.jwtService.generateRefreshToken(user.id);

    return {
      refreshToken: newRefreshToken,
      response: {
        accessToken: newAccessToken,
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
