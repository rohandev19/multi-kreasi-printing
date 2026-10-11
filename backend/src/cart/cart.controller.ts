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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { CartMergeService } from './cart-merge.service';
import { MergeCartDto } from './dto/merge-cart.dto';
import type { Request } from 'express';

@Controller('api/v1/cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartMergeService: CartMergeService) {}

  @Post('merge')
  async mergeCart(@Body() dto: MergeCartDto, @Req() req: Request) {
    const userId = (req as any).user.sub;
    return this.cartMergeService.mergeGuestCart(userId, dto.guestCartItems);
  }

  @Get()
  async getCart(@Req() req: Request) {
    const userId = (req as any).user.sub;
    // Calling merge without new items will just fetch and calculate current cart
    return this.cartMergeService.mergeGuestCart(userId, []);
  }

  @Post('items')
  async addItem(
    @Body() body: { productId: string; quantity: number },
    @Req() req: Request,
  ) {
    const userId = (req as any).user.sub;
    return this.cartMergeService.mergeGuestCart(userId, [body]);
  }

  @Patch('items/:productId')
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
  async removeItem(@Param('productId') productId: string, @Req() req: Request) {
    const userId = (req as any).user.sub;
    return this.cartMergeService.removeItem(userId, productId);
  }

  @Delete()
  async clearCart(@Req() req: Request) {
    const userId = (req as any).user.sub;
    return this.cartMergeService.clearCart(userId);
  }
}
