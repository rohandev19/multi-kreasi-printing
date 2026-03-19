import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { GuestCartItemDto } from './guest-cart-item.dto';

export class MergeCartDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuestCartItemDto)
  guestCartItems: GuestCartItemDto[];
}
