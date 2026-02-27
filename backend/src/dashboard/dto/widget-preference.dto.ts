import { IsArray, IsString } from 'class-validator';

export class UpdateWidgetPreferenceDto {
  @IsArray()
  @IsString({ each: true })
  layoutOrder: string[];

  @IsArray()
  @IsString({ each: true })
  enabledWidgets: string[];
}
