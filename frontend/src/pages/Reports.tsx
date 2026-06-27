import { useState, useEffect } from 'react';
import { Download, DollarSign, ShoppingBag, TrendingUp, Users, Printer, ChevronDown, XCircle, ArrowRight, AlertCircle, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../api/axios';
import { exportToCSV } from '../utils/exportUtils';

export default function Reports() {
  const [dateRange, setDateRange] = useState('This Month');
  const [revenueTab, setRevenueTab] = useState('Monthly');
  const [kpis, setKpis] = useState<any>(null);
  const [reportsData, setReportsData] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [kpiRes, reportsRes, revenueRes] = await Promise.all([
        api.get('/api/v1/dashboard/kpis'),
        api.get('/api/v1/dashboard/reports/metrics'),
        api.get('/api/v1/dashboard/charts/revenue')
      ]);
      setKpis(kpiRes.data);
      setReportsData(reportsRes.data);
      
      const mappedRevenue = revenueRes.data.map((d: any) => ({
        name: d.name,
        Revenue: d.revenue,
        Expenses: d.expenses || 0,
      }));
      setRevenueData(mappedRevenue);
    } catch (err: any) {
      console.error(err);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (reportsData?.topCustomers) {
      exportToCSV(reportsData.topCustomers, 'top_customers_report');
    }
    setIsExportMenuOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-12 print:bg-white print:p-0">
      
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Reports & Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">Insights into your business performance</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center bg-white border border-slate-200 rounded-full p-1 shadow-sm w-full sm:w-auto overflow-x-auto">
            {['This Week', 'This Month', 'Last 3 Months', 'This Year'].map(range => (
              <button 
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-4 py-1.5 text-sm font-semibold rounded-full whitespace-nowrap transition-colors ${dateRange === range ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                {range}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button 
              onClick={handlePrint}
              className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-colors bg-white shadow-sm"
              title="Print Report"
            >
              <Printer size={20} />
            </button>
            
            <div className="relative group w-full sm:w-auto">
              <button 
                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
              >
                <Download size={16} />
                Export Report
                <ChevronDown size={14} className="text-slate-400" />
              </button>
              {isExportMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg transition-all z-10 py-1">
                  <button onClick={() => { setIsExportMenuOpen(false); handlePrint(); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 font-medium">Export as PDF (Print)</button>
                  <button onClick={handleExportCSV} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 font-medium">Export as CSV</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* TOP METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
              <DollarSign size={20} />
            </div>
            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md ${kpis?.totalRevenue?.trend?.isPositive ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
              <TrendingUp size={12} className={!kpis?.totalRevenue?.trend?.isPositive ? 'rotate-180' : ''} />
              {kpis?.totalRevenue?.trend?.value || 0}%
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Revenue</p>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">{formatCurrency(kpis?.totalRevenue?.value || 0)}</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
              <ShoppingBag size={20} />
            </div>
            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md ${kpis?.grossProfit?.trend?.isPositive ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
              <TrendingUp size={12} className={!kpis?.grossProfit?.trend?.isPositive ? 'rotate-180' : ''} />
              {kpis?.grossProfit?.trend?.value || 0}%
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Gross Profit</p>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">{formatCurrency(kpis?.grossProfit?.value || 0)}</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
              <TrendingUp size={20} />
            </div>
            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md ${kpis?.conversionRate?.trend?.isPositive ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
              <TrendingUp size={12} className={!kpis?.conversionRate?.trend?.isPositive ? 'rotate-180' : ''} />
              {kpis?.conversionRate?.trend?.value || 0}%
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Conversion Rate</p>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">{kpis?.conversionRate?.value || 0}%</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
              <Users size={20} />
            </div>
            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md ${kpis?.customerAcquisitionCost?.trend?.isPositive ? 'text-red-600 bg-red-50' : 'text-emerald-600 bg-emerald-50'}`}>
              <TrendingUp size={12} className={kpis?.customerAcquisitionCost?.trend?.isPositive ? '' : 'rotate-180'} />
              {kpis?.customerAcquisitionCost?.trend?.value || 0}%
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">CAC</p>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">{formatCurrency(kpis?.customerAcquisitionCost?.value || 0)}</h3>
          </div>
        </div>

      </div>

      {/* REVENUE CHART SECTION */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-lg font-bold text-slate-900">Revenue Overview</h2>
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
            {['Daily', 'Weekly', 'Monthly'].map(tab => (
              <button 
                key={tab}
                onClick={() => setRevenueTab(tab)}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${revenueTab === tab ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="h-80 w-full mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#cbd5e1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#cbd5e1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#64748b' }}
                tickFormatter={(value) => `Rp${(value/1000000).toFixed(0)}M`}
                dx={-10}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Area type="monotone" dataKey="Expenses" stroke="#cbd5e1" strokeWidth={3} fillOpacity={1} fill="url(#colorExpenses)" />
              <Area type="monotone" dataKey="Revenue" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
            Revenue
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <div className="w-3 h-3 rounded-full bg-slate-300"></div>
            Expenses
          </div>
        </div>
      </div>

      {/* ORDERS ANALYTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Orders by Status */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Orders by Status</h2>
          
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="h-48 w-48 shrink-0 bg-slate-50 rounded-full border-[16px] border-indigo-100 relative flex items-center justify-center">
              {/* Fake Donut Chart Segments */}
              <div className="absolute inset-0 rounded-full border-[16px] border-emerald-500 clip-half right-0 transform rotate-45"></div>
              <div className="absolute inset-0 rounded-full border-[16px] border-blue-500 clip-half bottom-0 transform -rotate-45"></div>
              
              <div className="text-center">
                <span className="block text-2xl font-extrabold text-slate-900">342</span>
                <span className="block text-xs font-medium text-slate-500">Total Orders</span>
              </div>
            </div>

            <div className="flex-1 w-full space-y-3">
              {(reportsData?.ordersByStatus || []).map((status: any, index: number) => {
                const colors = ['bg-emerald-500', 'bg-indigo-500', 'bg-blue-500', 'bg-amber-500', 'bg-red-500', 'bg-purple-500', 'bg-slate-500'];
                const totalOrders = (reportsData?.ordersByStatus || []).reduce((acc: number, cur: any) => acc + cur.value, 0);
                const percent = totalOrders === 0 ? 0 : Math.round((status.value / totalOrders) * 100);
                
                return (
                  <div key={status.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}></div>
                      <span className="text-slate-600 capitalize">{status.name}</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="font-bold text-slate-900">{status.value}</span>
                      <span className="text-slate-500 font-mono w-8 text-right">{percent}%</span>
                    </div>
                  </div>
                );
              })}
              {(!reportsData?.ordersByStatus || reportsData.ordersByStatus.length === 0) && (
                <div className="text-sm text-slate-500">No data available</div>
              )}
            </div>
          </div>
        </div>

        {/* Orders by Category */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Orders by Priority</h2>
          
          <div className="space-y-5">
            {(reportsData?.ordersByPriority || []).map((priority: any, index: number) => {
              const totalOrders = (reportsData?.ordersByPriority || []).reduce((acc: number, cur: any) => acc + cur.value, 0);
              const percent = totalOrders === 0 ? 0 : Math.round((priority.value / totalOrders) * 100);
              const opacities = ['', 'opacity-90', 'opacity-80', 'opacity-70'];

              return (
                <div key={priority.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700 capitalize">{priority.name}</span>
                    <span className="font-bold text-slate-900">{priority.value} <span className="text-slate-400 font-normal ml-1">({percent}%)</span></span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div className={`bg-indigo-600 h-2.5 rounded-full ${opacities[index % opacities.length]}`} style={{ width: `${percent}%` }}></div>
                  </div>
                </div>
              );
            })}
            {(!reportsData?.ordersByPriority || reportsData.ordersByPriority.length === 0) && (
              <div className="text-sm text-slate-500">No data available</div>
            )}
          </div>
        </div>

      </div>

      {/* TOP CUSTOMERS TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900">Top Customers by Revenue</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Rank</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Customer / Company</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Orders</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Order Value</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Total Revenue</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Last Order</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {(reportsData?.topCustomers || []).map((customer: any, index: number) => (
                <tr key={customer.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 text-slate-600 font-black flex items-center justify-center shadow-sm">{index + 1}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-bold text-slate-900">{customer.companyName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center font-medium">{customer.orders}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-600">{formatCurrency(customer.revenue / (customer.orders || 1))}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-mono font-bold text-emerald-600">{formatCurrency(customer.revenue)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-500">-</td>
                </tr>
              ))}
              {(!reportsData?.topCustomers || reportsData.topCustomers.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">No customer data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
          <Link to="/dashboard/customers" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center justify-center gap-1 group">
            View All Customers
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* PRODUCTION & METRICS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Production Efficiency */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Production Efficiency</h2>
          
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm text-slate-500 font-medium mb-1">Avg Production Time</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-slate-900">2.4</span>
                <span className="text-sm font-medium text-slate-500">days</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium mb-1">On-time Delivery</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-emerald-600">94%</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium mb-1">Quality Pass Rate</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-slate-900">98.2%</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium mb-1">Rework Rate</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-red-600">1.8%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Machine Utilization */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Machine Utilization</h2>
          
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-slate-700">Offset Press 1 (Heidelberg)</span>
                <span className="font-bold text-slate-900">85%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3">
                <div className="bg-indigo-600 h-3 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-slate-700">Digital Press 1 (HP Indigo)</span>
                <span className="font-bold text-slate-900">72%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3">
                <div className="bg-indigo-600 h-3 rounded-full opacity-90" style={{ width: '72%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-slate-700">Large Format (Roland)</span>
                <span className="font-bold text-amber-600">45%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3">
                <div className="bg-amber-500 h-3 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-slate-700">Cutting Machine (Polar)</span>
                <span className="font-bold text-slate-900">60%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3">
                <div className="bg-indigo-600 h-3 rounded-full opacity-70" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* FINANCIAL SUMMARY & INVENTORY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Financial Overview */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Financial Overview</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
              <p className="text-sm font-medium text-amber-800 mb-1">Accounts Receivable</p>
              <h3 className="text-xl font-extrabold text-amber-900 tracking-tight">{formatCurrency(45000000)}</h3>
              <p className="text-xs text-amber-700 mt-2 font-medium">12 unpaid invoices</p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <p className="text-sm font-medium text-emerald-800 mb-1">Payments This Month</p>
              <h3 className="text-xl font-extrabold text-emerald-900 tracking-tight">{formatCurrency(850000000)}</h3>
              <p className="text-xs text-emerald-700 mt-2 font-medium">85 payments received</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-sm font-medium text-slate-700 mb-1">Overdue Rate</p>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">4.2%</h3>
              <p className="text-xs flex items-center gap-1 text-emerald-600 mt-2 font-bold">
                <TrendingUp size={12} className="rotate-180" /> -0.8% vs last month
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Recent Overdue Invoices</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <tbody>
                  <tr>
                    <td className="py-3 pr-4 text-sm font-bold text-slate-900">INV-2026-0042</td>
                    <td className="py-3 px-4 text-sm text-slate-600">CV Karya Abadi</td>
                    <td className="py-3 px-4 text-sm text-right font-mono">{formatCurrency(8500000)}</td>
                    <td className="py-3 pl-4 text-sm text-right">
                      <span className="inline-flex px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700">14 days late</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-sm font-bold text-slate-900">INV-2026-0058</td>
                    <td className="py-3 px-4 text-sm text-slate-600">PT Berkah Jaya</td>
                    <td className="py-3 px-4 text-sm text-right font-mono">{formatCurrency(3200000)}</td>
                    <td className="py-3 pl-4 text-sm text-right">
                      <span className="inline-flex px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700">5 days late</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Inventory Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Inventory Summary</h2>
          
          <div className="flex gap-4 mb-6">
            <div className="flex-1 text-center p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="text-2xl font-black text-slate-900">142</div>
              <div className="text-xs font-medium text-slate-500 uppercase">Total Items</div>
            </div>
            <div className="flex-1 text-center p-3 bg-amber-50 rounded-lg border border-amber-100">
              <div className="text-2xl font-black text-amber-700">5</div>
              <div className="text-xs font-medium text-amber-600 uppercase">Low Stock</div>
            </div>
            <div className="flex-1 text-center p-3 bg-red-50 rounded-lg border border-red-100">
              <div className="text-2xl font-black text-red-700">1</div>
              <div className="text-xs font-medium text-red-600 uppercase">Out of Stock</div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Critical Items</h3>
            <ul className="space-y-3">
              <li className="flex justify-between items-center p-3 border border-red-200 bg-red-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                  <span className="text-sm font-medium text-slate-900 truncate">Cyan Ink Cartridge 500ml</span>
                </div>
                <span className="text-sm font-bold text-red-700 shrink-0">0 left</span>
              </li>
              <li className="flex justify-between items-center p-3 border border-amber-200 bg-amber-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                  <span className="text-sm font-medium text-slate-900 truncate">Art Paper 150gsm (Rim)</span>
                </div>
                <span className="text-sm font-bold text-amber-700 shrink-0">2 left</span>
              </li>
              <li className="flex justify-between items-center p-3 border border-amber-200 bg-amber-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                  <span className="text-sm font-medium text-slate-900 truncate">Matte Lamination Roll</span>
                </div>
                <span className="text-sm font-bold text-amber-700 shrink-0">1 left</span>
              </li>
            </ul>
          </div>
        </div>

      </div>

      {/* EXPORT SECTION */}
      <div className="bg-indigo-600 rounded-2xl shadow-xl overflow-hidden print:hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="p-8 sm:p-10 flex flex-col sm:flex-row justify-between items-center gap-6 relative z-10">
          <div className="text-white text-center sm:text-left">
            <h2 className="text-2xl font-extrabold tracking-tight mb-2">Need a detailed breakdown?</h2>
            <p className="text-indigo-200 font-medium">Generate comprehensive reports tailored to your specific needs.</p>
          </div>
          
          <div className="flex flex-col w-full sm:w-auto gap-4">
            <select className="px-4 py-3 rounded-xl border-0 text-slate-700 font-medium shadow-sm focus:ring-2 focus:ring-white">
              <option>Full Business Report</option>
              <option>Revenue Report</option>
              <option>Order Report</option>
              <option>Customer Report</option>
              <option>Production Report</option>
            </select>
            <button onClick={handleExportCSV} className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-md hover:bg-slate-800 transition-colors active:scale-95">
              <FileText size={18} />
              Generate CSV
            </button>
          </div>
        </div>
      </div>

    </div>
  );

}
