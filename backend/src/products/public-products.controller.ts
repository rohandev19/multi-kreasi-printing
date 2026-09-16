import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { GetPublicProductsUseCase } from './use-cases/get-public-products.usecase';
import { GetPublicProductDetailUseCase } from './use-cases/get-public-product-detail.usecase';
import { GetPublicProductsDto } from './dto/get-public-products.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';

@Controller('api/v1/public/products')
export class PublicProductsController {
  constructor(
    private readonly getPublicProducts: GetPublicProductsUseCase,
    private readonly getPublicProductDetail: GetPublicProductDetailUseCase,
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  @Get()
  @Public()
  async getProducts(@Query() query: GetPublicProductsDto) {
    const queryKey = JSON.stringify(query);
    const cacheKey = `/api/v1/public/products?query=${queryKey}`;

    const cached = await this.cacheService.get(cacheKey);
    if (cached) return cached;

    const result = await this.getPublicProducts.execute(query);
    await this.cacheService.set(cacheKey, result, 1800); // 30 mins

    return result;
  }

  @Get('categories')
  @Public()
  async getCategories() {
    const cacheKey = 'public_categories';
    const cached = await this.cacheService.get(cacheKey);
    if (cached) return cached;

    const categories = await this.prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
      },
    });

    const result = { data: categories };
    await this.cacheService.set(cacheKey, result, 1800);
    return result;
  }

  @Get(':id')
  @Public()
  async getProductDetail(@Param('id') id: string) {
    const cacheKey = `/api/v1/public/products/${id}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) return cached;

    const result = await this.getPublicProductDetail.execute(id);
    await this.cacheService.set(cacheKey, result, 1800);
    return result;
  }
}
