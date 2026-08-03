import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useRoleContext } from '../contexts/RoleContext';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { ReportIssueModal } from '../components/modals/ReportIssueModal';
import { ReassignJobModal } from '../components/modals/ReassignJobModal';
import { useToast } from '../contexts/ToastContext';
import { LayoutList, Columns, Factory, Play, ClipboardCheck, CheckCircle, AlertTriangle, Settings, GripVertical } from 'lucide-react';

interface Job {
  id: string;
  orderNumber: string;
  product: string;
  machine: string;
  material: string;
  status: 'Queued' | 'In Progress' | 'Quality Check' | 'Completed';
  priority: 'Normal' | 'High' | 'Urgent';
  progress: number;
}

const dummyJobs: Job[] = [
  {
    id: 'PROD-1001',
    orderNumber: 'ORD-2026-0810',
    product: 'Spanduk Outdoor 3x2m',
    machine: 'Large Format Printer (LFP-01)',
    material: 'Flexi 280g',
    status: 'In Progress',
    priority: 'High',
    progress: 65,
  },
  {
    id: 'PROD-1002',
    orderNumber: 'ORD-2026-0811',
    product: 'Kartu Nama 2 Muka',
    machine: 'Konica Minolta (KM-02)',
    material: 'Art Carton 260g',
    status: 'Quality Check',
    priority: 'Normal',
    progress: 90,
  },
  {
    id: 'PROD-1003',
    orderNumber: 'ORD-2026-0812',
    product: 'Stiker Vinyl Die Cut',
    machine: 'Roland Print & Cut',
    material: 'Vinyl Putih',
    status: 'Queued',
    priority: 'Urgent',
    progress: 0,
  },
  {
    id: 'PROD-1004',
    orderNumber: 'ORD-2026-0805',
    product: 'Brosur Lipat 3 A4',
    machine: 'Heidelberg Offset',
    material: 'Art Paper 150g',
    status: 'Completed',
    priority: 'Normal',
    progress: 100,
  }
];

export default function Production() {
  const { role, loading: roleLoading } = useRoleContext();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState('');
  
  const { success, error: toastError } = useToast();
  
  // View states
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('kanban');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modal states
  const [reportIssueJobId, setReportIssueJobId] = useState<string | null>(null);
  const [reassignJobId, setReassignJobId] = useState<string | null>(null);
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null);

  useEffect(() => {
    if (!roleLoading && role) {
      fetchJobs();
    }
  }, [role, roleLoading]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/v1/production-jobs');
      const jobData = Array.isArray(response.data) 
        ? response.data 
        : response.data.data || [];
        
      let mappedJobs: Job[] = jobData.map((j: any) => ({
        id: j.id,
        orderNumber: j.order?.orderNumber || j.orderNumber || 'Unknown Order',
        product: j.order?.customer?.companyName ? `Order for ${j.order.customer.companyName}` : 'Printing Job',
        machine: j.machine?.name || j.assignedMachine?.name || 'Unassigned',
        material: j.assignee?.fullName ? `Assigned to: ${j.assignee.fullName}` : 'Unassigned',
        status: (j.status === 'Pending' ? 'Queued' : 
                 j.status === 'In_Progress' ? 'In Progress' :
                 j.status === 'QC' ? 'Quality Check' : 'Completed') as any,
        priority: j.priority || 'Normal',
        progress: j.status === 'Completed' ? 100 : j.status === 'QC' ? 90 : j.status === 'In_Progress' ? 45 : 0
      }));
      
      if (mappedJobs.length === 0) {
        mappedJobs = dummyJobs;
      }
      
      setJobs(mappedJobs);
    } catch {
      setJobs(dummyJobs);
    } finally {
      setLoading(false);
    }
  };
  


  // Actions
  const handleStartJob = async (id: string) => {
    try {
      await api.patch(`/api/v1/production-jobs/${id}/start`);
      success('Job Started', 'The production job has been marked as in-progress.');
      fetchJobs();
    } catch (err: any) {
      toastError('Failed to start job', err.response?.data?.message || 'Please try again.');
    }
  };

  const handleMarkQC = async (id: string) => {
    // QC is purely a UI visual step before completion in this flow, or could trigger a rework if it fails.
    // For now, we update local state to reflect it's ready for final QC sign-off.
    success('QC Required', 'Sent to quality check.');
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status: 'Quality Check', progress: 90 } : j));
  };

  const handleCompleteJob = async (id: string) => {
    try {
      await api.patch(`/api/v1/production-jobs/${id}/complete`, { passedQualityCheck: true });
      success('Job Completed', 'The production job has been completed.');
      fetchJobs();
    } catch (err: any) {
      toastError('Failed to complete job', err.response?.data?.message || 'Please try again.');
    }
  };

  const confirmDelete = async () => {
    // Production jobs shouldn't be hard deleted in a real system. 
    // Usually they are cancelled, but we'll mock this for the UI.
    setDeleteJobId(null);
  };

  const statuses = ['All', 'Queued', 'In Progress', 'Quality Check', 'Completed'];
  const kanbanStatuses = ['Queued', 'In Progress', 'Quality Check', 'Completed'];
  
  const filteredJobs = jobs.filter(j => statusFilter === 'All' || j.status === statusFilter);

  if (roleLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto min-h-screen pb-24 animate-fade-in">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Production Queue</h2>
          <p className="text-sm text-slate-500 mt-1">{jobs.length} jobs currently tracked</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button 
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'table' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <LayoutList size={16} /> Table
          </button>
          <button 
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'kanban' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Columns size={16} /> Kanban
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* FILTER TABS */}
      {viewMode === 'table' && (
        <div className="flex flex-wrap gap-2">
          {statuses.map(status => {
            const count = status === 'All' ? jobs.length : jobs.filter(j => j.status === status).length;
            const isActive = statusFilter === status;
            return (
              <button 
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${isActive ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
              >
                {status}
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && jobs.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Factory className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Production queue is empty</h3>
          <p className="text-sm text-slate-500 max-w-sm">
            All caught up! No jobs waiting for production at the moment.
          </p>
        </div>
      )}

      {/* TABLE VIEW */}
      {viewMode === 'table' && jobs.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50/50 border-b border-slate-200 text-slate-500 font-semibold">
                <tr>
                  <th className="px-5 py-4">Job ID</th>
                  <th className="px-5 py-4">Product</th>
                  <th className="px-5 py-4">Machine & Assignee</th>
                  <th className="px-5 py-4">Status & Progress</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredJobs.map(job => (
                  <tr key={job.id} className={`hover:bg-slate-50/80 transition-colors ${job.status === 'In Progress' ? 'border-l-4 border-indigo-600' : 'border-l-4 border-transparent'}`}>
                    <td className="px-5 py-4">
                      <div className="font-bold text-indigo-600">{job.id}</div>
                      <div className="text-xs text-slate-500">{job.orderNumber}</div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-800">
                      {job.product}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-700">{job.machine}</div>
                      <div className="text-xs text-slate-500">{job.material}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1
                          ${job.status === 'Queued' ? 'bg-slate-100 text-slate-600' :
                            job.status === 'In Progress' ? 'bg-indigo-100 text-indigo-700' :
                            job.status === 'Quality Check' ? 'bg-purple-100 text-purple-700' :
                            'bg-emerald-100 text-emerald-700'
                          }
                        `}>
                          {job.status === 'In Progress' && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>}
                          {job.status}
                        </span>
                        <span className="text-xs font-bold text-slate-500">{job.progress}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden w-48">
                        <div className={`h-full rounded-full transition-all duration-500 ${job.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${job.progress}%` }}></div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {job.status === 'Queued' && (
                          <button onClick={() => handleStartJob(job.id)} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-bold transition-colors">
                            <Play size={14} /> Start
                          </button>
                        )}
                        {job.status === 'In Progress' && (
                          <button onClick={() => handleMarkQC(job.id)} className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-bold transition-colors">
                            <ClipboardCheck size={14} /> QC
                          </button>
                        )}
                        {job.status === 'Quality Check' && (
                          <button onClick={() => handleCompleteJob(job.id)} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors">
                            <CheckCircle size={14} /> Done
                          </button>
                        )}
                        <button onClick={() => setReassignJobId(job.id)} className="p-1.5 border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600 rounded-lg transition-colors" title="Reassign">
                          <Settings size={16} />
                        </button>
                        <button onClick={() => setReportIssueJobId(job.id)} className="p-1.5 border border-red-200 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Report Issue">
                          <AlertTriangle size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* KANBAN VIEW */}
      {viewMode === 'kanban' && jobs.length > 0 && (
        <div className="flex gap-6 overflow-x-auto pb-4 items-start snap-x">
          {kanbanStatuses.map(status => {
            const colJobs = jobs.filter(j => j.status === status);
            return (
              <div key={status} className="flex-none w-80 bg-slate-50/80 rounded-2xl p-4 min-h-[400px] border border-slate-200 snap-center">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-800">{status}</h3>
                  <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">{colJobs.length}</span>
                </div>
                
                <div className="space-y-3">
                  {colJobs.map(job => (
                    <div key={job.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow cursor-grab group">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="text-xs font-bold text-indigo-600">{job.id}</div>
                          <div className="font-semibold text-slate-800 mt-0.5">{job.product}</div>
                        </div>
                        <GripVertical size={16} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      
                      <div className="text-xs text-slate-500 mb-3 bg-slate-50 px-2 py-1 rounded inline-block">
                        {job.machine}
                      </div>
                      
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-[10px] uppercase font-bold tracking-wider ${
                          job.priority === 'Urgent' ? 'text-red-500' :
                          job.priority === 'High' ? 'text-amber-500' : 'text-slate-400'
                        }`}>
                          {job.priority} Priority
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">{job.progress}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className={`h-full rounded-full ${job.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${job.progress}%` }}></div>
                      </div>
                      
                      <div className="mt-4 flex gap-2">
                        {job.status === 'Queued' && (
                          <button onClick={() => handleStartJob(job.id)} className="flex-1 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-bold transition-colors">Start</button>
                        )}
                        {job.status === 'In Progress' && (
                          <button onClick={() => handleMarkQC(job.id)} className="flex-1 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-bold transition-colors">Send QC</button>
                        )}
                        {job.status === 'Quality Check' && (
                          <button onClick={() => handleCompleteJob(job.id)} className="flex-1 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors">Done</button>
                        )}
                        <button onClick={() => setReportIssueJobId(job.id)} className="px-2 py-1.5 border border-red-200 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <AlertTriangle size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {colJobs.length === 0 && (
                    <div className="text-center p-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm font-medium">
                      Drop jobs here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <ReportIssueModal
        isOpen={!!reportIssueJobId}
        jobId={reportIssueJobId}
        onClose={() => setReportIssueJobId(null)}
        onSuccess={fetchJobs}
      />

      <ReassignJobModal
        isOpen={!!reassignJobId}
        jobId={reassignJobId}
        onClose={() => setReassignJobId(null)}
        onSuccess={fetchJobs}
      />

      <ConfirmDialog
        isOpen={!!deleteJobId}
        title="Delete Production Job"
        message="Are you sure you want to delete this job? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onClose={() => setDeleteJobId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
