import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '../jwt.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Token tidak ditemukan atau format tidak valid',
      );
    }

    const token = authHeader.split(' ')[1];
    const payload = this.jwtService.verifyToken(token);

    // Ensure token is valid and not a refresh token
    if (!payload || payload.type === 'refresh') {
      throw new UnauthorizedException(
        'Token tidak valid atau sudah kadaluarsa',
      );
    }

    request.user = { ...payload, id: payload.sub };
    return true;
  }
}
