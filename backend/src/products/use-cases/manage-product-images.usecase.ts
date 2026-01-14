import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../../storage/storage.service';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class ManageProductImagesUseCase {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
    private audit: AuditService,
  ) {}

  async uploadImage(productId: string, file: Express.Multer.File, isPrimary: boolean, currentUserId: string) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Produk tidak ditemukan');

    const imageCount = await this.prisma.productImage.count({ where: { productId } });
    if (imageCount >= 5) {
      throw new Error('Maksimal 5 gambar per produk');
    }

    // Upload to Cloudflare R2
    const { url, r2Path } = await this.storage.uploadFile(file, `products/${productId}`);

    // Inside transaction: if isPrimary is true, unset other primary images
    await this.prisma.$transaction(async (tx) => {
      if (isPrimary) {
        await tx.productImage.updateMany({
          where: { productId, isPrimary: true },
          data: { isPrimary: false },
        });
      }

      await tx.productImage.create({
        data: {
          productId,
          r2Path,
          url,
          isPrimary: isPrimary || imageCount === 0, // Make primary if it's the first image
        },
      });
    });

    await this.audit.log({
      userId: currentUserId,
      action: 'PRODUCT_IMAGE_UPLOADED',
      entityType: 'Product',
      entityId: productId,
    });

    return { success: true, url };
  }
}
