import { PublicProductDto } from './public-product.dto';

export class ProductListResponseDto {
  data: PublicProductDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  categories: { id: string; name: string }[];
}
