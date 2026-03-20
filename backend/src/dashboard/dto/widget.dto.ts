export interface WidgetDto {
  id: string;
  title: string;
  type: 'stat' | 'chart' | 'list';
  value?: any;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  data?: any;
  icon?: string;
  color?: string;
}
