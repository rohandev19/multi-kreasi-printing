import { Prisma } from '@prisma/client';

export class UpdateSettingDto {
  value: Prisma.InputJsonValue;
  description?: string;
}
