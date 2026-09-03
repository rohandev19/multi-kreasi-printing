import React from 'react';
import { Play, CheckCircle, AlertCircle, Edit, Trash2 } from 'lucide-react';

interface ProductionJob {
  id: string;
  order: { orderNumber: string };
  machine: { name: string } | null;
  status: string;
  startTime: string | null;
  assignee: { fullName: string } | null;
  dueDate?: string; // Optional for now, assuming order has it or it's added later
}

interface ProductionTableProps {
  jobs: ProductionJob[];
  userRole: string;
  loading: boolean;
  onStartJob: (id: string) => void;
  onCompleteJob: (id: string) => void;
  onReportIssue: (id: string) => void;
  onReassign?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const statusColors: Record<string, string> = {
  Queue: 'bg-gray-100 text-gray-700',
  Assigned: 'bg-blue-100 text-blue-700',
  In_Progress: 'bg-purple-100 text-purple-700',
  Quality_Check: 'bg-indigo-100 text-indigo-700',
  Completed: 'bg-emerald-100 text-emerald-700',
};

export const ProductionTable: React.FC<ProductionTableProps> = ({
  jobs,
  userRole,
  loading,
  onStartJob,
  onCompleteJob,
  onReportIssue,
  onReassign,
  onDelete,
}) => {
  const formatStatus = (status: string) => status.replace(/_/g, ' ');

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const canManageJobs = userRole === 'Owner' || userRole === 'Manager';

  return (
    <>
      {/* Mobile Card Layout */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {jobs.map((job) => (
          <div key={job.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-3 flex flex-col">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium text-slate-900">#{job.id.slice(0, 8)}</div>
                <div className="text-xs text-slate-500">
                  {job.dueDate ? `Due: ${new Date(job.dueDate).toLocaleDateString('id-ID')}` : 'No deadline'}
                </div>
              </div>
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusColors[job.status] || 'bg-gray-100 text-gray-700'}`}>
                {formatStatus(job.status)}
              </span>
            </div>
            
            <div className="text-sm space-y-1">
              <div>
                <span className="text-slate-500 mr-2">Order:</span>
                <span className="font-medium text-slate-900">{job.order?.orderNumber || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 mr-2">Machine:</span>
                <span className="text-slate-900">{job.machine?.name || 'Unassigned'}</span>
              </div>
              <div>
                <span className="text-slate-500 mr-2">Staff:</span>
                <span className="text-slate-900">{job.assignee?.fullName || 'Unassigned'}</span>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => onStartJob(job.id)}
                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Start Job"
              >
                <Play size={18} />
              </button>
              <button
                onClick={() => onCompleteJob(job.id)}
                className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                title="Complete Job"
              >
                <CheckCircle size={18} />
              </button>
              <button
                onClick={() => onReportIssue(job.id)}
                className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                title="Report Issue"
              >
                <AlertCircle size={18} />
              </button>
              {canManageJobs && onReassign && (
                <button
                  onClick={() => onReassign(job.id)}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Reassign"
                >
                  <Edit size={18} />
                </button>
              )}
              {canManageJobs && onDelete && (
                <button
                  onClick={() => onDelete(job.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Job"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>
        ))}
        {jobs.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">
            No production jobs found.
          </div>
        )}
      </div>

      {/* Desktop Table Layout */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Job ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Assigned Machine
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Assigned Staff
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Deadline
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {jobs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                  No production jobs found.
                </td>
              </tr>
            ) : (
              jobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    #{job.id.slice(0, 8)}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {job.order?.orderNumber || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {job.machine?.name || 'Unassigned'}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {job.assignee?.fullName || 'Unassigned'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[job.status] || 'bg-gray-100 text-gray-700'}`}>
                      {formatStatus(job.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {job.dueDate ? new Date(job.dueDate).toLocaleDateString('id-ID') : '-'}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => onStartJob(job.id)}
                      className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                      title="Start Job"
                    >
                      <Play size={18} />
                    </button>
                    <button
                      onClick={() => onCompleteJob(job.id)}
                      className="p-1 text-slate-400 hover:text-emerald-600 transition-colors"
                      title="Complete Job"
                    >
                      <CheckCircle size={18} />
                    </button>
                    <button
                      onClick={() => onReportIssue(job.id)}
                      className="p-1 text-slate-400 hover:text-amber-600 transition-colors"
                      title="Report Issue"
                    >
                      <AlertCircle size={18} />
                    </button>
                    {canManageJobs && onReassign && (
                      <button
                        onClick={() => onReassign(job.id)}
                        className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                        title="Reassign"
                      >
                        <Edit size={18} />
                      </button>
                    )}
                    {canManageJobs && onDelete && (
                      <button
                        onClick={() => onDelete(job.id)}
                        className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                        title="Delete Job"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
