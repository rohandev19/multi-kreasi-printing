import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PermissionsGuard } from '../permissions.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CacheService } from '../../../cache/cache.service';
import { AuditService } from '../../../audit/audit.service';

describe('PermissionsGuard - RBAC & ABAC Verification', () => {
  let guard: PermissionsGuard;
  let reflector: Reflector;
  let prismaMock: any;
  let cacheMock: any;
  let auditMock: any;

  beforeEach(() => {
    reflector = new Reflector();
    prismaMock = {
      user: {
        findUnique: vi.fn(),
      },
    };
    cacheMock = {
      get: vi.fn(),
      set: vi.fn(),
    };
    auditMock = {
      log: vi.fn().mockResolvedValue({}),
    };

    guard = new PermissionsGuard(reflector, prismaMock, cacheMock, auditMock);
  });

  function createMockContext(
    user: any,
    requiredPermissions: any[] | null,
    isPublic = false,
  ) {
    vi.spyOn(reflector, 'getAllAndOverride').mockImplementation((key: any) => {
      if (key === 'isPublic') return isPublic;
      if (key === 'permissions') return requiredPermissions;
      return null;
    });

    const mockRequest = {
      user,
      params: {},
      query: {},
      body: {},
      method: 'GET',
      originalUrl: '/test',
      ip: '127.0.0.1',
    };

    return {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;
  }

  it('should allow access to public routes without checking permissions', async () => {
    const ctx = createMockContext(
      null,
      [{ action: 'read', subject: 'Product' }],
      true,
    );
    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
  });

  it('should allow SuperAdmin with manage all permission to access any endpoint', async () => {
    const ctx = createMockContext({ sub: 'user-admin' }, [
      { action: 'delete', subject: 'Customer' },
    ]);

    cacheMock.get.mockResolvedValueOnce({
      id: 'user-admin',
      status: 'ACTIVE',
      role: {
        name: 'Owner',
        permissions: [{ action: 'manage', subject: 'all' }],
      },
    });

    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
  });

  it('should match normalized singular and plural subjects (e.g. User and Users)', async () => {
    const ctx = createMockContext({ sub: 'user-staff' }, [
      { action: 'read', subject: 'Users' },
    ]);

    cacheMock.get.mockResolvedValueOnce({
      id: 'user-staff',
      status: 'ACTIVE',
      role: {
        name: 'Staff',
        permissions: [{ action: 'read', subject: 'User' }], // Singular
      },
    });

    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
  });

  it('should throw ForbiddenException when user is inactive', async () => {
    const ctx = createMockContext({ sub: 'user-suspended' }, [
      { action: 'read', subject: 'Order' },
    ]);

    cacheMock.get.mockResolvedValueOnce({
      id: 'user-suspended',
      status: 'SUSPENDED',
      role: {
        permissions: [{ action: 'manage', subject: 'all' }],
      },
    });

    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });

  it('should deny and log audit attempt when required permission is missing', async () => {
    const ctx = createMockContext({ sub: 'user-limited' }, [
      { action: 'manage', subject: 'Settings' },
    ]);

    cacheMock.get.mockResolvedValueOnce({
      id: 'user-limited',
      status: 'ACTIVE',
      role: {
        permissions: [{ action: 'read', subject: 'Product' }],
      },
    });

    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
    expect(auditMock.log).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-limited',
        action: 'FORBIDDEN_ACCESS_ATTEMPT',
      }),
    );
  });
});
