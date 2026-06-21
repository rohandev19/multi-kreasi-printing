import { useState, useEffect } from 'react';
import { Download, DollarSign, ShoppingBag, TrendingUp, Users, Printer, ChevronDown, XCircle, ArrowRight, AlertCircle, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function Reports() {
  const [dateRange, setDateRange] = useState('This Month');
  const [revenueTab, setRevenueTab] = useState('Monthly');
  const [kpis, setKpis] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/api/v1/dashboard/kpis');
      setKpis(res.data);
    } catch (err) {
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
              <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-lg shadow-sm hover:bg-slate-50 transition-colors">
                <Download size={16} />
                Export Report
                <ChevronDown size={14} className="text-slate-400" />
              </button>
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 py-1">
                <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 font-medium">Export as PDF</button>
                <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 font-medium">Export as CSV</button>
                <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 font-medium">Export as Excel</button>
              </div>
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

        <div className="h-80 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
          <TrendingUp size={48} className="mb-2 opacity-20" />
          <p className="font-medium text-sm">Revenue chart placeholder</p>
          <p className="text-xs">Implement with Recharts/Chart.js</p>
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
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-slate-600">Completed</span>
                </div>
                <div className="flex gap-4">
                  <span className="font-bold text-slate-900">145</span>
                  <span className="text-slate-500 font-mono">42%</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                  <span className="text-slate-600">In Production</span>
                </div>
                <div className="flex gap-4">
                  <span className="font-bold text-slate-900">102</span>
                  <span className="text-slate-500 font-mono">30%</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-slate-600">Approved</span>
                </div>
                <div className="flex gap-4">
                  <span className="font-bold text-slate-900">55</span>
                  <span className="text-slate-500 font-mono">16%</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span className="text-slate-600">Pending</span>
                </div>
                <div className="flex gap-4">
                  <span className="font-bold text-slate-900">28</span>
                  <span className="text-slate-500 font-mono">8%</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-slate-600">Cancelled</span>
                </div>
                <div className="flex gap-4">
                  <span className="font-bold text-slate-900">12</span>
                  <span className="text-slate-500 font-mono">4%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Orders by Category */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Orders by Category</h2>
          
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-slate-700">Packaging & Boxes</span>
                <span className="font-bold text-slate-900">124 <span className="text-slate-400 font-normal ml-1">(36%)</span></span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5">
                <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: '36%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-slate-700">Business Cards</span>
                <span className="font-bold text-slate-900">86 <span className="text-slate-400 font-normal ml-1">(25%)</span></span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5">
                <div className="bg-indigo-600 h-2.5 rounded-full opacity-90" style={{ width: '25%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-slate-700">Brochures & Flyers</span>
                <span className="font-bold text-slate-900">65 <span className="text-slate-400 font-normal ml-1">(19%)</span></span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5">
                <div className="bg-indigo-600 h-2.5 rounded-full opacity-80" style={{ width: '19%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-slate-700">Banners & Signage</span>
                <span className="font-bold text-slate-900">42 <span className="text-slate-400 font-normal ml-1">(12%)</span></span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5">
                <div className="bg-indigo-600 h-2.5 rounded-full opacity-70" style={{ width: '12%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-slate-700">Others</span>
                <span className="font-bold text-slate-900">25 <span className="text-slate-400 font-normal ml-1">(8%)</span></span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5">
                <div className="bg-indigo-600 h-2.5 rounded-full opacity-60" style={{ width: '8%' }}></div>
              </div>
            </div>
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
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-300 text-amber-700 font-black flex items-center justify-center shadow-sm">1</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-bold text-slate-900">PT Sukses Makmur</div>
                  <div className="text-xs text-slate-500">Andi Setiawan</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center font-medium">12</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-600">{formatCurrency(12500000)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right font-mono font-bold text-emerald-600">{formatCurrency(150000000)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-500">2 days ago</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 text-slate-600 font-black flex items-center justify-center shadow-sm">2</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-bold text-slate-900">CV Karya Abadi</div>
                  <div className="text-xs text-slate-500">Budi Santoso</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center font-medium">8</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-600">{formatCurrency(10625000)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right font-mono font-bold text-emerald-600">{formatCurrency(85000000)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-500">1 week ago</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-black flex items-center justify-center shadow-sm">3</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-bold text-slate-900">PT Global Indo</div>
                  <div className="text-xs text-slate-500">Citra Lestari</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center font-medium">5</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-600">{formatCurrency(14400000)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right font-mono font-bold text-emerald-600">{formatCurrency(72000000)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-500">3 weeks ago</td>
              </tr>
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
            <button className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-md hover:bg-slate-800 transition-colors active:scale-95">
              <FileText size={18} />
              Generate Report
            </button>
          </div>
        </div>
      </div>

    </div>
  );

}
