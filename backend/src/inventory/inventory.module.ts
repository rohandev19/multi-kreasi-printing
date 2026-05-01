import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [InventoryController],
})
export class InventoryModule {}
