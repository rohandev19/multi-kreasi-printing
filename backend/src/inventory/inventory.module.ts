import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { SuppliersController } from './suppliers.controller';
import { SuppliersService } from './suppliers.service';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuthModule, PrismaModule, AuditModule],
  controllers: [InventoryController, SuppliersController],
  providers: [InventoryService, SuppliersService],
  exports: [InventoryService, SuppliersService],
})
export class InventoryModule {}
