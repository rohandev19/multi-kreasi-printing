import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AddProductReviewDto } from '../dto/add-product-review.dto';

@Injectable()
export class AddProductReviewUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(productId: string, userId: string, dto: AddProductReviewDto) {
    // 1. Verify product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // 2. Create the review
    const review = await this.prisma.productReview.create({
      data: {
        productId,
        userId,
        rating: dto.rating,
        comment: dto.comment,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          }
        }
      }
    });

    return review;
  }
}
