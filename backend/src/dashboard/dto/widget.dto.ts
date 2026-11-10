export interface WidgetListItemDto {
  label: string;
  value: string | number;
  color?: string;
}

export interface WidgetDto {
  id: string;
  title: string;
  type: 'stat' | 'chart' | 'list';
  value?: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  data?: WidgetListItemDto[] | Record<string, unknown>[];
  icon?: string;
  color?: string;
}
