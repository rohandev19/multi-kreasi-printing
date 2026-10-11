import { SetMetadata } from '@nestjs/common';

export interface PermissionRequirement {
  action: string;
  subject: string;
}

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: PermissionRequirement[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
