export class PublicProductDto {
  id: string;
  sku?: string;
  name: string;
  description: string;
  basePrice: number;
  unitOfMeasure?: string;
  categoryId: string;
  categoryName?: string;
  images: { url: string; isPrimary: boolean }[];
  // Omitting internal data like cost, margin, status
}
