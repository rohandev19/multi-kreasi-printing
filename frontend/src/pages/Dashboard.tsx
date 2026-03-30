import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useRoleContext } from '../contexts/RoleContext';
import { MetricCard } from '../components/MetricCard';

interface DashboardMetrics {
  widgets: {
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
  }[];
}

export default function Dashboard() {
  const { role, loading: roleLoading } = useRoleContext();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (role && !roleLoading) {
      fetchMetrics(role);
    }
  }, [role, roleLoading]);

  const fetchMetrics = async (currentRole: string) => {
    setLoading(true);
    try {
      const response = await api.get(`/v1/dashboard/metrics/${currentRole}`);
      setMetrics(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
      // Fallback
      setMetrics({
        widgets: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (roleLoading || (loading && !metrics)) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard loading={true} title="" value="" icon="" color="blue" />
          <MetricCard loading={true} title="" value="" icon="" color="blue" />
          <MetricCard loading={true} title="" value="" icon="" color="blue" />
          <MetricCard loading={true} title="" value="" icon="" color="blue" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
      
      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics?.widgets.map((widget) => {
          if (widget.type === 'stat') {
            return (
              <MetricCard
                key={widget.id}
                title={widget.title}
                value={widget.value}
                change={widget.trend}
                icon={widget.icon || 'chart'}
                color={widget.color as any || 'blue'}
              />
            );
          } else if (widget.type === 'list') {
            return (
              <div key={widget.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider">{widget.title}</h3>
                  <div className={`w-10 h-10 bg-${widget.color || 'blue'}-100 rounded-lg flex items-center justify-center`}>
                    <span className={`text-xl text-${widget.color || 'blue'}-600`}>⚙️</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {widget.data?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">{item.label}</span>
                      <span className={`font-semibold ${item.color || 'text-slate-800'}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          }
          return null;
        })}
        {(!metrics?.widgets || metrics.widgets.length === 0) && !loading && (
          <div className="col-span-full bg-white p-8 rounded-xl border border-dashed border-slate-300 text-center text-slate-500">
            No dashboard widgets available for your role.
          </div>
        )}
      </div>
    </div>
  );
}
