import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { CacheService } from '../../cache/cache.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // If no specific roles required, allow access (JWT already verified identity)
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      return false;
    }

    const cacheKey = `user_roles_${user.sub}`;
    let userDb: any = await this.cache.get(cacheKey);

    if (!userDb) {
      userDb = await this.prisma.user.findUnique({
        where: { id: user.sub },
        include: { role: true },
      });

      if (userDb) {
        // Cache for 1 hour (3600 seconds)
        await this.cache.set(cacheKey, userDb, 3600);
      }
    }

    if (!userDb || userDb.status !== 'ACTIVE') {
      throw new ForbiddenException('Akses ditolak: Akun tidak aktif');
    }

    const permissions = userDb.role.permissions as string[];

    // Check if user has '*' permission, matches the role name, or has specific required permission
    const hasPermission = requiredRoles.some(
      (role) =>
        permissions.includes('*') ||
        permissions.includes(role) ||
        userDb.role.name === role,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        'Akses ditolak: Anda tidak memiliki hak akses',
      );
    }

    return true;
  }
}
