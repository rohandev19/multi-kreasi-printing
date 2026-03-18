import { PublicProductDto } from './public-product.dto';

export class PricingTierDto {
  minQuantity: number;
  pricePerUnit: number;
}

export class ProductDetailResponseDto {
  product: PublicProductDto;
  pricingTiers: PricingTierDto[];
}
