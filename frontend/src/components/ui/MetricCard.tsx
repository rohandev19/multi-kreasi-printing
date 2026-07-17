import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

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
        return 'bg-emerald-50 text-emerald-600';
      case 'warning':
        return 'bg-amber-50 text-amber-600';
      case 'danger':
        return 'bg-red-50 text-red-600';
      default:
        return 'bg-indigo-50 text-indigo-600';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow flex items-start justify-between">
      <div>
        <h3 className="text-sm font-medium text-slate-500 mb-1">{title}</h3>
        <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {value}
        </p>
        
        {(trend || subtitle) && (
          <div className="flex items-center gap-2 mt-2">
            {trend && (
              <span
                className={`flex items-center font-semibold text-sm ${
                  trend.direction === 'up' ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                {trend.direction === 'up' ? (
                  <TrendingUp size={14} className="mr-1" />
                ) : (
                  <TrendingDown size={14} className="mr-1" />
                )}
                {trend.value}%
              </span>
            )}
            {subtitle && (
              <span className="text-xs text-slate-400">{subtitle}</span>
            )}
          </div>
        )}
      </div>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${getVariantStyles()}`}>
        {React.cloneElement(icon as React.ReactElement, { size: 28 })}
      </div>
    </div>
  );
};
