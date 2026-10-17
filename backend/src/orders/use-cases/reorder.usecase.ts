import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CartMergeService } from '../../cart/cart-merge.service';

@Injectable()
export class ReorderUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cartMergeService: CartMergeService,
  ) {}

  async execute(orderId: string, currentUser: { sub: string; email: string }) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        items: {
          include: {
            product: {
              include: {
                pricingTiers: true,
                images: {
                  orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Pesanan dengan ID ${orderId} tidak ditemukan.`);
    }

    // IDOR Protection: Customer must own the order
    if (order.customer?.email !== currentUser.email) {
      throw new ForbiddenException(
        'Akses ditolak: Anda tidak memiliki izin untuk memesan ulang pesanan ini.',
      );
    }

    if (!order.items || order.items.length === 0) {
      throw new BadRequestException(
        'Pesanan ini tidak memiliki rincian item untuk dipesan ulang.',
      );
    }

    // Filter active items and record skipped ones
    const itemsToReorder: Array<{ productId: string; quantity: number }> = [];
    const skippedItems: string[] = [];

    for (const item of order.items) {
      if (!item.product) {
        skippedItems.push(`Item ID ${item.id}`);
        continue;
      }

      if (item.product.status && item.product.status !== 'Active') {
        skippedItems.push(`${item.product.name} (Produk tidak aktif)`);
        continue;
      }

      itemsToReorder.push({
        productId: item.productId,
        quantity: item.quantity,
      });
    }

    if (itemsToReorder.length === 0) {
      throw new BadRequestException(
        'Semua produk dalam pesanan ini sudah tidak aktif atau tidak tersedia di katalog.',
      );
    }

    // Merge reordered items into user's cart
    const updatedCart = await this.cartMergeService.mergeGuestCart(
      currentUser.sub,
      itemsToReorder,
    );

    return {
      success: true,
      message: `${itemsToReorder.length} item dari pesanan #${order.orderNumber} berhasil ditambahkan ke keranjang belanja Anda.`,
      orderNumber: order.orderNumber,
      reorderedCount: itemsToReorder.length,
      skippedCount: skippedItems.length,
      skippedDetails: skippedItems,
      cart: updatedCart,
    };
  }
}
