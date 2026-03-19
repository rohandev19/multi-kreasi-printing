import { IsUUID, IsInt, Min } from 'class-validator';

export class GuestCartItemDto {
  @IsUUID()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}
