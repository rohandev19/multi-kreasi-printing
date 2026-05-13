import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GuestCartItemDto } from './dto/guest-cart-item.dto';
import { CartResponseDto, CartItemResponseDto } from './dto/cart-response.dto';

@Injectable()
export class CartMergeService {
  constructor(private readonly prisma: PrismaService) {}

  async mergeGuestCart(
    userId: string,
    guestCartItems: GuestCartItemDto[],
  ): Promise<CartResponseDto> {
    // 1. Get or create user cart
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  where: { isPrimary: true },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: {
          items: { include: { product: { include: { images: true } } } },
        },
      });
    }

    // 2. Process guest items
    if (guestCartItems && guestCartItems.length > 0) {
      for (const guestItem of guestCartItems) {
        // Verify product exists and get its price
        const product = await this.prisma.product.findUnique({
          where: { id: guestItem.productId, status: 'Active' },
        });

        if (!product) continue; // Skip invalid or inactive products

        const existingItemIndex = cart.items.findIndex(
          (item) => item.productId === guestItem.productId,
        );

        if (existingItemIndex >= 0) {
          // Update quantity and subtotal of existing item
          const existingItem = cart.items[existingItemIndex];
          const newQuantity = existingItem.quantity + guestItem.quantity;
          const newSubtotal = Number(product.basePrice) * newQuantity;

          await this.prisma.cartItem.update({
            where: { id: existingItem.id },
            data: {
              quantity: newQuantity,
              subtotal: newSubtotal,
            },
          });
        } else {
          // Add new item to cart
          const subtotal = Number(product.basePrice) * guestItem.quantity;
          await this.prisma.cartItem.create({
            data: {
              cartId: cart.id,
              productId: guestItem.productId,
              quantity: guestItem.quantity,
              unitPrice: product.basePrice,
              subtotal: subtotal,
            },
          });
        }
      }

      // Re-fetch cart with updated items
      cart = await this.prisma.cart.findUnique({
        where: { id: cart.id },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: {
                    where: { isPrimary: true },
                    take: 1,
                  },
                },
              },
            },
          },
        },
      });
    }

    // 3. Calculate totals
    let subtotal = 0;
    const formattedItems: CartItemResponseDto[] = cart!.items.map((item) => {
      const itemSubtotal = Number(item.subtotal);
      subtotal += itemSubtotal;

      const primaryImage = item.product.images?.[0]?.url;

      return {
        id: item.id,
        productId: item.productId,
        name: item.product.name,
        unitPrice: Number(item.unitPrice),
        quantity: item.quantity,
        subtotal: itemSubtotal,
        image: primaryImage,
      };
    });

    // In a real app, calculate tax and shipping based on location and rules
    const taxRate = 0.11; // 11% PPN
    const tax = subtotal * taxRate;
    const shipping = subtotal > 0 ? 15000 : 0; // Flat shipping for example
    const totalAmount = subtotal + tax + shipping;

    return {
      id: cart!.id,
      userId: cart!.userId,
      items: formattedItems,
      subtotal,
      tax,
      shipping,
      totalAmount,
    };
  }

  async updateItemQuantity(userId: string, productId: string, quantity: number): Promise<CartResponseDto> {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart) throw new NotFoundException('Cart not found');

    const item = cart.items.find(i => i.productId === productId);
    if (!item) throw new NotFoundException('Item not found in cart');

    const newSubtotal = Number(item.product.basePrice) * quantity;

    await this.prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity, subtotal: newSubtotal },
    });

    return this.mergeGuestCart(userId, []); // Return recalculated cart
  }

  async removeItem(userId: string, productId: string): Promise<CartResponseDto> {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });

    if (!cart) throw new NotFoundException('Cart not found');

    const item = cart.items.find(i => i.productId === productId);
    if (item) {
      await this.prisma.cartItem.delete({ where: { id: item.id } });
    }

    return this.mergeGuestCart(userId, []);
  }

  async clearCart(userId: string): Promise<CartResponseDto> {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (cart) {
      await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
    return this.mergeGuestCart(userId, []);
  }
}
