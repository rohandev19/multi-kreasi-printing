import {
  Controller,
  Post,
  Body,
  Req,
  Get,
  Query,
  Param,
  Patch,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
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
import { FileInterceptor } from '@nestjs/platform-express';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CacheService } from '../cache/cache.service';

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

  @Get()
  @Public() // Catalog search is public
  async search(@Query() query: SearchProductsDto) {
    return this.searchProductsUseCase.execute(query);
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
    @UploadedFile() file: Express.Multer.File,
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
