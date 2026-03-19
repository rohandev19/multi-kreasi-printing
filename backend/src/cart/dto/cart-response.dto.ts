export class CartItemResponseDto {
  id: string;
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  image?: string;
}

export class CartResponseDto {
  id: string;
  userId: string;
  items: CartItemResponseDto[];
  subtotal: number;
  tax: number;
  shipping: number;
  totalAmount: number;
}
