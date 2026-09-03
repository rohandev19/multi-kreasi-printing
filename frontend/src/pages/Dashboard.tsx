// @ts-nocheck
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useRoleContext } from '../contexts/RoleContext';
import { MetricCard } from '../components/MetricCard';
import { DashboardCustomization } from '../components/DashboardCustomization';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Faders, Check, X } from '@phosphor-icons/react';
import { Skeleton } from '../components/ui/Skeleton';

export default function Dashboard() {
  const { role, user, loading: roleLoading } = useRoleContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  const [dashboardOrders, setDashboardOrders] = useState<any[]>([]);
  const [dashboardJobs, setDashboardJobs] = useState<any[]>([]);

  useEffect(() => {
    if (role && !roleLoading) {
      loadDashboard(role);
    }
  }, [role, roleLoading]);

  const loadDashboard = async (currentRole: string) => {
    setLoading(true);
    try {
      if (['Owner', 'Manager'].includes(currentRole)) {
        const [kpiRes, revRes, ordersRes, jobsRes, metricsRes] = await Promise.all([
          api.get('/api/v1/dashboard/kpis'),
          api.get('/api/v1/dashboard/charts/revenue'),
          api.get('/api/v1/orders'),
          api.get('/api/v1/production-jobs'),
          api.get('/api/v1/dashboard/metrics')
        ]);
        setMetrics({ 
          kpis: kpiRes.data, 
          revenue: revRes.data,
          summary: metricsRes.data
        });
        setDashboardOrders(Array.isArray(ordersRes.data) ? ordersRes.data : ordersRes.data?.data || []);
        setDashboardJobs(Array.isArray(jobsRes.data) ? jobsRes.data : jobsRes.data?.data || []);
      } else {
        // Fallback to legacy metrics
        const res = await api.get(`/api/v1/dashboard/metrics/${currentRole.toLowerCase()}`);
        setMetrics(res.data);
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const todayStr = new Intl.DateTimeFormat('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(new Date());

  if (roleLoading || loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton variant="text" width="18rem" height="2rem" className="mb-2" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} variant="card" height="8rem" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton variant="table" rows={5} className="h-64" />
          <Skeleton variant="card" height="16rem" />
        </div>
      </div>
    );
  }

  // --- ROLE: OWNER / MANAGER ---
  if (role === 'Owner' || role === 'Manager') {
    const pendingApprovals = dashboardOrders
      .filter(o => o.status === 'Pending_Approval')
      .slice(0, 5)
      .map(o => ({
        id: o.orderNumber || 'N/A',
        customer: o.customer?.companyName || 'Unknown',
        items: `${o.items?.length || 0} items`,
        value: Number(o.totalAmount) || 0,
        date: o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '-'
      }));

    const activeJobs = dashboardJobs
      .filter(j => j.status === 'In_Progress' || j.status === 'QC')
      .slice(0, 5)
      .map(j => ({
        id: j.jobNumber || (j.id ? j.id.slice(0,8) : 'N/A'),
        machine: j.machineId || 'Assigned Machine',
        progress: j.status === 'In_Progress' ? 50 : 90,
        status: j.status === 'QC' ? 'QC' : 'In Progress'
      }));

    const recentOrders = dashboardOrders
      .slice(0, 5)
      .map(o => ({
        id: o.orderNumber || 'N/A',
        customer: o.customer?.companyName || 'Unknown',
        items: o.items?.length || 0,
        status: o.status || 'Unknown',
        total: Number(o.totalAmount) || 0,
        date: o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '-'
      }));

    return (
      <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
        {/* Header Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {getGreeting()}, {user?.name?.split(' ')[0] || user?.fullName?.split(' ')[0] || 'User'}
            </h1>
            <p className="text-slate-500 font-medium mt-1">{todayStr}</p>
          </div>
          <div className="flex items-center gap-3">
            <select className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none">
              <option>This Week</option>
              <option>This Month</option>
              <option>Last 30 Days</option>
            </select>
            <button 
              onClick={() => setIsCustomizing(true)}
              className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
            >
              <Faders size={16} weight="regular" />
              Customize
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard 
            title="Total Revenue" 
            value={metrics?.kpis?.totalRevenue?.value || 0} 
            change={metrics?.kpis?.totalRevenue?.trend || { value: 0, isPositive: true, label: "vs last month" }} 
            icon="revenue" 
            color="emerald" 
          />
          <MetricCard 
            title="Orders Today" 
            value={metrics?.summary?.ordersToday || 0} 
            change={{ value: 0, isPositive: true, label: "vs yesterday" }} 
            icon="cart" 
            color="blue" 
          />
          <MetricCard 
            title="Pending Approvals" 
            value={metrics?.summary?.pendingApprovals || 0} 
            icon="clock" 
            color="amber" 
          />
          <MetricCard 
            title="Low Stock Alerts" 
            value={metrics?.summary?.lowStockAlerts || 0} 
            icon="alert" 
            color="red" 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Approvals Table */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-slate-800 tracking-tight">Pending Approvals</h2>
                <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-0.5 rounded-full">{pendingApprovals.length}</span>
              </div>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Order #</th>
                    <th className="px-5 py-3 font-semibold">Customer</th>
                    <th className="px-5 py-3 font-semibold">Total Value</th>
                    <th className="px-5 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingApprovals.map((order, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3 font-medium text-primary-600">{order.id}</td>
                      <td className="px-5 py-3">
                        <p className="font-semibold text-slate-800">{order.customer}</p>
                        <p className="text-xs text-slate-500 truncate max-w-[200px]">{order.items}</p>
                      </td>
                      <td className="px-5 py-3 font-medium text-slate-700">Rp {Number(order.value).toLocaleString('id-ID')}</td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-2">
                          <button className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 transition-colors" title="Approve">
                            <Check size={16} weight="regular" />
                          </button>
                          <button className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors" title="Reject">
                            <X size={16} weight="regular" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {pendingApprovals.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-5 py-8 text-center text-slate-500">No pending orders require approval.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Production Status */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">Active Production Jobs</h2>
            </div>
            <div className="p-5 space-y-5 flex-1">
              {activeJobs.map((job, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold text-slate-800">{job.id} <span className="text-slate-400 font-normal ml-1">· {job.machine}</span></span>
                    <span className="text-xs font-bold text-primary-600">{job.progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden mb-2">
                    <div className="h-full bg-primary-600 rounded-full transition-all duration-500" style={{ width: `${job.progress}%` }}></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${job.status === 'QC' ? 'bg-primary-100 text-primary-700' : 'bg-blue-100 text-blue-700'}`}>
                      {job.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Revenue Chart & Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight mb-4">Revenue Trend (Last 7 Days)</h2>
            <div className="h-64 w-full">
              {metrics?.revenue?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metrics.revenue}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{fontSize: 12, fill: '#64748b'}} tickFormatter={(v) => v.slice(5)} axisLine={false} tickLine={false} />
                    <YAxis 
                      tick={{fontSize: 12, fill: '#64748b'}} 
                      axisLine={false} 
                      tickLine={false} 
                      allowDecimals={false}
                      domain={[0, (dataMax: number) => (dataMax === 0 ? 1000000 : dataMax)]}
                      tickFormatter={(v) => {
                        if (v >= 1000000) return `Rp ${(v/1000000).toFixed(1)}M`;
                        if (v >= 1000) return `Rp ${(v/1000).toFixed(0)}K`;
                        return `Rp ${v}`;
                      }} 
                    />
                    <Tooltip 
                      formatter={(value: any) => [`Rp ${Number(value).toLocaleString('id-ID')}`, 'Revenue']} 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line type="monotone" dataKey="total" stroke="#4f46e5" strokeWidth={3} dot={{r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400">
                  Insufficient data for chart
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">Recent Orders</h2>
              <Link to="/dashboard/orders" className="text-sm font-semibold text-primary-600 hover:text-primary-700">View All &rarr;</Link>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-white border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Order</th>
                    <th className="px-5 py-3 font-semibold">Customer</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentOrders.map((order, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                      <td className="px-5 py-3 font-medium text-slate-800">
                        {order.id}
                        <p className="text-xs text-slate-400 font-normal">{order.date}</p>
                      </td>
                      <td className="px-5 py-3 text-slate-600">{order.customer}</td>
                      <td className="px-5 py-3">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                          order.status === 'Completed' || order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-primary-100 text-primary-700'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-medium text-slate-700 text-right">
                        Rp {Number(order.total).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <DashboardCustomization
          isOpen={isCustomizing}
          onClose={() => setIsCustomizing(false)}
          availableWidgets={[]}
          onSaved={() => loadDashboard(role!)}
        />
      </div>
    );
  }

  // --- FALLBACK FOR OTHER ROLES (Using Legacy Widget System) ---
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
      </div>
      
      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
        {metrics?.widgets?.map((widget: unknown) => {
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
          return null; // Ignore complex legacy widgets for now
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
