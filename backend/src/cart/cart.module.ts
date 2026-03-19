import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartMergeService } from './cart-merge.service';

@Module({
  controllers: [CartController],
  providers: [CartMergeService],
  exports: [CartMergeService],
})
export class CartModule {}
