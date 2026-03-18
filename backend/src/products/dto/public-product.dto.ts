export class PublicProductDto {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  categoryId: string;
  categoryName?: string;
  images: { url: string; isPrimary: boolean }[];
  // Omitting internal data like cost, margin, status
}
