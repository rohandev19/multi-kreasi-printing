import React from 'react';

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
    bg: 'bg-emerald-100',
    text: 'text-emerald-600',
    border: 'border-emerald-200',
  },
  blue: {
    bg: 'bg-blue-100',
    text: 'text-blue-600',
    border: 'border-blue-200',
  },
  amber: {
    bg: 'bg-amber-100',
    text: 'text-amber-600',
    border: 'border-amber-200',
  },
  red: {
    bg: 'bg-red-100',
    text: 'text-red-600',
    border: 'border-red-200',
  },
  purple: {
    bg: 'bg-purple-100',
    text: 'text-purple-600',
    border: 'border-purple-200',
  },
  indigo: {
    bg: 'bg-indigo-100',
    text: 'text-indigo-600',
    border: 'border-indigo-200',
  },
};

const iconMap: Record<string, string> = {
  revenue: '💰',
  orders: '📦',
  clock: '⏳',
  alert: '⚠️',
  cogs: '⚙️',
  users: '👥',
  check: '✅',
  palette: '🎨',
  server: '🖥️',
  inbox: '📥',
  truck: '🚚',
  document: '📄',
  cart: '🛒',
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
  const iconEmoji = iconMap[icon] || '📊';

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-pulse">
        <div className="flex items-center justify-between mb-2">
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
          <div className="w-10 h-10 bg-slate-100 rounded-lg"></div>
        </div>
        <div className="h-8 bg-slate-200 rounded w-3/4 mt-4"></div>
        <div className="h-3 bg-slate-200 rounded w-1/3 mt-3"></div>
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
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider">
          {title}
        </h3>
        <div className={`w-10 h-10 ${styles.bg} rounded-lg flex items-center justify-center`}>
          <span className={`text-xl ${styles.text}`}>{iconEmoji}</span>
        </div>
      </div>
      <p className={`text-3xl font-bold tabular-nums ${styles.text}`}>
        {formatValue(value)}
      </p>
      {change && (
        <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
          <span
            className={`font-medium ${
              change.isPositive ? 'text-emerald-600' : 'text-red-600'
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
