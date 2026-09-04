import {
  Controller,
  Post,
  Body,
  Req,
  Get,
  Query,
  Param,
  Patch,
  Delete,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { SearchProductsDto } from './dto/search-products.dto';
import { SetPricingTiersDto } from './dto/set-pricing-tiers.dto';
import { CreateProductUseCase } from './use-cases/create-product.usecase';
import { UpdateProductUseCase } from './use-cases/update-product.usecase';
import { SearchProductsUseCase } from './use-cases/search-products.usecase';
import { SetPricingTiersUseCase } from './use-cases/set-pricing-tiers.usecase';
import { ManageProductImagesUseCase } from './use-cases/manage-product-images.usecase';
import { AddProductReviewDto } from './dto/add-product-review.dto';
import { AddProductReviewUseCase } from './use-cases/add-product-review.usecase';
import { GetProductReviewsUseCase } from './use-cases/get-product-reviews.usecase';
import { Roles } from '../auth/decorators/roles.decorator';
import type { Request } from 'express';
import type { Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CacheService } from '../cache/cache.service';
import { PrismaService } from '../prisma/prisma.service';
export interface AuthenticatedUser {
  sub: string;
  role: string;
  email: string;
  id?: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
import { Public } from '../auth/decorators/public.decorator';

@Controller('api/v1/products')
export class ProductsController {
  constructor(
    private createProductUseCase: CreateProductUseCase,
    private updateProductUseCase: UpdateProductUseCase,
    private searchProductsUseCase: SearchProductsUseCase,
    private setPricingTiersUseCase: SetPricingTiersUseCase,
    private manageProductImagesUseCase: ManageProductImagesUseCase,
    private addProductReviewUseCase: AddProductReviewUseCase,
    private getProductReviewsUseCase: GetProductReviewsUseCase,
    private cacheService: CacheService,
    private prisma: PrismaService,
  ) {}

  @Post()
  @Roles('Owner', 'Manager')
  async create(
    @Body() dto: CreateProductDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.sub;
    const result = await this.createProductUseCase.execute(dto, userId);
    await this.cacheService.invalidatePattern('/api/v1/public/products*');
    await this.cacheService.invalidatePattern('public_categories*');
    return result;
  }

  @Get('categories')
  @Roles('Owner', 'Manager')
  async getCategories() {
    const categories = await this.prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, description: true },
    });
    return { data: categories };
  }

  @Post('categories')
  @Roles('Owner', 'Manager')
  async createCategory(@Body() dto: { name: string; description?: string }) {
    const name = dto.name?.trim();
    if (!name) {
      throw new BadRequestException('Nama kategori wajib diisi');
    }

    const category = await this.prisma.category.create({
      data: {
        name,
        description: dto.description?.trim() || null,
      },
    });

    await this.cacheService.invalidatePattern('/api/v1/public/products*');
    await this.cacheService.invalidatePattern('public_categories*');
    return category;
  }

  @Patch('categories/:id')
  @Roles('Owner', 'Manager')
  async updateCategory(
    @Param('id') id: string,
    @Body() dto: { name?: string; description?: string },
  ) {
    const existing = await this.prisma.category.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Kategori tidak ditemukan');
    }

    const name = dto.name?.trim();
    if (name) {
      existing.name = name;
    }

    const category = await this.prisma.category.update({
      where: { id },
      data: {
        name: name ?? existing.name,
        description:
          dto.description !== undefined
            ? dto.description?.trim() || null
            : existing.description,
      },
    });

    await this.cacheService.invalidatePattern('/api/v1/public/products*');
    await this.cacheService.invalidatePattern('public_categories*');
    return category;
  }

  @Delete('categories/:id')
  @Roles('Owner', 'Manager')
  async deleteCategory(@Param('id') id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException('Kategori tidak ditemukan');
    }

    const productCount = await this.prisma.product.count({
      where: { categoryId: id },
    });
    if (productCount > 0) {
      throw new BadRequestException(
        'Kategori masih digunakan produk, pindahkan atau hapus produknya terlebih dahulu',
      );
    }

    await this.prisma.category.delete({ where: { id } });
    await this.cacheService.invalidatePattern('/api/v1/public/products*');
    await this.cacheService.invalidatePattern('public_categories*');
    return { success: true, message: 'Kategori berhasil dihapus' };
  }

  @Get()
  @Public() // Catalog search is public
  async search(@Query() query: SearchProductsDto) {
    return this.searchProductsUseCase.execute(query);
  }

  @Get(':id')
  @Roles('Owner', 'Manager')
  async getProductDetail(@Param('id') id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, description: true } },
        pricingTiers: { orderBy: { minQuantity: 'asc' } },
        images: {
          orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
          select: { id: true, url: true, isPrimary: true, createdAt: true },
        },
        reviews: { take: 1, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!product) {
      throw new NotFoundException('Produk tidak ditemukan');
    }
    return {
      data: {
        id: product.id,
        sku: product.sku,
        name: product.name,
        description: product.description,
        categoryId: product.categoryId,
        category: product.category,
        basePrice: Number(product.basePrice),
        unitOfMeasure: product.unitOfMeasure,
        status: product.status,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        pricingTiers: product.pricingTiers.map((t) => ({
          id: t.id,
          minQuantity: t.minQuantity,
          maxQuantity: t.maxQuantity,
          unitPrice: Number(t.unitPrice),
        })),
        images: product.images,
        reviewCount: product.reviews.length,
      },
    };
  }

  @Delete(':id')
  @Roles('Owner', 'Manager')
  async deleteProduct(@Param('id') id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException('Produk tidak ditemukan');
    }

    const updated = await this.prisma.product.update({
      where: { id },
      data: { status: 'Discontinued' },
    });

    await this.cacheService.invalidatePattern('/api/v1/public/products*');
    await this.cacheService.invalidatePattern('public_categories*');
    return { success: true, product: updated };
  }

  @Patch(':id')
  @Roles('Owner', 'Manager')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.sub;
    const result = await this.updateProductUseCase.execute(id, dto, userId);
    await this.cacheService.invalidatePattern('/api/v1/public/products*');
    await this.cacheService.invalidatePattern('public_categories*');
    return result;
  }

  @Post(':id/pricing-tiers')
  @Roles('Owner', 'Manager')
  async setPricingTiers(
    @Param('id') id: string,
    @Body() dto: SetPricingTiersDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.sub;
    const result = await this.setPricingTiersUseCase.execute(id, dto, userId);
    await this.cacheService.invalidatePattern('/api/v1/public/products*');
    return result;
  }

  @Post(':id/images')
  @Roles('Owner', 'Manager')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile()
    file: Parameters<ManageProductImagesUseCase['uploadImage']>[1],
    @Body('isPrimary') isPrimary: string,
    @Req() req: AuthenticatedRequest,
  ) {
    if (!file) throw new BadRequestException('File gambar tidak ditemukan');
    const userId = req.user.sub;
    const isPrimaryBool = isPrimary === 'true';
    const result = await this.manageProductImagesUseCase.uploadImage(
      id,
      file,
      isPrimaryBool,
      userId,
    );
    await this.cacheService.invalidatePattern('/api/v1/public/products*');
    return result;
  }

  @Delete(':productId/images/:imageId')
  @Roles('Owner', 'Manager')
  async deleteImage(
    @Param('productId') productId: string,
    @Param('imageId') imageId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.sub;
    const result = await this.manageProductImagesUseCase.deleteImage(
      productId,
      imageId,
      userId,
    );
    await this.cacheService.invalidatePattern('/api/v1/public/products*');
    return result;
  }

  @Patch(':productId/images/:imageId/set-primary')
  @Roles('Owner', 'Manager')
  async setPrimaryImage(
    @Param('productId') productId: string,
    @Param('imageId') imageId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.sub;
    const result = await this.manageProductImagesUseCase.setPrimaryImage(
      productId,
      imageId,
      userId,
    );
    await this.cacheService.invalidatePattern('/api/v1/public/products*');
    return result;
  }

  @Get(':id/reviews')
  @Public()
  async getReviews(@Param('id') id: string) {
    return this.getProductReviewsUseCase.execute(id);
  }

  @Post(':id/reviews')
  @UseGuards(JwtAuthGuard)
  async addReview(
    @Param('id') id: string,
    @Body() dto: AddProductReviewDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.sub;
    const result = await this.addProductReviewUseCase.execute(id, userId, dto);
    await this.cacheService.invalidatePattern('/api/v1/public/products*');
    return result;
  }
}
