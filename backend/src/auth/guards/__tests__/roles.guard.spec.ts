import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../roles.guard';
import { PrismaService } from '../../../prisma/prisma.service';
import { CacheService } from '../../../cache/cache.service';
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';

describe('RolesGuard', () => {
  let rolesGuard: RolesGuard;
  let reflector: Reflector;
  let prismaService: PrismaService;
  let cacheService: CacheService;

  beforeEach(() => {
    reflector = new Reflector();
    prismaService = {
      user: {
        findUnique: vi.fn(),
      },
    } as any;
    cacheService = {
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue(undefined),
    } as any;
    rolesGuard = new RolesGuard(reflector, prismaService, cacheService);
  });

  const mockExecutionContext = (user: any): ExecutionContext => {
    return {
      getHandler: vi.fn(),
      getClass: vi.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as any;
  };

  it('should return true if route is public', async () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
    const context = mockExecutionContext(null);
    const result = await rolesGuard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should return true if no specific roles are required', async () => {
    vi.spyOn(reflector, 'getAllAndOverride')
      .mockReturnValueOnce(false) // Not public
      .mockReturnValueOnce(undefined); // No roles required

    const context = mockExecutionContext({ sub: 'user-1' });
    const result = await rolesGuard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should return false if user is not in request', async () => {
    vi.spyOn(reflector, 'getAllAndOverride')
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(['Owner']);

    const context = mockExecutionContext(null);
    const result = await rolesGuard.canActivate(context);
    expect(result).toBe(false);
  });

  it('should throw ForbiddenException if user is not found or not ACTIVE', async () => {
    vi.spyOn(reflector, 'getAllAndOverride')
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(['Owner']);

    const context = mockExecutionContext({ sub: 'user-1' });
    (prismaService.user.findUnique as Mock).mockResolvedValue(null);

    await expect(rolesGuard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should throw ForbiddenException if user does not have required role/permission', async () => {
    vi.spyOn(reflector, 'getAllAndOverride')
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(['Owner']);

    const context = mockExecutionContext({ sub: 'user-1' });
    (prismaService.user.findUnique as Mock).mockResolvedValue({
      id: 'user-1',
      status: 'ACTIVE',
      role: { name: 'Customer', permissions: [] },
    });

    await expect(rolesGuard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should return true if user has required role', async () => {
    vi.spyOn(reflector, 'getAllAndOverride')
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(['Owner']);

    const context = mockExecutionContext({ sub: 'user-1' });
    (prismaService.user.findUnique as Mock).mockResolvedValue({
      id: 'user-1',
      status: 'ACTIVE',
      role: { name: 'Owner', permissions: [] },
    });

    const result = await rolesGuard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should return true if user has * permission', async () => {
    vi.spyOn(reflector, 'getAllAndOverride')
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(['Manager']);

    const context = mockExecutionContext({ sub: 'user-1' });
    (prismaService.user.findUnique as Mock).mockResolvedValue({
      id: 'user-1',
      status: 'ACTIVE',
      role: { name: 'SuperAdmin', permissions: ['*'] },
    });

    const result = await rolesGuard.canActivate(context);
    expect(result).toBe(true);
  });
});
