import React from 'react';
import { Package, Clock, Warning, Gear, Users, CheckCircle, Palette, Truck, FileText, ShoppingCart, ChartBar, CurrencyCircleDollar, Database, Tray } from '@phosphor-icons/react';
import type { Icon } from '@phosphor-icons/react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  icon: string;
  color: 'emerald' | 'blue' | 'amber' | 'red' | 'purple' | 'indigo';
  loading?: boolean;
}

const colorMap = {
  emerald: {
    bg: 'bg-[var(--color-success-100)]',
    text: 'text-[var(--color-success-600)]',
  },
  blue: {
    bg: 'bg-[var(--color-info-100)]',
    text: 'text-[var(--color-info-600)]',
  },
  amber: {
    bg: 'bg-[var(--color-warning-100)]',
    text: 'text-[var(--color-warning-600)]',
  },
  red: {
    bg: 'bg-[var(--color-error-100)]',
    text: 'text-[var(--color-error-600)]',
  },
  purple: {
    bg: 'bg-[var(--color-primary-100)]',
    text: 'text-[var(--color-primary-600)]',
  },
  indigo: {
    bg: 'bg-[var(--color-primary-100)]',
    text: 'text-[var(--color-primary-600)]',
  },
};

const iconMap: Record<string, Icon> = {
  revenue: CurrencyCircleDollar,
  orders: Package,
  clock: Clock,
  alert: Warning,
  cogs: Gear,
  users: Users,
  check: CheckCircle,
  palette: Palette,
  server: Database,
  inbox: Tray,
  truck: Truck,
  document: FileText,
  cart: ShoppingCart,
  chart: ChartBar,
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  icon,
  color,
  loading = false,
}) => {
  const styles = colorMap[color];
  const IconComponent = iconMap[icon] || ChartBar;

  if (loading) {
    return (
      <div className="border p-6 shadow-sm animate-pulse" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
        <div className="mb-2 flex items-center justify-between">
          <div className="h-4 w-1/2 rounded" style={{ backgroundColor: 'var(--color-neutral-200)' }}></div>
          <div className="h-10 w-10 rounded-lg" style={{ backgroundColor: 'var(--color-neutral-100)' }}></div>
        </div>
        <div className="mt-4 h-8 w-3/4 rounded" style={{ backgroundColor: 'var(--color-neutral-200)' }}></div>
        <div className="mt-3 h-3 w-1/3 rounded" style={{ backgroundColor: 'var(--color-neutral-200)' }}></div>
      </div>
    );
  }

  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      if (icon === 'revenue') {
        return new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(val);
      }
      return new Intl.NumberFormat('id-ID').format(val);
    }
    return val;
  };

  return (
    <div className="border p-6 transition-all duration-150 ease-out hover:shadow-md" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
          {title}
        </h3>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${styles.bg}`}>
          <IconComponent className={`h-5 w-5 ${styles.text}`} weight="regular" />
        </div>
      </div>
      <p className={`text-3xl font-bold tabular-nums ${styles.text}`}>
        {formatValue(value)}
      </p>
      {change && (
        <p className="mt-1 flex items-center gap-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <span
            className={`font-medium ${
              change.isPositive ? 'text-[var(--color-success-600)]' : 'text-[var(--color-error-600)]'
            }`}
          >
            {change.isPositive ? '↑' : '↓'} {Math.abs(change.value).toFixed(1)}%
          </span>
          <span>{change.label}</span>
        </p>
      )}
    </div>
  );
};
