import React from 'react';
import { TrendUp, TrendDown } from '@phosphor-icons/react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'default',
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'bg-[var(--color-success-100)] text-[var(--color-success-600)]';
      case 'warning':
        return 'bg-[var(--color-warning-100)] text-[var(--color-warning-600)]';
      case 'danger':
        return 'bg-[var(--color-error-100)] text-[var(--color-error-600)]';
      default:
        return 'bg-[var(--color-primary-100)] text-[var(--color-primary-600)]';
    }
  };

  return (
    <div className="flex items-start justify-between border p-6 transition-all duration-150 ease-out hover:shadow-md" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
      <div>
        <h3 className="mb-1 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{title}</h3>
        <p className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          {value}
        </p>

        {(trend || subtitle) && (
          <div className="mt-2 flex items-center gap-2">
            {trend && (
              <span
                className={`flex items-center text-sm font-semibold ${
                  trend.direction === 'up' ? 'text-[var(--color-success-600)]' : 'text-[var(--color-error-600)]'
                }`}
              >
                {trend.direction === 'up' ? (
                  <TrendUp size={14} className="mr-1" weight="regular" />
                ) : (
                  <TrendDown size={14} className="mr-1" weight="regular" />
                )}
                {trend.value}%
              </span>
            )}
            {subtitle && (
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{subtitle}</span>
            )}
          </div>
        )}
      </div>
      <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${getVariantStyles()}`}>
        {React.cloneElement(icon as React.ReactElement<any>, { size: 28 })}
      </div>
    </div>
  );
};
