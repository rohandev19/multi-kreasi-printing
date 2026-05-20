import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useRoleContext } from '../contexts/RoleContext';
import { MetricCard } from '../components/MetricCard';
import { DashboardCustomization } from '../components/DashboardCustomization';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardMetrics {
  widgets: {
    id: string;
    title: string;
    type: 'stat' | 'chart' | 'list' | 'kpi-grid' | 'recharts-line' | 'recharts-bar';
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
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [enabledWidgets, setEnabledWidgets] = useState<string[]>([]);
  const [layoutOrder, setLayoutOrder] = useState<string[]>([]);
  
  useEffect(() => {
    if (role && !roleLoading) {
      loadDashboard(role);
    }
  }, [role, roleLoading]);

  const fetchPreferences = async (roleStr: string) => {
    try {
      const response = await api.get('/api/v1/dashboard/preferences');
      let widgets = response.data.enabledWidgets || [];
      let layout = response.data.layoutOrder || [];

      // Ensure customer widgets are enabled if they are missing from preferences
      if (roleStr === 'Customer') {
        const cw = ['customer-active-orders', 'customer-completed-orders', 'customer-amount-spent', 'customer-cart'];
        if (!cw.some(w => widgets.includes(w))) {
          widgets = [...widgets, ...cw];
          layout = [...layout, ...cw];
        }
      }

      setEnabledWidgets(widgets);
      setLayoutOrder(layout);
    } catch (err) {
      console.error('Failed to load preferences', err);
    }
  };

  const loadDashboard = async (currentRole: string) => {
    setLoading(true);
    try {
      await fetchPreferences(currentRole);
      const response = await api.get(`/api/v1/dashboard/metrics/${currentRole}`);
      let allWidgets = [...(response.data.widgets || [])];

      // If Owner or Manager, fetch advanced BI widgets
      if (['owner', 'manager'].includes(currentRole.toLowerCase())) {
        try {
          const [kpiRes, revRes, prodRes] = await Promise.all([
            api.get('/api/v1/dashboard/kpis'),
            api.get('/api/v1/dashboard/charts/revenue'),
            api.get('/api/v1/dashboard/production-status')
          ]);

          allWidgets.push({
            id: 'kpis-overview',
            title: 'KPI Overview',
            type: 'kpi-grid',
            data: kpiRes.data
          });

          allWidgets.push({
            id: 'revenue-chart',
            title: '30-Day Revenue Trend',
            type: 'recharts-line',
            data: revRes.data
          });

          allWidgets.push({
            id: 'machine-utilization',
            title: 'Machine Utilization',
            type: 'recharts-bar',
            data: prodRes.data.machineUtilization
          });
        } catch (biErr) {
          console.error("Failed to fetch BI data", biErr);
        }
      }
      setMetrics({ widgets: allWidgets });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
      setMetrics({ widgets: [] });
    } finally {
      setLoading(false);
    }
  };

  // Sort and filter widgets
  let displayedWidgets = metrics?.widgets.filter(
    w => enabledWidgets.length === 0 || enabledWidgets.includes(w.id)
  ) || [];

  if (layoutOrder.length > 0) {
    displayedWidgets.sort((a, b) => {
      const idxA = layoutOrder.indexOf(a.id);
      const idxB = layoutOrder.indexOf(b.id);
      if (idxA === -1 && idxB === -1) return 0;
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });
  }

  const renderWidget = (widget: any) => {
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
    }
    
    if (widget.type === 'kpi-grid') {
      return (
        <div key={widget.id} className="col-span-full md:col-span-2 lg:col-span-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-2">
           <MetricCard title="Total Revenue" value={`$${(widget.data.totalRevenue?.value || 0).toLocaleString()}`} change={widget.data.totalRevenue?.trend} icon="revenue" color="emerald" />
           <MetricCard title="Gross Profit" value={`$${(widget.data.grossProfit?.value || 0).toLocaleString()}`} change={widget.data.grossProfit?.trend} icon="revenue" color="indigo" />
           <MetricCard title="Conversion Rate" value={`${widget.data.conversionRate?.value || 0}%`} change={widget.data.conversionRate?.trend} icon="chart" color="blue" />
           <MetricCard title="CAC (Acquisition)" value={`$${(widget.data.customerAcquisitionCost?.value || 0).toLocaleString()}`} change={widget.data.customerAcquisitionCost?.trend} icon="users" color="amber" />
        </div>
      );
    }

    if (widget.type === 'recharts-line') {
      return (
        <div key={widget.id} className="col-span-full lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-slate-800 font-semibold mb-4">{widget.title}</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={widget.data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{fontSize: 12, fill: '#64748b'}} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{fontSize: 12, fill: '#64748b'}} />
                <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']} />
                <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    }

    if (widget.type === 'recharts-bar') {
      return (
        <div key={widget.id} className="col-span-full lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-slate-800 font-semibold mb-4">{widget.title}</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={widget.data} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" tick={{fontSize: 12, fill: '#64748b'}} domain={[0, 100]} />
                <YAxis type="category" dataKey="machineName" tick={{fontSize: 12, fill: '#64748b'}} width={100} />
                <Tooltip formatter={(value) => [`${Number(value)}%`, 'Utilization']} />
                <Bar dataKey="utilization" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    }

    if (widget.type === 'list') {
      return (
        <div key={widget.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 col-span-full md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-800 font-semibold">{widget.title}</h3>
            <div className={`w-8 h-8 bg-${widget.color || 'blue'}-100 rounded-lg flex items-center justify-center`}>
              <span className={`text-${widget.color || 'blue'}-600`}>⚙️</span>
            </div>
          </div>
          <div className="space-y-3">
            {widget.data?.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                <span className="text-sm text-slate-600">{item.label}</span>
                <span className={`font-semibold ${item.color || 'text-slate-800'}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
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

  const exportToCSV = () => {
    if (!metrics) return;
    
    // We export a simple summary of current widgets
    const rows = [
      ['Widget Title', 'Type', 'Data Summary']
    ];

    displayedWidgets.forEach((w) => {
      let dataSummary = '';
      if (w.type === 'stat') {
        dataSummary = `${w.value}`;
      } else if (w.type === 'kpi-grid' && w.data) {
        dataSummary = `Revenue: $${w.data.totalRevenue?.value}, Conversion: ${w.data.conversionRate?.value}%`;
      } else if (w.type === 'recharts-line' && w.data) {
        dataSummary = `Total points: ${w.data.length}`;
      } else if (w.type === 'recharts-bar' && w.data) {
        dataSummary = `Total items: ${w.data.length}`;
      } else if (w.type === 'list' && w.data) {
        dataSummary = w.data.map((i: any) => `${i.label}: ${i.value}`).join(' | ');
      }

      rows.push([w.title, w.type, dataSummary]);
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `dashboard_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            className="text-sm px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2"
          >
            <span>📥</span> Export CSV
          </button>
          <button
            onClick={() => setIsCustomizing(true)}
            className="text-sm px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2"
          >
            <span>⚙️</span> Customize
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Main Grid for widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
        {displayedWidgets.map(renderWidget)}
        
        {(!metrics?.widgets || metrics.widgets.length === 0) && !loading && (
          <div className="col-span-full bg-white p-8 rounded-xl border border-dashed border-slate-300 text-center text-slate-500">
            No dashboard widgets available for your role.
          </div>
        )}
      </div>

      <DashboardCustomization
        isOpen={isCustomizing}
        onClose={() => setIsCustomizing(false)}
        availableWidgets={metrics?.widgets.map(w => ({ id: w.id, title: w.title })) || []}
        onSaved={() => loadDashboard(role!)}
      />
    </div>
  );
}
