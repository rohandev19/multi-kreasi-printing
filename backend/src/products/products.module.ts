import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { CreateProductUseCase } from './use-cases/create-product.usecase';
import { UpdateProductUseCase } from './use-cases/update-product.usecase';
import { SearchProductsUseCase } from './use-cases/search-products.usecase';
import { SetPricingTiersUseCase } from './use-cases/set-pricing-tiers.usecase';
import { ManageProductImagesUseCase } from './use-cases/manage-product-images.usecase';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [StorageModule],
  controllers: [ProductsController],
  providers: [
    CreateProductUseCase,
    UpdateProductUseCase,
    SearchProductsUseCase,
    SetPricingTiersUseCase,
    ManageProductImagesUseCase,
  ],
})
export class ProductsModule {}
