import {
  Controller,
  Post,
  Body,
  Req,
  Get,
  Patch,
  Delete,
  Param,
} from '@nestjs/common';
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

  @Post('items')
  @Roles('Customer')
  async addItem(
    @Body() body: { productId: string; quantity: number },
    @Req() req: Request,
  ) {
    const userId = (req as any).user.sub;
    return this.cartMergeService.mergeGuestCart(userId, [body]);
  }

  @Patch('items/:productId')
  @Roles('Customer')
  async updateItem(
    @Param('productId') productId: string,
    @Body() body: { quantity: number },
    @Req() req: Request,
  ) {
    const userId = (req as any).user.sub;
    return this.cartMergeService.updateItemQuantity(
      userId,
      productId,
      body.quantity,
    );
  }

  @Delete('items/:productId')
  @Roles('Customer')
  async removeItem(@Param('productId') productId: string, @Req() req: Request) {
    const userId = (req as any).user.sub;
    return this.cartMergeService.removeItem(userId, productId);
  }

  @Delete()
  @Roles('Customer')
  async clearCart(@Req() req: Request) {
    const userId = (req as any).user.sub;
    return this.cartMergeService.clearCart(userId);
  }
}
