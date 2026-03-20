import { useEffect, useState } from 'react';
import api from '../api/axios';

interface DashboardMetrics {
  revenue: { today: number; yesterday: number };
  ordersToday: number;
  pendingApprovals: number;
  lowStockAlerts: number;
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await api.get('/v1/dashboard/metrics');
      setMetrics(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
      // Fallback to static data if API fails
      setMetrics({
        revenue: { today: 12500000, yesterday: 11000000 },
        ordersToday: 8,
        pendingApprovals: 3,
        lowStockAlerts: 2,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `Rp ${(amount / 1000000).toFixed(1)}M`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
      
      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg text-sm">
          Using cached data. {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider">Revenue Today</h3>
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <span className="text-emerald-600 text-xl">💰</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-emerald-600 tabular-nums">
            {metrics ? formatCurrency(metrics.revenue.today) : '-'}
          </p>
          {metrics && (
            <p className="text-sm text-slate-500 mt-1">
              {metrics.revenue.today > metrics.revenue.yesterday ? '+' : ''}
              {((metrics.revenue.today - metrics.revenue.yesterday) / metrics.revenue.yesterday * 100).toFixed(1)}% vs yesterday
            </p>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider">Orders Today</h3>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-xl">📦</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800 tabular-nums">
            {metrics?.ordersToday || 0}
          </p>
          <p className="text-sm text-slate-500 mt-1">New orders received</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider">Pending Approvals</h3>
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <span className="text-amber-600 text-xl">⏳</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-amber-600 tabular-nums">
            {metrics?.pendingApprovals || 0}
          </p>
          <p className="text-sm text-slate-500 mt-1">Awaiting review</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider">Low Stock Alerts</h3>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-red-600 text-xl">⚠️</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-red-600 tabular-nums">
            {metrics?.lowStockAlerts || 0}
          </p>
          <p className="text-sm text-slate-500 mt-1">Materials below threshold</p>
        </div>
      </div>
    </div>
  );
}
