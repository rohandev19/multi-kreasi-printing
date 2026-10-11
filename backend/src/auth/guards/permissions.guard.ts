import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  PERMISSIONS_KEY,
  PermissionRequirement,
} from '../decorators/permissions.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { CacheService } from '../../cache/cache.service';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
    private cache: CacheService,
    private audit: AuditService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const requiredPermissions = this.reflector.getAllAndOverride<
      PermissionRequirement[]
    >(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user, params, query, body } = context.switchToHttp().getRequest();
    if (!user) {
      return false;
    }

    const cacheKey = `user_permissions_${user.sub}`;
    let userDb: any = await this.cache.get(cacheKey);

    if (!userDb) {
      userDb = await this.prisma.user.findUnique({
        where: { id: user.sub },
        include: { role: { include: { permissions: true } } },
      });

      if (userDb) {
        await this.cache.set(cacheKey, userDb, 3600);
      }
    }

    if (!userDb || userDb.status !== 'ACTIVE') {
      throw new ForbiddenException('Akses ditolak: Akun tidak aktif');
    }

    const userPermissions: any[] = userDb.role?.permissions || [];

    // Check if user has 'manage' 'all' (SuperAdmin)
    const isSuperAdmin = userPermissions.some(
      (p: any) => p.action === 'manage' && p.subject === 'all',
    );

    if (isSuperAdmin) {
      return true;
    }

    const hasAllRequiredPermissions = requiredPermissions.every((req) => {
      return userPermissions.some((up: any) => {
        // action match or 'manage' wildcard
        const actionMatch = up.action === req.action || up.action === 'manage';
        // subject match or 'all' wildcard (supporting singular/plural normalization)
        const normalizeSubject = (s: string) => (s ? s.toLowerCase().replace(/s$/, '') : '');
        const subjectMatch =
          up.subject === req.subject ||
          up.subject === 'all' ||
          normalizeSubject(up.subject) === normalizeSubject(req.subject);

        if (!actionMatch || !subjectMatch) return false;

        // If ABAC conditions exist, evaluate them
        if (up.conditions && typeof up.conditions === 'object') {
          // Simplistic ABAC: e.g. {"customerId": "{{id}}"}
          // Note: In real app, we need to fetch the resource to compare ownerId etc.
          // For now, checking if params/body matches condition variables like {{id}}
          // We will implement a full CASL alternative later if needed.
          const conditionKeys = Object.keys(up.conditions);
          for (const key of conditionKeys) {
            let expectedValue = up.conditions[key];
            if (expectedValue === '{{id}}') {
              expectedValue = userDb.id;
            }
            // Check if request param or body has this value (very basic)
            const actualValue = params[key] || body[key] || query[key];
            if (actualValue !== undefined && actualValue !== expectedValue) {
              return false;
            }
          }
        }
        return true;
      });
    });

    if (!hasAllRequiredPermissions) {
      const { method, originalUrl, ip } = context.switchToHttp().getRequest();

      // Log to AuditService immediately without awaiting to not block the request completely
      this.audit
        .log({
          userId: userDb.id,
          action: 'FORBIDDEN_ACCESS_ATTEMPT',
          entityType: 'Endpoint',
          entityId: `${method} ${originalUrl}`,
          ipAddress: ip,
          newValue: { requiredPermissions },
        })
        .catch(console.error);

      throw new ForbiddenException(
        'Akses ditolak: Anda tidak memiliki izin untuk tindakan ini',
      );
    }

    return true;
  }
}
