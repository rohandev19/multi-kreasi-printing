import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class GlobalSearchDto {
  @IsString()
  @MinLength(2, { message: 'Kata kunci pencarian minimal 2 karakter' })
  @MaxLength(100, { message: 'Kata kunci pencarian maksimal 100 karakter' })
  q: string;

  @IsOptional()
  @IsString()
  type?:
    'all' | 'orders' | 'customers' | 'products' | 'invoices' | 'quotations';
}

export interface SearchItemResult {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  url: string;
  type: 'order' | 'customer' | 'product' | 'invoice' | 'quotation';
}

export interface GlobalSearchResponseDto {
  query: string;
  total: number;
  results: {
    orders: SearchItemResult[];
    customers: SearchItemResult[];
    products: SearchItemResult[];
    invoices: SearchItemResult[];
    quotations: SearchItemResult[];
  };
}
