import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtService {
  private readonly secret =
    process.env.JWT_SECRET ||
    'super-secret-key-change-in-production-min-32-chars';

  generateAccessToken(userId: string, email: string, roleName: string): string {
    return jwt.sign({ sub: userId, email, role: roleName }, this.secret, {
      expiresIn: '24h',
    });
  }

  generateRefreshToken(userId: string): string {
    return jwt.sign({ sub: userId, type: 'refresh' }, this.secret, {
      expiresIn: '7d',
    });
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.secret);
    } catch (e) {
      return null;
    }
  }
}
