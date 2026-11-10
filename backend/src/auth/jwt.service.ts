import { Injectable, Logger } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import type { Request } from 'express';

export interface JwtPayload extends jwt.JwtPayload {
  sub: string;
  id?: string;
  email?: string;
  role?: string;
  userId?: string;
  customerId?: string;
  type?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

@Injectable()
export class JwtService {
  private readonly logger = new Logger(JwtService.name);
  private readonly secret: string;
  private readonly refreshSecret: string;

  constructor() {
    // Enforce secret presence in production
    if (process.env.NODE_ENV === 'production') {
      if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
        throw new Error(
          'JWT_SECRET and JWT_REFRESH_SECRET environment variables are required in production',
        );
      }
    }

    this.secret =
      process.env.JWT_SECRET || 'dev-only-secret-do-not-use-in-prod';
    this.refreshSecret = process.env.JWT_REFRESH_SECRET || this.secret;

    if (!process.env.JWT_SECRET) {
      this.logger.warn(
        'JWT_SECRET not set — using insecure default. DO NOT deploy to production.',
      );
    }
  }

  generateAccessToken(userId: string, email: string, roleName: string): string {
    return jwt.sign({ sub: userId, email, role: roleName }, this.secret, {
      expiresIn: '24h',
      algorithm: 'HS256',
    });
  }

  generateRefreshToken(userId: string): string {
    return jwt.sign({ sub: userId, type: 'refresh' }, this.refreshSecret, {
      expiresIn: '7d',
      algorithm: 'HS256',
    });
  }

  verifyToken(token: string): JwtPayload | null {
    try {
      return jwt.verify(token, this.secret, {
        algorithms: ['HS256'],
      }) as JwtPayload;
    } catch {
      return null;
    }
  }

  verifyRefreshToken(token: string): JwtPayload | null {
    try {
      return jwt.verify(token, this.refreshSecret, {
        algorithms: ['HS256'],
      }) as JwtPayload;
    } catch {
      return null;
    }
  }
}
