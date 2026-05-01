import { Controller, Post, Body, Req, Get } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { CartMergeService } from './cart-merge.service';
import { MergeCartDto } from './dto/merge-cart.dto';
import type { Request } from 'express';

@Controller('api/v1/cart')
export class CartController {
  constructor(private readonly cartMergeService: CartMergeService) {}

  @Post('merge')
  @Roles('Customer')
  async mergeCart(@Body() dto: MergeCartDto, @Req() req: Request) {
    const userId = (req as any).user.sub;
    return this.cartMergeService.mergeGuestCart(userId, dto.guestCartItems);
  }

  @Get()
  @Roles('Customer')
  async getCart(@Req() req: Request) {
    const userId = (req as any).user.sub;
    // Calling merge without new items will just fetch and calculate current cart
    return this.cartMergeService.mergeGuestCart(userId, []);
  }
}
