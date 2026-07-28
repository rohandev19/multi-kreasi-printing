import React, { useState } from 'react';
import { Search, Download, Calendar, Activity, List, ChevronDown, Filter, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import api from '../api/axios';

export default function AuditLog() {
  const [viewMode, setViewMode] = useState<'table' | 'timeline'>('table');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  React.useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        // We'll import api from axios at the top
        const response = await api.get('/api/v1/audit?limit=50');
        
        // Transform backend logs to match UI expected format if needed
        const formattedLogs = (response.data.data || response.data).map((log: any) => ({
          id: log.id,
          timestamp: new Date(log.createdAt).toLocaleString('id-ID', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
          }) + ' WIB',
          user: {
            name: log.user?.fullName || 'System',
            role: log.user?.role?.name || 'System',
            initials: log.user?.fullName ? log.user.fullName.substring(0, 2).toUpperCase() : 'SY',
            color: 'bg-slate-100 text-slate-700'
          },
          action: log.action,
          resourceType: log.entityType,
          resourceId: log.entityId,
          description: `Action on ${log.entityType} (${log.entityId})`,
          ip: log.ipAddress || 'Unknown',
          changes: log.details && typeof log.details === 'object' 
            ? Object.keys(log.details).map(k => ({
                field: k,
                old: String(log.details[k]?.old || '-'),
                new: String(log.details[k]?.new || log.details[k])
              }))
            : []
        }));
        setLogs(formattedLogs);
      } catch (err) {
        setError('Failed to load audit logs.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'Created': return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
      case 'Updated': return 'bg-indigo-100 text-indigo-700 border border-indigo-200';
      case 'Deleted': return 'bg-red-100 text-red-700 border border-red-200';
      case 'Approved': return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
      case 'Rejected': return 'bg-red-100 text-red-700 border border-red-200';
      case 'Login': return 'bg-indigo-100 text-indigo-700 border border-indigo-200';
      case 'Logout': return 'bg-slate-100 text-slate-600 border border-slate-200';
      case 'Password_Changed': return 'bg-amber-100 text-amber-700 border border-amber-200';
      case 'Status_Changed': return 'bg-purple-100 text-purple-700 border border-purple-200';
      case 'Payment_Recorded': return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-12">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Audit Log</h1>
          <p className="text-sm text-slate-500 mt-1">Complete activity history across the platform</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-lg shadow-sm hover:bg-slate-50 transition-colors">
            <Download size={16} />
            CSV
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-lg shadow-sm hover:bg-slate-50 transition-colors">
            <Download size={16} />
            PDF
          </button>
        </div>
      </div>

      {/* STATISTICS BAR */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 grid grid-cols-2 md:grid-cols-4 gap-4 divide-x divide-slate-100">
        <div className="px-4 text-center md:text-left">
          <p className="text-sm text-slate-500 font-medium">Total Events Today</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">142</p>
        </div>
        <div className="px-4 text-center md:text-left">
          <p className="text-sm text-slate-500 font-medium">Active Users Today</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">8</p>
        </div>
        <div className="px-4 text-center md:text-left">
          <p className="text-sm text-slate-500 font-medium">Most Active User</p>
          <p className="text-lg font-bold text-slate-900 mt-1 truncate">Admin User</p>
        </div>
        <div className="px-4 text-center md:text-left">
          <p className="text-sm text-slate-500 font-medium">Last Activity</p>
          <p className="text-sm font-mono font-bold text-slate-900 mt-2 truncate">Just now</p>
        </div>
      </div>

      {/* FILTER BAR & VIEW TOGGLE */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          
          <div className="flex-1 w-full lg:w-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search logs..."
                className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-4 w-4 text-slate-400" />
              </div>
              <select className="block w-full pl-10 pr-10 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-indigo-600 appearance-none text-slate-700">
                <option>Today</option>
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>Custom Range</option>
              </select>
              <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-4 w-4 text-slate-400" />
              </div>
              <select className="block w-full pl-10 pr-10 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-indigo-600 appearance-none text-slate-700">
                <option value="">All Actions</option>
                <option value="Created">Created</option>
                <option value="Updated">Updated</option>
                <option value="Deleted">Deleted</option>
                <option value="Approved">Approved</option>
              </select>
              <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FileText className="h-4 w-4 text-slate-400" />
              </div>
              <select className="block w-full pl-10 pr-10 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-indigo-600 appearance-none text-slate-700">
                <option value="">All Resources</option>
                <option value="Order">Order</option>
                <option value="Invoice">Invoice</option>
                <option value="Customer">Customer</option>
                <option value="Settings">Settings</option>
              </select>
              <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg shrink-0">
            <button 
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md flex items-center justify-center transition-colors ${viewMode === 'table' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              title="Table View"
            >
              <List size={18} />
            </button>
            <button 
              onClick={() => setViewMode('timeline')}
              className={`p-1.5 rounded-md flex items-center justify-center transition-colors ${viewMode === 'timeline' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              title="Timeline View"
            >
              <Activity size={18} />
            </button>
          </div>
          
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600 bg-red-50">
            {error}
          </div>
        ) : viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Timestamp</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Resource</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Description</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {logs.map((log) => (
                  <React.Fragment key={log.id}>
                    <tr 
                      className={`hover:bg-slate-50 transition-colors cursor-pointer ${expandedRow === log.id ? 'bg-indigo-50/30' : ''}`}
                      onClick={() => setExpandedRow(expandedRow === log.id ? null : log.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-500">
                        {log.timestamp}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${log.user.color}`}>
                            {log.user.initials}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-bold text-slate-900">{log.user.name}</p>
                            <p className="text-xs text-slate-500">{log.user.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getActionBadgeColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-slate-900">{log.resourceType}</div>
                        <div className="text-xs font-mono text-indigo-600 hover:underline">{log.resourceId}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 truncate max-w-[200px]" title={log.description}>
                        {log.description}
                      </td>
                    </tr>
                    
                    {/* EXPANDED ROW DETAIL */}
                    {expandedRow === log.id && (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 bg-slate-50/80 border-b border-slate-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                            <div>
                              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Metadata</h4>
                              <div className="bg-white rounded-lg p-3 border border-slate-200 space-y-1">
                                <p className="text-sm"><span className="text-slate-500 font-medium">IP Address:</span> <span className="font-mono text-slate-900">{log.ip}</span></p>
                                <p className="text-sm"><span className="text-slate-500 font-medium">User Agent:</span> <span className="text-slate-900">Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0</span></p>
                                <p className="text-sm"><span className="text-slate-500 font-medium">Session ID:</span> <span className="font-mono text-slate-900">sess_8f92a4b...</span></p>
                              </div>
                            </div>
                            
                            {log.changes && log.changes.length > 0 && (
                              <div>
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Changes</h4>
                                <div className="bg-white rounded-lg p-3 border border-slate-200 overflow-x-auto">
                                  <table className="min-w-full text-sm font-mono">
                                    <tbody>
                                      {log.changes.map((change: any, idx: number) => (
                                        <tr key={idx} className={idx !== log.changes.length - 1 ? "border-b border-slate-100" : ""}>
                                          <td className="py-2 pr-4 font-bold text-slate-700">{change.field}:</td>
                                          <td className="py-2 pr-4 text-red-500 line-through decoration-red-300">{change.old}</td>
                                          <td className="py-2 text-slate-400">→</td>
                                          <td className="py-2 pl-4 text-emerald-600 font-bold">{change.new}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6">
            <div className="relative border-l-2 border-slate-200 ml-4 lg:ml-8 space-y-8 py-4">
              
              {/* Sticky Date Header (Mocked) */}
              <div className="sticky top-0 z-10 -ml-12 mb-8 mt-[-16px]">
                <span className="bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                  Today (August 8, 2026)
                </span>
              </div>

              {logs.slice(0, 4).map((log) => (
                <div key={log.id} className="relative pl-6 sm:pl-8 group">
                  {/* Timeline Dot */}
                  <div className={`absolute -left-[9px] top-4 w-4 h-4 rounded-full border-2 border-white shadow-sm ${log.action === 'Deleted' || log.action === 'Rejected' ? 'bg-red-500' : log.action === 'Created' || log.action === 'Approved' ? 'bg-emerald-500' : 'bg-indigo-500'}`}></div>
                  
                  {/* Content Card */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${log.user.color}`}>
                          {log.user.initials}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            <strong className="font-bold">{log.user.name}</strong> 
                            <span className="text-slate-500 mx-1">({log.user.role})</span>
                            <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getActionBadgeColor(log.action)}`}>
                              {log.action}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="text-xs font-mono text-slate-500 sm:text-right">
                        {log.timestamp.split(' ')[1]} {log.timestamp.split(' ')[2]}
                      </div>
                    </div>
                    
                    <p className="text-sm text-slate-700 mb-2">{log.description}</p>
                    
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-500 font-medium">Resource:</span>
                      <span className="font-bold text-slate-900">{log.resourceType}</span>
                      <a href="#" className="font-mono text-indigo-600 font-bold hover:underline">{log.resourceId}</a>
                    </div>
                  </div>
                </div>
              ))}

              <div className="sticky top-0 z-10 -ml-12 mb-8 mt-8">
                <span className="bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                  Yesterday (August 7, 2026)
                </span>
              </div>

              {logs.slice(4).map((log) => (
                <div key={log.id} className="relative pl-6 sm:pl-8 group">
                  {/* Timeline Dot */}
                  <div className={`absolute -left-[9px] top-4 w-4 h-4 rounded-full border-2 border-white shadow-sm ${log.action === 'Deleted' || log.action === 'Rejected' ? 'bg-red-500' : log.action === 'Created' || log.action === 'Approved' ? 'bg-emerald-500' : 'bg-indigo-500'}`}></div>
                  
                  {/* Content Card */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${log.user.color}`}>
                          {log.user.initials}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            <strong className="font-bold">{log.user.name}</strong> 
                            <span className="text-slate-500 mx-1">({log.user.role})</span>
                            <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getActionBadgeColor(log.action)}`}>
                              {log.action}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="text-xs font-mono text-slate-500 sm:text-right">
                        {log.timestamp.split(' ')[1]} {log.timestamp.split(' ')[2]}
                      </div>
                    </div>
                    
                    <p className="text-sm text-slate-700 mb-2">{log.description}</p>
                    
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-500 font-medium">Resource:</span>
                      <span className="font-bold text-slate-900">{log.resourceType}</span>
                      <a href="#" className="font-mono text-indigo-600 font-bold hover:underline">{log.resourceId}</a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PAGINATION */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing <span className="font-bold text-slate-900">1</span> to <span className="font-bold text-slate-900">50</span> of <span className="font-bold text-slate-900">1,234</span> events
          </p>
          <div className="flex gap-2">
            <button className="p-2 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-700 disabled:opacity-50 transition-colors">
              <ChevronLeft size={18} />
            </button>
            <button className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}


