import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { Public } from '../auth/decorators/public.decorator';
import { GetPublicProductsUseCase } from './use-cases/get-public-products.usecase';
import { GetPublicProductDetailUseCase } from './use-cases/get-public-product-detail.usecase';
import { GetPublicProductsDto } from './dto/get-public-products.dto';
import { PrismaService } from '../prisma/prisma.service';

@Controller('api/v1/public/products')
@UseInterceptors(CacheInterceptor)
export class PublicProductsController {
  constructor(
    private readonly getPublicProducts: GetPublicProductsUseCase,
    private readonly getPublicProductDetail: GetPublicProductDetailUseCase,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @Public()
  @CacheTTL(300) // 5 minutes TTL
  async getProducts(@Query() query: GetPublicProductsDto) {
    return this.getPublicProducts.execute(query);
  }

  @Get('categories')
  @Public()
  @CacheTTL(300)
  @CacheKey('public_categories')
  async getCategories() {
    const categories = await this.prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
      },
    });
    return { data: categories };
  }

  @Get(':id')
  @Public()
  @CacheTTL(300)
  async getProductDetail(@Param('id') id: string) {
    return this.getPublicProductDetail.execute(id);
  }
}
