export class QuotationItemDto {
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  notes?: string;
}

export class CreateQuotationDto {
  customerId: string;
  subtotal: number;
  tax: number;
  totalAmount: number;
  validUntil?: string;
  notes?: string;
  terms?: string;
  items: QuotationItemDto[];
}

export class UpdateQuotationDto {
  customerId?: string;
  subtotal?: number;
  tax?: number;
  totalAmount?: number;
  status?: string;
  validUntil?: string;
  notes?: string;
  terms?: string;
  items?: QuotationItemDto[];
}
