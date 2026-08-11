import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { CreateProductUseCase } from './use-cases/create-product.usecase';
import { UpdateProductUseCase } from './use-cases/update-product.usecase';
import { SearchProductsUseCase } from './use-cases/search-products.usecase';
import { SetPricingTiersUseCase } from './use-cases/set-pricing-tiers.usecase';
import { ManageProductImagesUseCase } from './use-cases/manage-product-images.usecase';
import { StorageModule } from '../storage/storage.module';

import { CacheModule } from '@nestjs/cache-manager';
import { PublicProductsController } from './public-products.controller';
import { GetPublicProductsUseCase } from './use-cases/get-public-products.usecase';
import { GetPublicProductDetailUseCase } from './use-cases/get-public-product-detail.usecase';
import { AddProductReviewUseCase } from './use-cases/add-product-review.usecase';
import { GetProductReviewsUseCase } from './use-cases/get-product-reviews.usecase';

@Module({
  imports: [StorageModule, CacheModule.register()],
  controllers: [ProductsController, PublicProductsController],
  providers: [
    CreateProductUseCase,
    UpdateProductUseCase,
    SearchProductsUseCase,
    SetPricingTiersUseCase,
    ManageProductImagesUseCase,
    GetPublicProductsUseCase,
    GetPublicProductDetailUseCase,
    AddProductReviewUseCase,
    GetProductReviewsUseCase,
  ],
})
export class ProductsModule {}
